import logging
from sqlalchemy.orm import Session
from models.models import Match, EmergencyRequest, Donor, User
from schemas.matching import MatchCreate, MatchingStart, MatchAccept, MatchReject
from fastapi import HTTPException, status
from uuid import UUID
from typing import List, Dict

logger = logging.getLogger(__name__)

# ── ML predictor (lazy-loaded on first call) ───────────────────────────────
def _get_predictor():
    try:
        from ml.predictor import score_donors
        return score_donors
    except FileNotFoundError:
        logger.warning(
            "ML model not found – falling back to rule-based scoring. "
            "Run `python -m ml.train_model` to enable ML matching."
        )
        return None


def _rule_based_score(donor: Donor, request: EmergencyRequest) -> float:
    """Fallback rule-based formula (used when model is not yet trained)."""
    import math

    COMPAT = {
        "A+": ["A+", "A-", "O+", "O-"], "A-": ["A-", "O-"],
        "B+": ["B+", "B-", "O+", "O-"], "B-": ["B-", "O-"],
        "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        "AB-": ["A-", "B-", "AB-", "O-"],
        "O+": ["O+", "O-"], "O-": ["O-"],
    }
    compatible = COMPAT.get(request.blood_group, [])
    if donor.blood_group not in compatible:
        return 0.0

    compat_sc = 1.0 if donor.blood_group == request.blood_group else 0.7

    dist = 0.0
    if all([donor.latitude, donor.longitude, request.latitude, request.longitude]):
        R = 6371
        la1, lo1 = math.radians(donor.latitude), math.radians(donor.longitude)
        la2, lo2 = math.radians(request.latitude), math.radians(request.longitude)
        a = math.sin((la2-la1)/2)**2 + math.cos(la1)*math.cos(la2)*math.sin((lo2-lo1)/2)**2
        dist = 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

    d_score = max(0.0, 1.0 - dist / 20.0)
    r_score = min((donor.reliability_score or 0) / 100.0, 1.0)
    a_score = 1.0 if donor.availability else 0.0

    return 0.40*compat_sc + 0.30*d_score + 0.20*r_score + 0.10*a_score


def find_matches(db: Session, request_id: UUID) -> List[Dict]:
    request = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    donors = db.query(Donor).filter(Donor.availability == True).all()
    if not donors:
        return []

    score_donors = _get_predictor()

    if score_donors is not None:
        # ── ML path ───────────────────────────────────────────
        request_dict = {
            'blood_group':     request.blood_group,
            'latitude':        request.latitude,
            'longitude':       request.longitude,
            'urgency':         request.urgency,
            'units_required':  request.units_required,
        }
        ranked = score_donors(request_dict, donors)
        return [{"donor": d, "score": round(s, 4)} for d, s in ranked]
    else:
        # ── Fallback: rule-based ───────────────────────────────
        results = []
        for donor in donors:
            score = _rule_based_score(donor, request)
            if score > 0:
                results.append({"donor": donor, "score": round(score, 4)})
        results.sort(key=lambda x: x["score"], reverse=True)
        return results

def start_matching(db: Session, request_id: UUID) -> dict:
    request = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.status != "pending":
        raise HTTPException(status_code=400, detail="Request already processed")

    # Update request status to searching
    request.status = "searching"
    db.commit()

    potential_matches = find_matches(db, request_id)

    created_matches = []
    for match_data in potential_matches[:10]:  # Top 10 donors
        match = Match(
            request_id=request_id,
            donor_id=match_data["donor"].id,
            score=match_data["score"],
            status="pending"
        )
        db.add(match)
        created_matches.append(match)

    db.commit()

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
                )
    except Exception as exc:
        logger.warning("Push notification failed: %s", exc)

    return {
        "request_id": request_id,
        "matches": created_matches,
        "donors_alerted": len(created_matches)
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

    # Update request status
    request = db.query(EmergencyRequest).filter(EmergencyRequest.id == match.request_id).first()
    if request:
        request.status = "accepted"

    # Reject other pending matches for this request
    db.query(Match).filter(
        Match.request_id == match.request_id,
        Match.id != match_id,
        Match.status == "pending"
    ).update({"status": "rejected"})

    db.commit()
    db.refresh(match)
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
    db.commit()
    db.refresh(match)
    return match

def get_matches_for_request(db: Session, request_id: UUID):
    return db.query(Match).filter(Match.request_id == request_id).all()
