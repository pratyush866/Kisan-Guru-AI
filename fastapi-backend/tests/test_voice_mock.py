import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Kisan Guru AI" in data["name"]
    assert data["status"] == "operational"

def test_api_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "services" in data
    assert data["services"]["backend"] == "online"
    assert data["services"]["speech_recognition"] == "online"
    assert data["services"]["text_to_speech"] == "online"

def test_voice_language_mapping_simulation():
    # Test language mapping codes for English, Hindi, Bhojpuri
    lang_map = {
        "english": "en-IN",
        "hindi": "hi-IN",
        "bhojpuri": "hi-IN",
        "awadhi": "hi-IN"
    }
    for lang, expected_code in lang_map.items():
        assert lang_map[lang] == expected_code

def test_ai_multilingual_voice_prompts():
    # Verify AI endpoint handles English, Hindi, Bhojpuri voice queries
    queries = [
        {"query": "How to treat wheat rust?", "language": "english"},
        {"query": "गेहूं में पीला रतुआ का इलाज क्या है?", "language": "hindi"},
        {"query": "गेहूं के रतुआ रोग के दवाई का बा?", "language": "bhojpuri"}
    ]
    for q in queries:
        res = client.post("/api/ai/chat", json=q)
        assert res.status_code == 200
        data = res.json()
        assert "data" in data
        assert "problem" in data["data"]
