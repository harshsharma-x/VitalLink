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
