from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database.database import get_db
from schemas.auth import LoginRequest, LoginResponse, UserResponse
from services.auth_service import login_user, get_current_user_info
from utils.jwt import get_current_user
from models.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    result = login_user(db, request)
    return result

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return get_current_user_info(current_user)
