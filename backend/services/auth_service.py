from sqlalchemy.orm import Session
from models.models import User, Donor
from schemas.auth import LoginRequest
from utils.jwt import create_access_token
from services.firebase_service import verify_firebase_token, is_firebase_enabled
from fastapi import HTTPException, status

def login_user(db: Session, request: LoginRequest) -> dict:
    # Verify Firebase token when Firebase is configured
    if is_firebase_enabled():
        if not request.firebase_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Phone verification required. Please verify your number via OTP."
            )
        verified_phone = verify_firebase_token(request.firebase_token)
        if verified_phone is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired OTP token. Please verify again."
            )
        # Normalise both to digits-only for comparison
        req_digits = ''.join(filter(str.isdigit, request.phone))[-10:]
        tok_digits = ''.join(filter(str.isdigit, verified_phone))[-10:]
        if req_digits != tok_digits:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Phone number mismatch. Please verify the correct number."
            )

    # Check if user exists
    user = db.query(User).filter(User.phone == request.phone).first()

    if not user:
        # Create new user
        user = User(
            name=request.name,
            phone=request.phone,
            role=request.role
        )
        db.add(user)
        db.flush()

        # If donor, create donor record
        if request.role == "donor":
            if not request.blood_group:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Blood group required for donor registration"
                )
            donor = Donor(
                user_id=user.id,
                blood_group=request.blood_group,
                availability=False
            )
            db.add(donor)

        db.commit()
        db.refresh(user)
    else:
        # Update name if changed
        if user.name != request.name:
            user.name = request.name
            db.commit()

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role,
        "phone": user.phone
    })

    return {
        "token": token,
        "user_id": user.id,
        "role": user.role
    }

def get_current_user_info(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "role": user.role
    }
