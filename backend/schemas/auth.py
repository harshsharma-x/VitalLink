from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class LoginRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=10, max_length=20)
    role: str = Field(..., pattern="^(patient|donor)$")
    blood_group: Optional[str] = Field(None, max_length=10)

class LoginResponse(BaseModel):
    token: str
    user_id: UUID
    role: str

class UserResponse(BaseModel):
    id: UUID
    name: str
    phone: str
    role: str

    class Config:
        from_attributes = True

class TokenData(BaseModel):
    user_id: Optional[UUID] = None
    role: Optional[str] = None
