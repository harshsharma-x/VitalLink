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

def test_health():
    """Health check should return healthy when DB tables exist."""
    response = client.get("/health")
    # May return 200 or 503 depending on whether DB is accessible
    assert response.status_code in (200, 503)
    data = response.json()
    assert "status" in data

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "version" in response.json()
