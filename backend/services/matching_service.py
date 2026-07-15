import math
import logging
from sqlalchemy.orm import Session
from models.models import Match, EmergencyRequest, Donor, User
from schemas.matching import MatchCreate, MatchingStart, MatchAccept, MatchReject
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

COMPAT = {
    "A+":  ["A+", "A-", "O+", "O-"],
    "A-":  ["A-", "O-"],
    "B+":  ["B+", "B-", "O+", "O-"],
    "B-":  ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+":  ["O+", "O-"],
    "O-":  ["O-"],
}


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    la1, lo1 = math.radians(lat1), math.radians(lon1)
    la2, lo2 = math.radians(lat2), math.radians(lon2)
    a = math.sin((la2-la1)/2)**2 + math.cos(la1)*math.cos(la2)*math.sin((lo2-lo1)/2)**2
    return 2 * 6371 * math.atan2(math.sqrt(a), math.sqrt(1-a))


def _get_predictor():
    try:
        from ml.predictor import score_donors
        return score_donors
    except (FileNotFoundError, ImportError, OSError, ValueError):
        logger.warning("ML model not available, falling back to rule-based matching")
        return None


def _rule_based_score(donor: Donor, request: EmergencyRequest, dist_km: float) -> float:
    compatible = COMPAT.get(request.blood_group, [])
    if donor.blood_group not in compatible:
        return 0.0

    compat_sc = 1.0 if donor.blood_group == request.blood_group else 0.7
    d_score = max(0.0, 1.0 - dist_km / 25.0)
    r_score = min((donor.reliability_score or 50) / 100.0, 1.0)
    a_score = 1.0 if donor.availability else 0.0

    return 0.40 * compat_sc + 0.30 * d_score + 0.20 * r_score + 0.10 * a_score


def find_matches(db: Session, request_id: UUID, radius_km: float = 15.0) -> List[Dict]:
    request = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    all_donors = db.query(Donor).filter(Donor.availability == True).all()
    if not all_donors:
        return []

    # Pre-compute distances; donors without coords are always included (unknown location)
    donors_with_dist: List[tuple[Donor, float]] = []
    for donor in all_donors:
        if donor.latitude and donor.longitude and request.latitude and request.longitude:
            dist = _haversine_km(request.latitude, request.longitude, donor.latitude, donor.longitude)
            if dist <= radius_km:
                donors_with_dist.append((donor, dist))
        else:
            donors_with_dist.append((donor, 5.0))  # assume nearby when no location

    if not donors_with_dist:
        return []

    score_donors = _get_predictor()

    if score_donors is not None:
        request_dict = {
            "blood_group":    request.blood_group,
            "latitude":       request.latitude,
            "longitude":      request.longitude,
            "urgency":        request.urgency,
            "units_required": request.units_required,
        }
        just_donors = [d for d, _ in donors_with_dist]
        ranked = score_donors(request_dict, just_donors)
        return [{"donor": d, "score": round(s, 4), "dist_km": 0.0} for d, s in ranked if s > 0]
    else:
        results = []
        for donor, dist in donors_with_dist:
            score = _rule_based_score(donor, request, dist)
            if score > 0:
                results.append({"donor": donor, "score": round(score, 4), "dist_km": round(dist, 2)})
        results.sort(key=lambda x: x["score"], reverse=True)
        return results


def start_matching(db: Session, request_id: UUID) -> dict:
    request = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Idempotent: if already searching or accepted, return current count
    if request.status in ("searching", "accepted", "cancelled"):
        existing = db.query(Match).filter(Match.request_id == request_id).count()
        return {"request_id": request_id, "matches": [], "donors_alerted": existing}

    request.status = "searching"
    db.commit()

    # Try expanding radius: 15 km → 30 km → 50 km
    matches_data: List[Dict] = []
    for radius in (15.0, 30.0, 50.0):
        matches_data = find_matches(db, request_id, radius_km=radius)
        if len(matches_data) >= 3:
            logger.info("Found %d donors within %dkm for request %s", len(matches_data), radius, request_id)
            break
        if matches_data:
            logger.info("Only %d donors within %dkm, expanding...", len(matches_data), radius)

    created_matches = []
    for match_data in matches_data[:10]:
        match = Match(
            request_id=request_id,
            donor_id=match_data["donor"].id,
            score=match_data["score"],
            status="pending",
        )
        db.add(match)
        created_matches.append(match)

    db.commit()
    for match in created_matches:
        db.refresh(match)

    # Send push notifications to matched donors
    try:
        from services.notification_service import alert_donor
        for match in created_matches:
            donor = db.query(Donor).filter(Donor.id == match.donor_id).first()
            if donor and donor.push_token:
                alert_donor(
                    push_token=donor.push_token,
                    blood_group=request.blood_group,
                    hospital=request.hospital_name,
                    request_id=str(request_id),
                    match_id=str(match.id),
                    hospital_lat=request.latitude,
                    hospital_lng=request.longitude,
                    units=request.units_required,
                )
    except Exception as exc:
        logger.warning("Push notifications failed: %s", exc)

    return {
        "request_id": request_id,
        "matches": created_matches,
        "donors_alerted": len(created_matches),
    }


def accept_match(db: Session, match_id: UUID, donor_id: UUID) -> Match:
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.donor_id != donor_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if match.status != "pending":
        raise HTTPException(status_code=400, detail="Match already processed")

    match.status = "accepted"

    request = db.query(EmergencyRequest).filter(EmergencyRequest.id == match.request_id).first()
    if request:
        request.status = "accepted"

    # Reject all other pending matches for this request
    db.query(Match).filter(
        Match.request_id == match.request_id,
        Match.id != match_id,
        Match.status == "pending",
    ).update({"status": "rejected"})

    db.commit()
    db.refresh(match)

    # Notify patient that a donor accepted
    try:
        from services.notification_service import send_push
        donor = db.query(Donor).filter(Donor.id == donor_id).first()
        donor_user = db.query(User).filter(User.id == donor.user_id).first() if donor else None
        patient = db.query(User).filter(User.id == request.patient_id).first() if request else None
        if patient and patient.push_token and donor_user:
            send_push(
                push_token=patient.push_token,
                title="Donor found!",
                body=f"{donor_user.name} is on the way to {request.hospital_name}",
                data={
                    "type": "donor_accepted",
                    "request_id": str(request.id),
                    "match_id": str(match_id),
                    "donor_name": donor_user.name,
                    "donor_blood_group": donor.blood_group,
                    "reliability_score": donor.reliability_score or 0,
                    "donation_count": donor.donation_count or 0,
                },
            )
    except Exception as exc:
        logger.warning("Patient push notification failed: %s", exc)

    return match


def reject_match(db: Session, match_id: UUID, donor_id: UUID) -> Match:
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.donor_id != donor_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if match.status != "pending":
        raise HTTPException(status_code=400, detail="Match already processed")

    match.status = "rejected"

    donor = db.query(Donor).filter(Donor.id == donor_id).first()
    if donor:
        donor.reliability_score = max(0, (donor.reliability_score or 50) - 2)

    db.commit()
    db.refresh(match)
    return match


def get_matches_for_request(db: Session, request_id: UUID):
    return db.query(Match).filter(Match.request_id == request_id).all()


def get_matching_status(db: Session, request_id: UUID) -> dict:
    request = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    total = db.query(Match).filter(Match.request_id == request_id).count()

    accepted = (
        db.query(Match)
        .filter(Match.request_id == request_id, Match.status == "accepted")
        .first()
    )

    accepted_info: Optional[dict] = None
    if accepted:
        donor = db.query(Donor).filter(Donor.id == accepted.donor_id).first()
        donor_user = db.query(User).filter(User.id == donor.user_id).first() if donor else None
        if donor and donor_user:
            accepted_info = {
                "match_id": str(accepted.id),
                "donor_name": donor_user.name,
                "blood_group": donor.blood_group,
                "reliability_score": int(donor.reliability_score or 0),
                "donation_count": donor.donation_count or 0,
            }

    return {
        "status": request.status,
        "donors_alerted": total,
        "accepted_match": accepted_info,
    }
