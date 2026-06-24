"""
VitalLink Compliance & Anti-Corruption API

All six countermeasures exposed as REST endpoints:
  1. /compliance/blood-units          — register, record events, hash chain
  2. /compliance/dispatch-check       — gate on ELISA/NAAT result
  3. /compliance/fraud-flags          — view and resolve flags
  4. /compliance/tout-check           — phone pattern analysis
  5. /compliance/hospital-ratios      — replacement coercion tracker
  6. /compliance/donor-eligibility    — 56-day gap + frequency cap
  7. /compliance/abha                 — ABHA dedup registration
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from services.anti_corruption import (
    record_blood_unit_event, register_blood_unit, record_test_result,
    get_unit_chain, check_dispatch_allowed, record_request_meta,
    analyze_tout_pattern, record_replacement_flag, get_hospital_replacement_ratio,
    get_all_hospital_ratios, check_donor_eligibility, register_abha,
    get_fraud_flags, resolve_flag, get_fraud_summary, flag_fraud,
)

router = APIRouter(prefix="/compliance", tags=["Compliance"])


# ─── 1. Blood Units + Hash Chain ─────────────────────────────────────────────

class BloodUnitIn(BaseModel):
    unit_id: str
    blood_group: str
    bank_id: Optional[int] = None
    donor_id: Optional[str] = None


class BloodUnitEventIn(BaseModel):
    event_type: str   # collected | screened | dispatched | used | returned
    patient_id: Optional[str] = None
    actor_id: Optional[str] = None


class TestResultIn(BaseModel):
    result: str       # clear | rejected
    actor_id: Optional[str] = None


@router.post("/blood-units")
def create_blood_unit(body: BloodUnitIn):
    """Register a blood unit and start its hash chain."""
    return register_blood_unit(
        unit_id=body.unit_id,
        blood_group=body.blood_group,
        bank_id=body.bank_id,
        donor_id=body.donor_id,
    )


@router.post("/blood-units/{unit_id}/event")
def add_blood_unit_event(unit_id: str, body: BloodUnitEventIn):
    """
    Append event to a blood unit's hash chain.
    A 'used' event without patient_id automatically raises a fraud flag.
    """
    valid_types = {"collected", "screened", "dispatched", "used", "returned", "flagged"}
    if body.event_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"event_type must be one of {sorted(valid_types)}")
    return record_blood_unit_event(
        unit_id=unit_id,
        event_type=body.event_type,
        patient_id=body.patient_id,
        actor_id=body.actor_id,
    )


@router.post("/blood-units/{unit_id}/test-result")
def submit_test_result(unit_id: str, body: TestResultIn):
    """Record ELISA/NAAT screening result for a blood unit."""
    if body.result not in ("clear", "rejected"):
        raise HTTPException(status_code=400, detail="result must be 'clear' or 'rejected'")
    return record_test_result(unit_id=unit_id, result=body.result, actor_id=body.actor_id)


@router.get("/blood-units/{unit_id}/chain")
def get_blood_unit_chain(unit_id: str):
    """Full hash chain for a blood unit — audit trail."""
    chain = get_unit_chain(unit_id)
    if not chain["unit"]:
        raise HTTPException(status_code=404, detail="Blood unit not found")
    return chain


# ─── 2. Dispatch Gate ────────────────────────────────────────────────────────

@router.get("/dispatch-check/{unit_id}")
def dispatch_check(unit_id: str):
    """
    Returns { allowed: bool, reason: str }.
    Call this before dispatching any blood unit to a patient.
    Blocked if ELISA/NAAT is pending or rejected.
    """
    return check_dispatch_allowed(unit_id)


# ─── 3. Fraud Flags ──────────────────────────────────────────────────────────

@router.get("/fraud-flags")
def list_fraud_flags(
    resolved: bool = Query(False),
    entity_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
):
    """List active fraud flags. Append-only — never deleted, only resolved."""
    return get_fraud_flags(resolved=resolved, entity_type=entity_type, severity=severity, limit=limit)


@router.get("/fraud-summary")
def fraud_summary():
    """Aggregate count of each fraud type."""
    return get_fraud_summary()


@router.patch("/fraud-flags/{flag_id}/resolve")
def mark_flag_resolved(flag_id: int, resolved_by: Optional[str] = Query(None)):
    """Mark a flag as investigated and resolved."""
    resolve_flag(flag_id, resolved_by)
    return {"ok": True, "flag_id": flag_id}


# ─── 4. Tout Detection ───────────────────────────────────────────────────────

class RequestMetaIn(BaseModel):
    phone: str
    request_id: str
    hospital: str
    lat: Optional[float] = None
    lon: Optional[float] = None


@router.post("/record-request")
def record_request(body: RequestMetaIn):
    """Record a blood request for tout-pattern analysis. Call when each request is created."""
    record_request_meta(
        phone=body.phone,
        request_id=body.request_id,
        hospital=body.hospital,
        lat=body.lat,
        lon=body.lon,
    )
    result = analyze_tout_pattern(body.phone)
    return result


@router.get("/tout-check/{phone}")
def tout_check(phone: str):
    """Analyze whether a phone number shows broker/tout behavior (ML IsolationForest)."""
    return analyze_tout_pattern(phone)


# ─── 5. Replacement Coercion ─────────────────────────────────────────────────

class ReplacementIn(BaseModel):
    hospital: str
    request_id: str
    required_replacement: bool


@router.post("/replacement-record")
def record_replacement(body: ReplacementIn):
    """Record whether a hospital required a replacement donor for this request."""
    record_replacement_flag(body.hospital, body.request_id, body.required_replacement)
    return get_hospital_replacement_ratio(body.hospital)


@router.get("/hospital-ratios")
def hospital_replacement_ratios(flagged_only: bool = Query(False)):
    """
    Per-hospital replacement ratio. Hospitals >15% are auto-flagged for investigation.
    """
    return get_all_hospital_ratios(flagged_only=flagged_only)


@router.get("/hospital-ratios/{hospital}")
def hospital_ratio(hospital: str):
    return get_hospital_replacement_ratio(hospital)


# ─── 6. Donor Eligibility + Blood Farm Detection ────────────────────────────

@router.get("/donor-eligibility/{donor_id}")
def donor_eligibility(
    donor_id: str,
    last_donation_date: Optional[str] = Query(None, description="ISO date YYYY-MM-DD"),
    donation_count_6m: int = Query(0, description="Donations in last 6 months"),
):
    """
    Check if a donor is eligible.
    Enforces 56-day gap + max-frequency rule (blood farm detection).
    """
    return check_donor_eligibility(
        donor_id=donor_id,
        last_donation_date=last_donation_date,
        donation_count_6m=donation_count_6m,
    )


# ─── 7. ABHA Deduplication ───────────────────────────────────────────────────

class AbhaIn(BaseModel):
    abha_id: str
    donor_id: str


@router.post("/abha-register")
def abha_register(body: AbhaIn):
    """
    Register ABHA ↔ donor mapping.
    Returns { ok: false, duplicate: true } if ABHA is already linked to another donor.
    """
    return register_abha(body.abha_id, body.donor_id)
