import logging
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from services import google_places
from services.bloodbank_db import (
    nearby as sqlite_nearby, search, all_states,
    get_by_id, update_stock, BLOOD_GROUPS,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bloodbanks", tags=["Blood Banks"])


@router.get("/nearby")
def get_nearby_blood_banks(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude"),
    radius_km: float = Query(5.0, le=50),
    limit: int = Query(20, le=60),
    blood_group: Optional[str] = Query(None, description="Filter by blood group (SQLite only)"),
    state: Optional[str] = Query(None),
):
    """
    Returns real nearby blood banks.
    Source: Google Places API (when key is set) → CSV/SQLite fallback.
    Note: live stock levels are only available in SQLite fallback mode.
    """
    if google_places.is_configured():
        try:
            return google_places.nearby_blood_banks(lat, lon, radius_km, limit)
        except Exception as exc:
            logger.warning("Google Places failed (%s), falling back to SQLite", exc)

    # Fallback — SQLite with stock data
    if blood_group and blood_group not in BLOOD_GROUPS:
        raise HTTPException(status_code=400,
                            detail=f"Invalid blood_group. Choose from {BLOOD_GROUPS}")
    return sqlite_nearby(lat=lat, lon=lon, radius_km=radius_km, limit=limit,
                         state=state, blood_group=blood_group)


@router.get("/states")
def get_states():
    return all_states()


@router.get("/blood-groups")
def get_blood_groups():
    return BLOOD_GROUPS


@router.get("/source")
def data_source():
    return {
        "google_places": google_places.is_configured(),
        "source": "google" if google_places.is_configured() else "csv_sqlite",
        "note": "stock levels only available in csv_sqlite mode",
    }


@router.patch("/{bank_id}/stock")
def patch_stock(
    bank_id: int,
    blood_group: str = Query(...),
    units: int = Query(...),
):
    if blood_group not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood_group")
    result = update_stock(bank_id, blood_group, units)
    if not result:
        raise HTTPException(status_code=404, detail="Blood bank not found")
    return result


@router.get("/{bank_id}")
def get_blood_bank(bank_id: str):
    if bank_id.isdigit():
        b = get_by_id(int(bank_id))
        if not b:
            raise HTTPException(status_code=404, detail="Blood bank not found")
        return b
    raise HTTPException(status_code=404, detail="Blood bank not found")


@router.get("/")
def list_blood_banks(
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    blood_group: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
):
    if blood_group and blood_group not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood_group")
    return search(state=state, city=city, blood_group=blood_group, offset=offset, limit=limit)
