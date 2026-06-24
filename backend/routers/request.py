from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from schemas.request import EmergencyRequestCreate, EmergencyRequestResponse, EmergencyRequestCancel
from services.request_service import create_request, get_requests, get_request, cancel_request
from utils.jwt import get_current_user
from models.models import User
from uuid import UUID

router = APIRouter(prefix="/requests", tags=["Emergency Requests"])

@router.post("/", response_model=EmergencyRequestResponse, status_code=status.HTTP_201_CREATED)
def create(
    request_data: EmergencyRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_request(db, current_user.id, request_data)

@router.get("/", response_model=List[EmergencyRequestResponse])
def list_requests(
    patient_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return get_requests(db, patient_id, skip, limit)

@router.get("/{request_id}", response_model=EmergencyRequestResponse)
def get_single(request_id: UUID, db: Session = Depends(get_db)):
    return get_request(db, request_id)

@router.patch("/{request_id}/cancel", response_model=EmergencyRequestResponse)
def cancel(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return cancel_request(db, request_id, current_user.id)
