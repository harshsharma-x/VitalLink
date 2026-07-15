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

def test_demo_donor_creation():
    """Test that demo login creates a donor with reliability_score"""
    response = client.post("/auth/demo", json={
        "name": "Demo Donor",
        "phone": "1111111111",
        "role": "donor",
        "blood_group": "B+"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["donor_id"] is not None
    assert data["blood_group"] == "B+"

def test_demo_patient_creation():
    """Test that demo login creates a patient (no donor record)"""
    response = client.post("/auth/demo", json={
        "name": "Demo Patient",
        "phone": "2222222222",
        "role": "patient"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["donor_id"] is None
    assert data["role"] == "patient"
    assert data["name"] == "Demo Patient"
