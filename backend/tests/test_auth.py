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

def test_login_patient():
    response = client.post("/auth/login", json={
        "name": "Test Patient",
        "phone": "9999999999",
        "role": "patient"
    })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["role"] == "patient"

def test_login_donor():
    response = client.post("/auth/login", json={
        "name": "Test Donor",
        "phone": "8888888888",
        "role": "donor",
        "blood_group": "O+"
    })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["role"] == "donor"

def test_login_existing_user():
    client.post("/auth/login", json={"name": "Existing", "phone": "7777777777", "role": "patient"})
    response = client.post("/auth/login", json={"name": "Existing Updated", "phone": "7777777777", "role": "patient"})
    assert response.status_code == 200

def test_get_me_unauthorized():
    response = client.get("/auth/me")
    # API returns 401 for unauthenticated requests (via HTTPBearer)
    assert response.status_code in (401, 403)

def test_get_me_authorized():
    login = client.post("/auth/login", json={"name": "Auth Test", "phone": "6666666666", "role": "patient"})
    token = login.json()["token"]
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["name"] == "Auth Test"

def test_demo_login():
    response = client.post("/auth/demo", json={
        "name": "Demo User",
        "phone": "5555555555",
        "role": "donor",
        "blood_group": "A+"
    })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["role"] == "donor"
    assert data["blood_group"] == "A+"
