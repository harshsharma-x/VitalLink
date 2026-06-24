import pytest
from fastapi.testclient import TestClient
from tests.test_auth import client, setup_db

def test_start_matching():
    # Create patient and request
    patient = client.post("/auth/login", json={"name": "Pat", "phone": "1111111111", "role": "patient"})
    p_token = patient.json()["token"]

    req = client.post("/requests/", json={
        "blood_group": "O+",
        "units_required": 1,
        "hospital_name": "Emergency Hospital",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "urgency": "high"
    }, headers={"Authorization": f"Bearer {p_token}"})
    request_id = req.json()["id"]

    # Create donor
    donor = client.post("/auth/login", json={"name": "Don", "phone": "0000000000", "role": "donor", "blood_group": "O+"})
    user_id = donor.json()["user_id"]
    client.post("/donors/", json={
        "user_id": str(user_id),
        "blood_group": "O+",
        "availability": True,
        "latitude": 28.6140,
        "longitude": 77.2091
    })

    response = client.post("/matching/start", json={"request_id": str(request_id)})
    assert response.status_code == 200
    data = response.json()
    assert "matches" in data
    assert data["donors_alerted"] >= 0

def test_get_matches():
    # This test depends on test_start_matching data
    pass
