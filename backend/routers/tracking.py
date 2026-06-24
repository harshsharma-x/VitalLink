from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from schemas.tracking import TrackingLocationUpdate, TrackingEventResponse, TrackingStatusResponse
from services.tracking_service import update_location, get_tracking, get_tracking_status, complete_donation
from utils.jwt import get_current_user
from models.models import User, Donor
from uuid import UUID

router = APIRouter(prefix="/tracking", tags=["Tracking"])

@router.post("/location", response_model=TrackingEventResponse)
def update_tracking_location(
    data: TrackingLocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donor = db.query(Donor).filter(Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor profile not found")
    return update_location(db, donor.id, data)

@router.get("/{request_id}", response_model=List[TrackingEventResponse])
def get_tracking_history(request_id: UUID, db: Session = Depends(get_db)):
    return get_tracking(db, request_id)

@router.get("/{request_id}/status", response_model=TrackingStatusResponse)
def get_status(request_id: UUID, db: Session = Depends(get_db)):
    return get_tracking_status(db, request_id)

@router.post("/{request_id}/complete")
def complete(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donor = db.query(Donor).filter(Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor profile not found")
    return complete_donation(db, request_id, donor.id)
