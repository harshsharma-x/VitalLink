import logging
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from services import google_places
from services.hospital_db import nearby as sqlite_nearby, search, all_states, get_by_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/hospitals", tags=["Hospitals"])


@router.get("/nearby")
def get_nearby_hospitals(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude"),
    radius_km: float = Query(5.0, description="Search radius in km", le=50),
    limit: int = Query(20, le=60),
    state: Optional[str] = Query(None),
):
    """
    Returns real nearby hospitals.
    Source: Google Places API (when key is set) → CSV/SQLite fallback.
    """
    if google_places.is_configured():
        try:
            return google_places.nearby_hospitals(lat, lon, radius_km, limit)
        except Exception as exc:
            logger.warning("Google Places failed (%s), falling back to SQLite", exc)

    # Fallback — SQLite-backed CSV data
    return sqlite_nearby(lat=lat, lon=lon, radius_km=radius_km, limit=limit, state=state)


@router.get("/states")
def get_states():
    return all_states()


@router.get("/source")
def data_source():
    """Tells the app whether real Google data is active."""
    return {
        "google_places": google_places.is_configured(),
        "source": "google" if google_places.is_configured() else "csv_sqlite",
    }


@router.get("/{hospital_id}")
def get_hospital(hospital_id: str):
    # Numeric ID → SQLite lookup
    if hospital_id.isdigit():
        h = get_by_id(int(hospital_id))
        if not h:
            raise HTTPException(status_code=404, detail="Hospital not found")
        return h
    raise HTTPException(status_code=404, detail="Hospital not found")


@router.get("/")
def list_hospitals(
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    return search(state=state, city=city, offset=offset, limit=limit)
