from sqlalchemy.orm import Session
from models.models import EmergencyRequest, User
from schemas.request import EmergencyRequestCreate, EmergencyRequestCancel
from fastapi import HTTPException, status
from uuid import UUID
from typing import Optional

def create_request(db: Session, patient_id: UUID, request_data: EmergencyRequestCreate) -> EmergencyRequest:
    # Verify patient exists
    user = db.query(User).filter(User.id == patient_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Patient not found")
    if user.role != "patient":
        raise HTTPException(status_code=400, detail="User is not a patient")

    request = EmergencyRequest(
        patient_id=patient_id,
        **request_data.model_dump()
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

def get_requests(db: Session, patient_id: Optional[UUID] = None, skip: int = 0, limit: int = 100):
    query = db.query(EmergencyRequest)
    if patient_id:
        query = query.filter(EmergencyRequest.patient_id == patient_id)
    return query.order_by(EmergencyRequest.created_at.desc()).offset(skip).limit(limit).all()

def get_request(db: Session, request_id: UUID) -> EmergencyRequest:
    request = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return request

def cancel_request(db: Session, request_id: UUID, patient_id: UUID) -> EmergencyRequest:
    request = get_request(db, request_id)
    if request.patient_id != patient_id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this request")
    if request.status in ["completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Request already finalized")

    request.status = "cancelled"
    db.commit()
    db.refresh(request)
    return request

def update_request_status(db: Session, request_id: UUID, status: str) -> EmergencyRequest:
    request = get_request(db, request_id)
    request.status = status
    db.commit()
    db.refresh(request)
    return request
