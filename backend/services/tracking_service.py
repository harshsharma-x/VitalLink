from sqlalchemy.orm import Session
from models.models import TrackingEvent, EmergencyRequest, Donor
from schemas.tracking import TrackingLocationUpdate
from fastapi import HTTPException
from uuid import UUID
from datetime import datetime
from typing import List, Optional
import math

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def update_location(db: Session, donor_id: UUID, data: TrackingLocationUpdate) -> TrackingEvent:
    # Verify request exists and is accepted
    request = db.query(EmergencyRequest).filter(EmergencyRequest.id == data.request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.status not in ["accepted", "en_route", "arrived"]:
        raise HTTPException(status_code=400, detail="Request not in trackable state")

    event = TrackingEvent(
        request_id=data.request_id,
        donor_id=donor_id,
        latitude=data.latitude,
        longitude=data.longitude
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Update request status based on distance
    if request.latitude and request.longitude:
        distance = haversine_distance(data.latitude, data.longitude, request.latitude, request.longitude)
        if distance < 0.1 and request.status == "en_route":  # Within 100m
            request.status = "arrived"
            db.commit()
        elif request.status == "accepted":
            request.status = "en_route"
            db.commit()

    return event

def get_tracking(db: Session, request_id: UUID) -> List[TrackingEvent]:
    return db.query(TrackingEvent).filter(
        TrackingEvent.request_id == request_id
    ).order_by(TrackingEvent.timestamp.desc()).all()

def get_latest_location(db: Session, request_id: UUID, donor_id: UUID) -> Optional[TrackingEvent]:
    return db.query(TrackingEvent).filter(
        TrackingEvent.request_id == request_id,
        TrackingEvent.donor_id == donor_id
    ).order_by(TrackingEvent.timestamp.desc()).first()

def calculate_eta(distance_km: float, speed_kmh: float = 30) -> int:
    return max(1, int((distance_km / speed_kmh) * 60))

def get_tracking_status(db: Session, request_id: UUID) -> dict:
    request = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Get accepted match
    from models.models import Match
    match = db.query(Match).filter(
        Match.request_id == request_id,
        Match.status == "accepted"
    ).first()

    if not match:
        raise HTTPException(status_code=404, detail="No active donor found")

    latest = get_latest_location(db, request_id, match.donor_id)
    if not latest:
        raise HTTPException(status_code=404, detail="No tracking data available")

    eta = None
    if request.latitude and request.longitude:
        distance = haversine_distance(latest.latitude, latest.longitude, request.latitude, request.longitude)
        eta = calculate_eta(distance)

    return {
        "request_id": request_id,
        "donor_id": match.donor_id,
        "current_latitude": latest.latitude,
        "current_longitude": latest.longitude,
        "status": request.status,
        "eta_minutes": eta,
        "last_updated": latest.timestamp
    }

def complete_donation(db: Session, request_id: UUID, donor_id: UUID) -> EmergencyRequest:
    request = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    request.status = "completed"

    # Update donor stats
    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if donor:
        donor.last_donation_date = datetime.utcnow()
        donor.reliability_score = min(100, (donor.reliability_score or 0) + 5)
        donor.donation_count = (donor.donation_count or 0) + 1
        donor.availability = False

    db.commit()
    db.refresh(request)
    return request
