from sqlalchemy.orm import Session
from models.models import Donor, User
from schemas.donor import DonorCreate, DonorUpdate, DonorAvailabilityUpdate
from fastapi import HTTPException, status
from uuid import UUID

def create_donor(db: Session, donor_data: DonorCreate) -> Donor:
    # Check if user exists and is a donor
    user = db.query(User).filter(User.id == donor_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "donor":
        raise HTTPException(status_code=400, detail="User is not a donor")

    # Check if donor already exists
    existing = db.query(Donor).filter(Donor.user_id == donor_data.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Donor profile already exists")

    donor = Donor(**donor_data.model_dump())
    db.add(donor)
    db.commit()
    db.refresh(donor)
    return donor

def get_donors(db: Session, skip: int = 0, limit: int = 100, available_only: bool = False):
    query = db.query(Donor)
    if available_only:
        query = query.filter(Donor.availability == True)
    return query.offset(skip).limit(limit).all()

def get_donor(db: Session, donor_id: UUID) -> Donor:
    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    return donor

def update_donor(db: Session, donor_id: UUID, update_data: DonorUpdate) -> Donor:
    donor = get_donor(db, donor_id)
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(donor, field, value)
    db.commit()
    db.refresh(donor)
    return donor

def update_availability(db: Session, donor_id: UUID, data: DonorAvailabilityUpdate) -> Donor:
    donor = get_donor(db, donor_id)
    donor.availability = data.availability
    if data.latitude is not None:
        donor.latitude = data.latitude
    if data.longitude is not None:
        donor.longitude = data.longitude
    db.commit()
    db.refresh(donor)
    return donor
