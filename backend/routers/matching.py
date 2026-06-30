from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from schemas.matching import MatchResponse, MatchingStart, MatchAccept, MatchReject, MatchingResult
from services.matching_service import (
    start_matching, accept_match, reject_match,
    get_matches_for_request, get_matching_status,
)
from utils.jwt import get_current_user
from models.models import User
from uuid import UUID

router = APIRouter(prefix="/matching", tags=["Matching"])


@router.post("/start", response_model=MatchingResult)
def start(data: MatchingStart, db: Session = Depends(get_db)):
    result = start_matching(db, data.request_id)
    return result


@router.get("/status/{request_id}")
def matching_status(request_id: UUID, db: Session = Depends(get_db)):
    """Poll this to check if a donor has accepted. Returns status, donors_alerted, accepted_match."""
    return get_matching_status(db, request_id)


@router.post("/accept", response_model=MatchResponse)
def accept(
    data: MatchAccept,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from models.models import Donor
    donor = db.query(Donor).filter(Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor profile not found")
    return accept_match(db, data.match_id, donor.id)


@router.post("/reject", response_model=MatchResponse)
def reject(
    data: MatchReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from models.models import Donor
    donor = db.query(Donor).filter(Donor.user_id == current_user.id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor profile not found")
    return reject_match(db, data.match_id, donor.id)


@router.get("/{request_id}", response_model=List[MatchResponse])
def get_matches(request_id: UUID, db: Session = Depends(get_db)):
    return get_matches_for_request(db, request_id)
