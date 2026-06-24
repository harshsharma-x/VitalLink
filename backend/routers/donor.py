from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from schemas.donor import DonorCreate, DonorUpdate, DonorResponse, DonorAvailabilityUpdate
from services.donor_service import create_donor, get_donors, get_donor, update_donor, update_availability
from utils.jwt import get_current_user
from models.models import User, Donor
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

router = APIRouter(prefix="/donors", tags=["Donors"])


class PushTokenUpdate(BaseModel):
    push_token: str


@router.post("/", response_model=DonorResponse, status_code=status.HTTP_201_CREATED)
def create(donor: DonorCreate, db: Session = Depends(get_db)):
    return create_donor(db, donor)


@router.get("/", response_model=List[DonorResponse])
def list_donors(
    skip: int = 0,
    limit: int = 100,
    available_only: bool = False,
    db: Session = Depends(get_db),
):
    return get_donors(db, skip, limit, available_only)


@router.get("/by-user/{user_id}", response_model=DonorResponse)
def get_donor_by_user(user_id: UUID, db: Session = Depends(get_db)):
    donor = db.query(Donor).filter(Donor.user_id == user_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor profile not found")
    return donor


@router.post("/push-token")
def register_push_token(
    data: PushTokenUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    donor = db.query(Donor).filter(Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor profile not found")
    donor.push_token = data.push_token
    db.commit()
    return {"ok": True}


@router.get("/{donor_id}", response_model=DonorResponse)
def get_single_donor(donor_id: UUID, db: Session = Depends(get_db)):
    return get_donor(db, donor_id)


@router.patch("/{donor_id}", response_model=DonorResponse)
def update(donor_id: UUID, update_data: DonorUpdate, db: Session = Depends(get_db)):
    return update_donor(db, donor_id, update_data)


@router.patch("/{donor_id}/availability", response_model=DonorResponse)
def update_donor_availability(
    donor_id: UUID,
    data: DonorAvailabilityUpdate,
    db: Session = Depends(get_db),
):
    return update_availability(db, donor_id, data)


@router.get("/{donor_id}/donations")
def get_donation_history(donor_id: UUID, db: Session = Depends(get_db)):
    from models.models import Match, EmergencyRequest

    matches = (
        db.query(Match)
        .filter(Match.donor_id == donor_id, Match.status == "accepted")
        .all()
    )

    result = []
    for match in matches:
        req = db.query(EmergencyRequest).filter(EmergencyRequest.id == match.request_id).first()
        if req:
            result.append({
                "match_id": str(match.id),
                "request_id": str(req.id),
                "blood_group": req.blood_group,
                "hospital_name": req.hospital_name,
                "units_required": req.units_required,
                "urgency": req.urgency,
                "status": req.status,
                "created_at": req.created_at.isoformat() if req.created_at else None,
            })

    result.sort(key=lambda x: x["created_at"] or "", reverse=True)
    return result
