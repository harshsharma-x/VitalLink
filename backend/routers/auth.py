import os
import re
import random
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.database import get_db
from schemas.auth import LoginRequest, LoginResponse, UserResponse
from services.auth_service import login_user, get_current_user_info
from utils.jwt import get_current_user, create_access_token
from models.models import User, Donor, OTPStore

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Existing login (Firebase path) ────────────────────────────────────────────

@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    result = login_user(db, request)
    return result


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return get_current_user_info(current_user)


# ── Demo login (no verification — dev/testing only) ───────────────────────────

class DemoLoginRequest(BaseModel):
    name: str
    phone: str
    role: str
    blood_group: Optional[str] = None


@router.post("/demo", status_code=status.HTTP_200_OK)
def demo_login(request: DemoLoginRequest, db: Session = Depends(get_db)):
    """No-OTP login for demo/testing. Creates or fetches the user and returns a real JWT."""
    user = db.query(User).filter(User.phone == request.phone).first()
    if not user:
        user = User(name=request.name, phone=request.phone, role=request.role)
        db.add(user)
        db.flush()
        if request.role == "donor":
            donor = Donor(
                user_id=user.id,
                blood_group=request.blood_group or "O+",
                availability=True,
            )
            db.add(donor)
        db.commit()
        db.refresh(user)
    else:
        if user.name != request.name:
            user.name = request.name
            db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role, "phone": user.phone})

    donor_id = None
    if user.role == "donor":
        donor = db.query(Donor).filter(Donor.user_id == user.id).first()
        if donor:
            donor_id = str(donor.id)

    return {
        "token": token,
        "user_id": str(user.id),
        "donor_id": donor_id,
        "role": user.role,
    }


# ── OTP authentication ─────────────────────────────────────────────────────────

class SendOTPRequest(BaseModel):
    phone: str


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    name: str
    role: str
    blood_group: Optional[str] = None


def _send_sms_fast2sms(phone: str, otp: str) -> bool:
    """Send OTP via Fast2SMS. Returns True if sent, False if key not configured."""
    api_key = os.getenv("FAST2SMS_API_KEY", "").strip()
    if not api_key:
        logger.info("[DEV] OTP for +91%s → %s", phone, otp)
        return False
    try:
        r = httpx.get(
            "https://www.fast2sms.com/dev/bulkV2",
            params={
                "authorization": api_key,
                "route": "otp",
                "variables_values": otp,
                "numbers": phone,
                "flash": 0,
            },
            timeout=8,
        )
        if r.status_code == 200 and r.json().get("return"):
            return True
        logger.warning("Fast2SMS error: %s", r.text)
        return False
    except Exception as exc:
        logger.warning("Fast2SMS exception: %s", exc)
        return False


@router.post("/send-otp", status_code=status.HTTP_200_OK)
def send_otp(request: SendOTPRequest, db: Session = Depends(get_db)):
    """Generate and send a 6-digit OTP to the given phone number."""
    phone = request.phone.strip()
    if not re.match(r'^[6-9]\d{9}$', phone):
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit Indian mobile number")

    otp = str(random.randint(100000, 999999))
    otp_hash = hashlib.sha256(otp.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # Remove any previous OTPs for this phone
    db.query(OTPStore).filter(OTPStore.phone == phone).delete()
    db.add(OTPStore(phone=phone, otp_hash=otp_hash, expires_at=expires_at))
    db.commit()

    sms_sent = _send_sms_fast2sms(phone, otp)

    resp: dict = {"ok": True}
    if not sms_sent:
        # Dev mode: return the OTP so the app can auto-fill it
        resp["dev_otp"] = otp
        resp["message"] = "OTP generated (SMS not configured — dev_otp visible for testing)"
    else:
        resp["message"] = "OTP sent via SMS"
    return resp


@router.post("/verify-otp", status_code=status.HTTP_200_OK)
def verify_otp(request: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify OTP and return JWT + user info. Creates user on first login."""
    phone = request.phone.strip()
    otp = request.otp.strip()

    if not re.match(r'^[6-9]\d{9}$', phone):
        raise HTTPException(status_code=400, detail="Invalid phone number")
    if not re.match(r'^\d{6}$', otp):
        raise HTTPException(status_code=400, detail="OTP must be 6 digits")

    record = (
        db.query(OTPStore)
        .filter(OTPStore.phone == phone, OTPStore.verified == False)
        .order_by(OTPStore.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(status_code=400, detail="No pending OTP for this number. Request a new one.")

    if datetime.now(timezone.utc) > record.expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    expected = hashlib.sha256(otp.encode()).hexdigest()
    if record.otp_hash != expected:
        raise HTTPException(status_code=400, detail="Incorrect OTP. Please try again.")

    record.verified = True
    db.commit()

    # Create or fetch user
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        if not request.name.strip():
            raise HTTPException(status_code=400, detail="Name is required")
        if request.role not in ("patient", "donor"):
            raise HTTPException(status_code=400, detail="Role must be patient or donor")
        user = User(name=request.name.strip(), phone=phone, role=request.role)
        db.add(user)
        db.flush()
        if request.role == "donor":
            if not request.blood_group:
                raise HTTPException(status_code=400, detail="Blood group is required for donors")
            donor = Donor(
                user_id=user.id,
                blood_group=request.blood_group,
                availability=True,
            )
            db.add(donor)
        db.commit()
        db.refresh(user)
    else:
        if user.name != request.name.strip() and request.name.strip():
            user.name = request.name.strip()
            db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role, "phone": user.phone})

    donor_id = None
    if user.role == "donor":
        d = db.query(Donor).filter(Donor.user_id == user.id).first()
        if d:
            donor_id = str(d.id)

    return {
        "token": token,
        "user_id": str(user.id),
        "donor_id": donor_id,
        "role": user.role,
    }
