import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.base import Base
from database.database import get_db
from main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_create_request():
    login = client.post("/auth/login", json={"name": "Patient", "phone": "3333333333", "role": "patient"})
    token = login.json()["token"]

    response = client.post("/requests/", json={
        "blood_group": "O+",
        "units_required": 2,
        "hospital_name": "Test Hospital",
        "hospital_address": "123 Main St",
        "urgency": "high"
    }, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 201
    data = response.json()
    assert data["blood_group"] == "O+"
    assert data["status"] == "pending"

def test_get_requests():
    response = client.get("/requests/")
    assert response.status_code == 200

def test_cancel_request():
    login = client.post("/auth/login", json={"name": "Patient2", "phone": "2222222222", "role": "patient"})
    token = login.json()["token"]

    req = client.post("/requests/", json={
        "blood_group": "A-",
        "units_required": 1,
        "hospital_name": "City Hospital",
        "urgency": "medium"
    }, headers={"Authorization": f"Bearer {token}"})

    request_id = req.json()["id"]
    response = client.patch(f"/requests/{request_id}/cancel", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"
