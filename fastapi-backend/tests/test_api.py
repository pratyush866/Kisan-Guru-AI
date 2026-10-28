from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
  """
  Verifies that the API gateway health check returns 200 OK
  with the correct environment metadata.
  """
  response = client.get("/health")
  assert response.status_code == 200
  data = response.json()
  assert data["status"] == "healthy"
  assert "environment" in data
  assert data["api_version"] == "1.0.0"

def test_ai_chatbot_wheat_yellowing():
  """
  Verifies that posting an query about wheat rust returns the correct
  categorization and remedy details in the structured response.
  """
  payload = {
    "query": "My wheat leaves are turning yellow. What should I do?",
    "language": "english"
  }
  response = client.post("/api/ai/chat", json=payload)
  assert response.status_code == 200
  data = response.json()
  assert data["category"] == "disease"
  assert "Puccinia striiformis" in data["data"]["problem"]
  assert "Propiconazole" in data["data"]["solution"]
  assert "timestamp" in data

def test_ai_chatbot_tomato_blight_hindi():
  """
  Verifies that matching tomato blight in Hindi returns the correct
  localized disease identification.
  """
  payload = {
    "query": "टमाटर में दाग लग गया है, ब्लाइट रोग के लक्षण हैं।",
    "language": "hindi"
  }
  response = client.post("/api/ai/chat", json=payload)
  assert response.status_code == 200
  data = response.json()
  assert data["category"] == "disease"
  assert "टमाटर में अगेती झुलसा" in data["data"]["problem"]
  assert "मैनकोजेब" in data["data"]["solution"]

def test_ai_chatbot_fallback():
  """
  Verifies that sending an unknown query falls back to a generic category
  and structured suggestion card.
  """
  payload = {
    "query": "How to increase output of my fields?",
    "language": "english"
  }
  response = client.post("/api/ai/chat", json=payload)
  assert response.status_code == 200
  data = response.json()
  assert data["category"] == "crop"
  assert "Information lookup" in data["data"]["problem"]
  assert "rotation of crops" in data["data"]["prevention"]
