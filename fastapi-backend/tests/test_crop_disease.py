import pytest
import io
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from app.main import app
from app.modules.auth.router import get_current_user
from app.core.database import get_db_session
from app.core.models import User, DiagnosticReport

# MOCK ORM CLASSES FOR ISOLATED IN-MEMORY TESTING
class MockUser:
    def __init__(self):
        self.id = "test-user-uuid-12345"
        self.phone = "+919876543210"
        self.name = "Ramesh Kumar"
        self.role = "farmer"
        self.created_at = datetime.now(timezone.utc)

class MockScalars:
    def __init__(self, data=None):
        self.data = data or []
    def all(self):
        return self.data

class MockResult:
    def __init__(self, data=None):
        self.data = data or []
    def scalars(self):
        return MockScalars(self.data)
    def scalar_one_or_none(self):
        return self.data[0] if self.data else None

class MockDbSession:
    def __init__(self):
        self.added_records = []
        self.deleted_records = []
        self.flushed = False

    def add(self, record):
        self.added_records.append(record)
        import uuid
        if hasattr(record, "id") and getattr(record, "id") is None:
            record.id = str(uuid.uuid4())
        if hasattr(record, "created_at") and getattr(record, "created_at") is None:
            record.created_at = datetime.now(timezone.utc)
        if hasattr(record, "timestamp") and getattr(record, "timestamp") is None:
            record.timestamp = datetime.now(timezone.utc)

    async def flush(self):
        self.flushed = True

    async def commit(self):
        pass

    async def rollback(self):
        pass

    async def close(self):
        pass

    async def delete(self, record):
        self.deleted_records.append(record)

    async def execute(self, query):
        # Mock execution returns empty collections or simple mocked entities
        return MockResult([])

# DEPENDENCY OVERRIDES FOR PYTEST RUNTIME
async def mock_current_user_override():
    return MockUser()

async def mock_db_session_override():
    db = MockDbSession()
    try:
        yield db
    finally:
        pass

# REGISTER TEST CLIENT INJECTIONS
app.dependency_overrides[get_current_user] = mock_current_user_override
app.dependency_overrides[get_db_session] = mock_db_session_override

client = TestClient(app)

# 1. TEST: HEALTH CHECK GATEWAY
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

# 2. TEST: SECURE UPLOAD INVALID FILE EXTENSION
def test_diagnose_unsupported_format():
    file_payload = {
        "image": ("test_leaf.txt", io.BytesIO(b"dummy text content"), "text/plain")
    }
    form_payload = {
        "crop_name": "Wheat",
        "model_arch": "efficientnet"
    }
    response = client.post(
        "/api/crops/diagnose",
        data=form_payload,
        files=file_payload
    )
    assert response.status_code == 400
    assert "Unsupported image format" in response.json()["detail"]

# 3. TEST: SECURE UPLOAD SIZE EXCEEDED (SIMULATE > 5MB)
def test_diagnose_oversized_file():
    large_payload = b"0" * (6 * 1024 * 1024) # 6MB
    file_payload = {
        "image": ("leaf.png", io.BytesIO(large_payload), "image/png")
    }
    form_payload = {
        "crop_name": "Wheat"
    }
    response = client.post(
        "/api/crops/diagnose",
        data=form_payload,
        files=file_payload
    )
    assert response.status_code == 400
    assert "exceeds maximum limit" in response.json()["detail"]

# 4. TEST: CROP DIAGNOSIS EXECUTION (WHEAT YELLOW RUST SUCCESS)
def test_diagnose_wheat_yellow_rust_success():
    dummy_image = b"crop_image_bytes_png_representation"
    file_payload = {
        "image": ("wheat_yellow_leaf.png", io.BytesIO(dummy_image), "image/png")
    }
    form_payload = {
        "crop_name": "Wheat",
        "model_arch": "resnet",
        "location_lat": 25.5941,
        "location_lon": 85.1376
    }
    response = client.post(
        "/api/crops/diagnose",
        data=form_payload,
        files=file_payload
    )
    assert response.status_code == 201
    data = response.json()
    assert data["disease_detected"] == "Yellow Rust (Puccinia striiformis)"
    assert data["confidence"] > 0.70
    assert "Propiconazole" in data["remedy"]
    assert data["severity"] in ["Low", "Medium", "High", "Critical"]
    assert data["affected_area"] > 0.0

# 5. TEST: DIAGNOSTIC MODEL ARCHITECTURES ATTRIBUTIONS
def test_diagnose_model_architectures_influences():
    dummy_image = b"crop_image_bytes_png_representation"
    
    # Run using Vision Transformer (ViT)
    response_vit = client.post(
        "/api/crops/diagnose",
        data={"crop_name": "Tomato", "model_arch": "vit"},
        files={"image": ("tomato_blight_leaf.png", io.BytesIO(dummy_image), "image/png")}
    )
    assert response_vit.status_code == 201
    assert response_vit.json()["confidence"] >= 0.90 # ViT has higher baseline confidence

    # Run using custom CNN
    response_cnn = client.post(
        "/api/crops/diagnose",
        data={"crop_name": "Tomato", "model_arch": "cnn"},
        files={"image": ("tomato_blight_leaf.png", io.BytesIO(dummy_image), "image/png")}
    )
    assert response_cnn.status_code == 201
    assert response_cnn.json()["confidence"] <= 0.88 # CNN has lower baseline confidence

# 6. TEST: HEALTHY CANOPY DETECTION
def test_diagnose_healthy_foliage():
    dummy_image = b"crop_image_bytes_png_representation"
    file_payload = {
        "image": ("paddy_healthy_leaf.png", io.BytesIO(dummy_image), "image/png")
    }
    form_payload = {
        "crop_name": "Rice"
    }
    response = client.post(
        "/api/crops/diagnose",
        data=form_payload,
        files=file_payload
    )
    assert response.status_code == 201
    data = response.json()
    assert data["disease_detected"] == "Healthy Plant"
    assert "स्वस्थ" in data["remedy"] # Contains Hindi healthy confirmation

# 7. TEST: DISEASE DATABASE DIRECTORY CATALOG
def test_disease_library_retrieval():
    response = client.get("/api/crops/diseases")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 16 # Includes 16 distinct crop entries
    # Assert on index details
    wheat_rust = next(item for item in data if item["crop"] == "Wheat")
    assert "Puccinia striiformis" in wheat_rust["disease"]
    assert "Propiconazole" in wheat_rust["chemical_treatment"]

# 8. TEST: DIAGNOSTIC LEDGER HISTORIES
def test_history_ledger_retrieval():
    response = client.get("/api/crops/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# 9. TEST: COMPREHENSIVE ANALYTICS SUMMARY
def test_analytics_metrics_compilation():
    response = client.get("/api/crops/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "total_scans" in data
    assert "healthy_count" in data
    assert "infected_count" in data
    assert "trend_data" in data
    assert len(data["recent_alerts"]) > 0

# 10. TEST: RATE LIMITING & SECURITY RESPONSE HEADERS
def test_security_headers_middleware():
    response = client.get("/health")
    assert "X-Frame-Options" in response.headers
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "X-Content-Type-Options" in response.headers
    assert response.headers["X-Content-Type-Options"] == "nosniff"
