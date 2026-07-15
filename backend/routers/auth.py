import os
import re
import random
import hashlib
import logging
import time
from datetime import datetime, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database.database import get_db
from schemas.auth import LoginRequest, LoginResponse, UserResponse
from services.auth_service import login_user, get_current_user_info
from utils.jwt import get_current_user, create_access_token
from models.models import User, Donor, OTPStore

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── Rate limiting helper per-phone ────────────────────────────────────────────
_otp_rate: dict[str, list[float]] = {}

def _check_otp_rate_limit(phone: str, max_per_hour: int = 5) -> None:
    """Rate-limit OTP requests per phone number."""
    now = time.time()
    window_start = now - 3600
    records = [t for t in _otp_rate.get(phone, []) if t > window_start]
    if len(records) >= max_per_hour:
        raise HTTPException(
            status_code=429,
            detail=f"OTP rate limit reached. Max {max_per_hour} OTPs per hour per number."
        )
    records.append(now)
    _otp_rate[phone] = records


# ── Google OAuth login ────────────────────────────────────────────────────────

class GoogleLoginRequest(BaseModel):
    id_token: str
    role: str = Field(..., pattern="^(patient|donor)$")
    blood_group: Optional[str] = Field(None, max_length=10)


@router.post("/google", status_code=status.HTTP_200_OK)
def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Verify a Google ID token and create / return a user.
    Uses Google's tokeninfo endpoint (no extra SDK needed).
    """
    try:
        r = httpx.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": request.id_token},
            timeout=10,
        )
        if r.status_code != 200:
            logger.warning("Google token verification failed: %s", r.text)
            raise HTTPException(status_code=401, detail="Invalid Google token")
        info = r.json()
    except httpx.RequestError as exc:
        logger.error("Google tokeninfo request failed: %s", exc)
        raise HTTPException(status_code=502, detail="Could not verify Google token")

    google_id = info.get("sub")
    email = info.get("email", "")
    name = info.get("name", "")

    if not google_id or not email:
        raise HTTPException(status_code=400, detail="Google token missing required claims")

    # Verify the token audience matches our Google Client ID (security best practice)
    allowed_aud = os.getenv("GOOGLE_CLIENT_ID", "")
    if allowed_aud and info.get("aud") != allowed_aud:
        logger.warning("Google token audience mismatch: expected %s, got %s", allowed_aud, info.get("aud"))
        raise HTTPException(status_code=401, detail="Token audience mismatch")

    # Look up existing user by google_id or email
    user = (
        db.query(User)
        .filter((User.google_id == google_id) | (User.email == email))
        .first()
    )

    if not user:
        # Create new user
        if not name.strip():
            name = email.split("@")[0]
        if request.role not in ("patient", "donor"):
            raise HTTPException(status_code=400, detail="Role must be patient or donor")

        user = User(
            name=name.strip(),
            email=email,
            google_id=google_id,
            role=request.role,
        )
        db.add(user)
        db.flush()

        if request.role == "donor":
            if not request.blood_group:
                raise HTTPException(status_code=400, detail="Blood group required for donors")
            donor = Donor(
                user_id=user.id,
                blood_group=request.blood_group,
                availability=True,
            )
            db.add(donor)

        db.commit()
        db.refresh(user)
        logger.info("New user created via Google: %s (%s)", email, request.role)
    else:
        # Update Google ID if signing in with a different Google account that matches email
        if not user.google_id:
            user.google_id = google_id
            db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})

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
        "name": user.name,
        "email": user.email or "",
    }


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
            bg = request.blood_group or "O+"
            donor = Donor(
                user_id=user.id,
                blood_group=bg,
                availability=True,
                reliability_score=80.0,
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
    blood_group = None
    if user.role == "donor":
        donor = db.query(Donor).filter(Donor.user_id == user.id).first()
        if donor:
            donor_id = str(donor.id)
            blood_group = donor.blood_group

    return {
        "token": token,
        "user_id": str(user.id),
        "donor_id": donor_id,
        "blood_group": blood_group,
        "name": user.name,
        "role": user.role,
    }


# ── OTP authentication ─────────────────────────────────────────────────────────

class UserPushTokenUpdate(BaseModel):
    push_token: str


@router.post("/push-token", status_code=status.HTTP_200_OK)
def save_user_push_token(
    data: UserPushTokenUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save Expo push token for the current user (patients + donors)."""
    current_user.push_token = data.push_token
    db.commit()
    return {"ok": True}


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
        logger.info("[DEV] OTP for +91%s -> %s", phone, otp)
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
    """Generate and send a 6-digit OTP to the given phone number (rate-limited)."""
    phone = request.phone.strip()
    if not re.match(r'^[6-9]\d{9}$', phone):
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit Indian mobile number")

    # Rate limit: max 5 OTPs per phone per hour
    _check_otp_rate_limit(phone, max_per_hour=5)

    otp = str(random.randint(100000, 999999))
    otp_hash = hashlib.sha256(otp.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Remove any previous OTPs for this phone
    db.query(OTPStore).filter(OTPStore.phone == phone).delete()
    db.add(OTPStore(phone=phone, otp_hash=otp_hash, expires_at=expires_at))
    db.commit()

    sms_sent = _send_sms_fast2sms(phone, otp)

    resp: dict = {"ok": True}
    if not sms_sent:
        # Dev mode: return the OTP so the app can auto-fill it
        resp["dev_otp"] = otp
        resp["message"] = "OTP generated (SMS not configured - dev_otp visible for testing)"
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

    if datetime.utcnow() > record.expires_at:
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
