import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone
from typing import Optional

from app.main import app
from app.modules.auth.router import get_current_user
from app.core.database import get_db_session
from app.core.models import User

# MOCK IMPLEMENTATION CLONES FOR database sessions
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
  def first(self):
    return self.data[0] if self.data else None

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
    # Standard dummy response for queries
    return MockResult([])

# Pytest Dependency Injection Hooks
async def mock_current_user_override():
  return MockUser()

async def mock_db_session_override():
  db = MockDbSession()
  try:
    yield db
  finally:
    pass

# Setup overrides
app.dependency_overrides[get_current_user] = mock_current_user_override
app.dependency_overrides[get_db_session] = mock_db_session_override

client = TestClient(app)

# 1. TEST: AI RECOMMENDATION ENGINE POST
def test_irrigation_recommendation_success():
  payload = {
    "crop_type": "Wheat",
    "crop_stage": "Vegetative",
    "soil_type": "Loam",
    "soil_moisture_pct": 35.0,
    "temperature": 32.0,
    "humidity": 65.0,
    "rainfall": 0.0,
    "wind_speed": 10.0,
    "solar_radiation": 400.0,
    "field_size": 2.5,
    "water_availability": 15000.0,
    "ground_water_level": 12.0,
    "canal_water": True,
    "irrigation_method_pref": "Drip",
    "farmer_budget": 5000.0
  }
  response = client.post("/api/irrigation/recommendation", json=payload)
  assert response.status_code == 201
  data = response.json()
  assert data["crop_type"] == "Wheat"
  assert data["recommended_water_liters"] > 0
  assert data["recommended_duration_minutes"] > 0
  assert "Drip" in data["irrigation_method"]
  assert data["confidence_score"] > 0.0
  assert len(data["explanation"]) > 0

# 2. TEST: SOIL INTEGRATION AND SCORE FORMULA
def test_soil_report_scoring():
  payload = {
    "soil_type": "Loam",
    "moisture_pct": 45.0,
    "temperature_c": 24.5,
    "ph": 6.7,
    "organic_matter_pct": 2.8,
    "nitrogen": 72.0,
    "phosphorus": 45.0,
    "potassium": 48.0,
    "compaction_psi": 120.0,
    "drainage_class": "Good",
    "water_holding_capacity_pct": 60.0
  }
  response = client.post("/api/irrigation/soil", json=payload)
  assert response.status_code == 201
  data = response.json()
  assert data["soil_type"] == "Loam"
  assert data["soil_health_score"] > 0.0
  assert data["soil_fertility_score"] > 0.0
  assert data["ph"] == 6.7
  assert data["nitrogen"] == 72.0

# 3. TEST: GET SOIL REPORT HISTORY
def test_soil_report_history():
  response = client.get("/api/irrigation/soil/history")
  assert response.status_code == 200
  assert isinstance(response.json(), list)

# 4. TEST: UPLOAD SENSOR TELEMETRY
def test_sensor_telemetry_upload():
  payload = {
    "device_id": "ESP32_BLOCK_A",
    "sensor_type": "moisture",
    "value": 41.5
  }
  response = client.post("/api/irrigation/sensors", json=payload)
  assert response.status_code == 201
  data = response.json()
  assert data["device_id"] == "ESP32_BLOCK_A"
  assert data["sensor_type"] == "moisture"
  assert data["value"] == 41.5

# 5. TEST: GET LATEST SENSOR TELEMETRY LIST
def test_get_latest_sensors():
  response = client.get("/api/irrigation/sensors/latest")
  assert response.status_code == 200
  assert isinstance(response.json(), list)

# 6. TEST: WATER USAGE LOGS POST
def test_create_water_record():
  payload = {
    "water_applied_liters": 4500.0,
    "irrigation_method": "Drip",
    "source": "Borewell",
    "cost": 120.0,
    "duration_minutes": 40
  }
  response = client.post("/api/irrigation/water-records", json=payload)
  assert response.status_code == 201
  data = response.json()
  assert data["water_applied_liters"] == 4500.0
  assert data["irrigation_method"] == "Drip"
  assert data["cost"] == 120.0
  assert data["duration_minutes"] == 40

# 7. TEST: GET WATER USAGE HISTORY
def test_get_water_records_history():
  response = client.get("/api/irrigation/water-records/history")
  assert response.status_code == 200
  assert isinstance(response.json(), list)

# 8. TEST: GET PERSONALIZED CALENDAR
def test_get_irrigation_schedule():
  response = client.get("/api/irrigation/schedule?crop_type=Wheat&stage=Vegetative&field_size=2.5&method=Drip")
  assert response.status_code == 200
  data = response.json()
  assert "daily_schedule" in data
  assert "weekly_schedule" in data
  assert "growth_stage_plan" in data
  assert "emergency_plan" in data
  assert len(data["daily_schedule"]) > 0

# 9. TEST: POLLING ACTIVE ALERTS
def test_get_irrigation_alerts():
  response = client.get("/api/irrigation/alerts")
  assert response.status_code == 200
  data = response.json()
  assert "alerts" in data
  assert isinstance(data["alerts"], list)

# 10. TEST: WATER CONSUMPTION ANALYTICS
def test_get_water_analytics():
  response = client.get("/api/irrigation/analytics")
  assert response.status_code == 200
  data = response.json()
  assert "total_water_used_liters" in data
  assert "total_water_saved_liters" in data
  assert "water_efficiency_score" in data
  assert "expected_savings_pct" in data
  assert len(data["monthly_usage_liters"]) == 6
