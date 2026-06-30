from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database.database import get_db
from schemas.auth import LoginRequest, LoginResponse, UserResponse
from services.auth_service import login_user, get_current_user_info
from utils.jwt import get_current_user, create_access_token
from models.models import User, Donor

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    result = login_user(db, request)
    return result

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return get_current_user_info(current_user)


class DemoLoginRequest(BaseModel):
    name: str
    phone: str
    role: str
    blood_group: Optional[str] = None


@router.post("/demo", status_code=status.HTTP_200_OK)
def demo_login(request: DemoLoginRequest, db: Session = Depends(get_db)):
    """No-Firebase login for demo/testing. Creates or fetches the user and returns a real JWT."""
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
