import logging
from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db, get_db_for_task
from schemas.request import EmergencyRequestCreate, EmergencyRequestResponse, EmergencyRequestCancel
from services.request_service import create_request, get_requests, get_request, cancel_request
from utils.jwt import get_current_user
from models.models import User
from uuid import UUID

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/requests", tags=["Emergency Requests"])


def _run_matching_background(request_id: UUID) -> None:
    """Run matching in a background task with its own DB session."""
    db = get_db_for_task()
    try:
        from services.matching_service import start_matching
        start_matching(db, request_id)
    except Exception as exc:
        logger.warning("Background matching failed for %s: %s", request_id, exc)
    finally:
        db.close()


@router.post("/", response_model=EmergencyRequestResponse, status_code=status.HTTP_201_CREATED)
def create(
    request_data: EmergencyRequestCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    req = create_request(db, current_user.id, request_data)

    # Kick off matching via FastAPI BackgroundTasks (safe, managed lifecycle)
    background_tasks.add_task(_run_matching_background, req.id)

    # Anti-corruption tout detection (non-fatal)
    try:
        from services.anti_corruption import record_request_meta, analyze_tout_pattern
        lat = getattr(request_data, "latitude", None)
        lon = getattr(request_data, "longitude", None)
        record_request_meta(
            phone=current_user.phone,
            request_id=str(req.id),
            hospital=request_data.hospital_name,
            lat=lat,
            lon=lon,
        )
        result = analyze_tout_pattern(current_user.phone)
        if result.get("is_suspicious"):
            logger.warning(
                "TOUT ALERT - phone %s flagged: %s requests/1h, %s hospitals",
                current_user.phone,
                result.get("requests_last_1h") or result.get("features", {}).get("requests_1h"),
                result.get("unique_hospitals") or result.get("features", {}).get("unique_hospitals"),
            )
    except Exception as exc:
        logger.debug("Tout check failed (non-fatal): %s", exc)

    return req


@router.get("/", response_model=List[EmergencyRequestResponse])
def list_requests(
    patient_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return get_requests(db, patient_id, skip, limit)


@router.get("/{request_id}", response_model=EmergencyRequestResponse)
def get_single(request_id: UUID, db: Session = Depends(get_db)):
    return get_request(db, request_id)


@router.patch("/{request_id}/cancel", response_model=EmergencyRequestResponse)
def cancel(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return cancel_request(db, request_id, current_user.id)
