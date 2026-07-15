"""
Standalone VitalLink API server — hospitals + blood banks.
No PostgreSQL required; both services are SQLite-backed.

Run with:
    cd backend
    python3 -m uvicorn hospitals_server:app --host 0.0.0.0 --port 8000 --reload
"""
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.hospitals import router as hospitals_router
from routers.bloodbank import router as bloodbank_router

app = FastAPI(
    title="VitalLink Location API",
    description="Nearby hospitals & blood banks — 2,566 verified Indian records",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hospitals_router)
app.include_router(bloodbank_router)


@app.get("/")
def root():
    return {
        "service": "VitalLink Location API",
        "status":  "operational",
        "endpoints": {
            "hospitals_nearby": "/hospitals/nearby?lat=&lon=",
            "bloodbanks_nearby": "/bloodbanks/nearby?lat=&lon=&blood_group=O%2B",
            "docs": "/docs",
        },
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
