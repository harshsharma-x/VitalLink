import logging
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from services import google_places
from services.bloodbank_db import (
    nearby as sqlite_nearby, search, all_states,
    get_by_id, update_stock, BLOOD_GROUPS,
    get_stock_history, get_days_since_restock,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bloodbanks", tags=["Blood Banks"])


def _with_predictions(bank: dict) -> dict:
    """Attach ML stock predictions to a blood bank dict."""
    try:
        from ml.stock_predictor import predict_all_groups, bank_shortage_score
        days_since = get_days_since_restock(bank["id"])
        capacity_tier = 1 if bank.get("total_units", 0) < 30 else (2 if bank.get("total_units", 0) < 80 else 3)
        preds = predict_all_groups(
            stock=bank["stock"],
            days_since_restock=days_since,
            bank_capacity_tier=capacity_tier,
        )
        bank["predictions"]    = preds
        bank["shortage_score"] = bank_shortage_score(preds)
        # Surface which groups are critical/low for quick filtering
        bank["critical_groups"] = [
            bg for bg, p in preds.items() if p["urgency_level"] == "CRITICAL"
        ]
        bank["low_groups"] = [
            bg for bg, p in preds.items() if p["urgency_level"] == "LOW"
        ]
    except Exception as exc:
        logger.warning("ML prediction failed for bank %s: %s", bank.get("id"), exc)
        bank["predictions"]    = None
        bank["shortage_score"] = 0.0
        bank["critical_groups"] = []
        bank["low_groups"] = []
    return bank


@router.get("/nearby")
def get_nearby_blood_banks(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude"),
    radius_km: float = Query(5.0, le=50),
    limit: int = Query(20, le=60),
    blood_group: Optional[str] = Query(None, description="Filter by blood group"),
    state: Optional[str] = Query(None),
    with_ml: bool = Query(False, description="Include ML stock predictions"),
):
    """
    Returns real nearby blood banks.
    Source: Google Places API (when key is set) → CSV/SQLite fallback.
    Stock levels are only available in SQLite fallback mode.
    """
    if google_places.is_configured():
        try:
            return google_places.nearby_blood_banks(lat, lon, radius_km, limit)
        except Exception as exc:
            logger.warning("Google Places failed (%s), falling back to SQLite", exc)

    if blood_group and blood_group not in BLOOD_GROUPS:
        raise HTTPException(status_code=400,
                            detail=f"Invalid blood_group. Choose from {BLOOD_GROUPS}")
    banks = sqlite_nearby(lat=lat, lon=lon, radius_km=radius_km, limit=limit,
                          state=state, blood_group=blood_group)
    if with_ml:
        banks = [_with_predictions(b) for b in banks]
    return banks


@router.get("/shortage-alerts")
def get_shortage_alerts(
    lat: Optional[float] = Query(None, description="Donor latitude for sorting"),
    lon: Optional[float] = Query(None, description="Donor longitude for sorting"),
    radius_km: float = Query(50.0, le=200),
    state: Optional[str] = Query(None),
    limit: int = Query(30, le=100),
):
    """
    Blood banks that have at least one blood group in CRITICAL or LOW stock,
    sorted by shortage severity. ML predictions included.
    """
    from ml.stock_predictor import predict_all_groups, bank_shortage_score

    if lat is not None and lon is not None:
        banks = sqlite_nearby(lat=lat, lon=lon, radius_km=radius_km, limit=200, state=state)
    else:
        banks = search(state=state, limit=200)

    alerts = []
    for bank in banks:
        days_since   = get_days_since_restock(bank["id"])
        capacity_tier = 1 if bank.get("total_units", 0) < 30 else (2 if bank.get("total_units", 0) < 80 else 3)
        try:
            preds = predict_all_groups(
                stock=bank["stock"],
                days_since_restock=days_since,
                bank_capacity_tier=capacity_tier,
            )
            score = bank_shortage_score(preds)
        except Exception:
            continue

        critical_groups = [bg for bg, p in preds.items() if p["urgency_level"] == "CRITICAL"]
        low_groups      = [bg for bg, p in preds.items() if p["urgency_level"] == "LOW"]

        if not critical_groups and not low_groups:
            continue

        bank["predictions"]    = preds
        bank["shortage_score"] = score
        bank["critical_groups"] = critical_groups
        bank["low_groups"]      = low_groups
        alerts.append(bank)

    alerts.sort(key=lambda b: -b["shortage_score"])
    return alerts[:limit]


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


@router.get("/{bank_id}/prediction")
def get_bank_prediction(bank_id: str):
    """ML stock prediction for all blood groups at a specific bank."""
    if not bank_id.isdigit():
        raise HTTPException(status_code=404, detail="Blood bank not found")
    bank = get_by_id(int(bank_id))
    if not bank:
        raise HTTPException(status_code=404, detail="Blood bank not found")

    from ml.stock_predictor import predict_all_groups, bank_shortage_score
    days_since    = get_days_since_restock(bank["id"])
    capacity_tier = 1 if bank.get("total_units", 0) < 30 else (2 if bank.get("total_units", 0) < 80 else 3)
    preds = predict_all_groups(
        stock=bank["stock"],
        days_since_restock=days_since,
        bank_capacity_tier=capacity_tier,
    )
    return {
        "bank_id":       bank["id"],
        "bank_name":     bank["name"],
        "city":          bank["city"],
        "state":         bank["state"],
        "stock":         bank["stock"],
        "predictions":   preds,
        "shortage_score": bank_shortage_score(preds),
        "critical_groups": [bg for bg, p in preds.items() if p["urgency_level"] == "CRITICAL"],
        "low_groups":    [bg for bg, p in preds.items() if p["urgency_level"] == "LOW"],
        "days_since_restock": days_since,
    }


@router.get("/{bank_id}/history")
def get_bank_history(
    bank_id: str,
    blood_group: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
):
    """Stock change history for a blood bank."""
    if not bank_id.isdigit():
        raise HTTPException(status_code=404, detail="Blood bank not found")
    bank = get_by_id(int(bank_id))
    if not bank:
        raise HTTPException(status_code=404, detail="Blood bank not found")
    if blood_group and blood_group not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood_group")
    return get_stock_history(int(bank_id), blood_group=blood_group, limit=limit)


@router.patch("/{bank_id}/stock")
def patch_stock(
    bank_id: int,
    blood_group: str = Query(...),
    units: int = Query(...),
    event_type: str = Query("manual"),
):
    if blood_group not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood_group")
    result = update_stock(bank_id, blood_group, units, event_type=event_type)
    if not result:
        raise HTTPException(status_code=404, detail="Blood bank not found")
    return result


@router.get("/{bank_id}")
def get_blood_bank(bank_id: str, with_ml: bool = Query(False)):
    if bank_id.isdigit():
        b = get_by_id(int(bank_id))
        if not b:
            raise HTTPException(status_code=404, detail="Blood bank not found")
        if with_ml:
            b = _with_predictions(b)
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
