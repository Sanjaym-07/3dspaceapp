import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.services.validation_engine import TopologyValidationEngine
from app.models.entities import Property, Floor, Building

client = TestClient(app)

def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "VERTICAD" in data["service"]

def test_get_parcels():
    response = client.get("/api/parcels")
    assert response.status_code == 200
    parcels = response.json()
    assert len(parcels) >= 3
    parcel_ids = [p["id"] for p in parcels]
    assert "TN-CHN-P0428" in parcel_ids

def test_get_buildings():
    response = client.get("/api/buildings")
    assert response.status_code == 200
    buildings = response.json()
    assert len(buildings) >= 3
    b_names = [b["name"] for b in buildings]
    assert "Meridian Heights" in b_names
    assert "Green Tower" in b_names
    assert "Civic Plaza" in b_names

def test_get_building_floors():
    response = client.get("/api/buildings/B01/floors")
    assert response.status_code == 200
    floors = response.json()
    assert len(floors) >= 14 # 12 floors + 2 basements + ground

def test_ulpin_generation():
    payload = {
        "country_code": "IN",
        "state_code": "TN",
        "city_code": "CHN",
        "parcel_id": "P0428",
        "building_id": "B01",
        "floor_code": "F07",
        "unit_code": "U02",
        "usage_type": "Residential"
    }
    response = client.post("/api/ulpin/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prototype_3d_ulpin"] == "IN-TN-CHN-P0428-B01-F07-U02"
    assert data["breakdown"]["unit"] == "U02 (Volumetric Demarcated Unit)"

def test_ulpin_retrieval():
    response = client.get("/api/ulpin/IN-TN-CHN-P0428-B01-F07-U02")
    assert response.status_code == 200
    data = response.json()
    assert data["property"]["id"] == "B01-F07-U02"
    assert data["property"]["elevation_min_m"] == 21.0
    assert data["property"]["elevation_max_m"] == 24.2
    assert data["property"]["owner_name"] == "Karthik R"

def test_topology_validation_rules():
    db = SessionLocal()
    try:
        validator = TopologyValidationEngine(db)
        summary = validator.run_all_rules()
        assert summary["total_rules"] == 9
        assert summary["warning_count"] >= 1 # Intentional F07-U03 overlap
        
        # Verify overlap rule caught intentional test case
        results = summary["results"]
        rule3_results = [r for r in results if r.rule_id == "RULE_3" and r.status in ["WARNING", "ERROR"]]
        assert len(rule3_results) > 0
        assert "overlaps" in rule3_results[0].message
    finally:
        db.close()

def test_assistant_query():
    response = client.post("/api/assistant/query", json={"query": "Which floors have validation issues?"})
    assert response.status_code == 200
    data = response.json()
    assert "validation" in data["answer"].lower() or "alert" in data["answer"].lower() or "flawed" in str(data).lower()
