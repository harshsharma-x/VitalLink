import pytest
from fastapi.testclient import TestClient
from tests.test_auth import client, setup_db

def test_create_donor():
    # First login as donor to create user
    login = client.post("/auth/login", json={"name": "Donor", "phone": "5555555555", "role": "donor", "blood_group": "A+"})
    user_id = login.json()["user_id"]

    response = client.post("/donors/", json={
        "user_id": str(user_id),
        "blood_group": "A+",
        "availability": True,
        "latitude": 28.6139,
        "longitude": 77.2090
    })
    assert response.status_code == 201
    assert response.json()["blood_group"] == "A+"

def test_get_donors():
    response = client.get("/donors/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_update_availability():
    login = client.post("/auth/login", json={"name": "Donor2", "phone": "4444444444", "role": "donor", "blood_group": "B+"})
    user_id = login.json()["user_id"]
    donor = client.post("/donors/", json={"user_id": str(user_id), "blood_group": "B+"})
    donor_id = donor.json()["id"]

    response = client.patch(f"/donors/{donor_id}/availability", json={"availability": True, "latitude": 28.6, "longitude": 77.2})
    assert response.status_code == 200
    assert response.json()["availability"] == True
