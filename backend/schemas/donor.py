from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class DonorCreate(BaseModel):
    user_id: UUID
    blood_group: str = Field(..., max_length=10)
    availability: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DonorUpdate(BaseModel):
    blood_group: Optional[str] = Field(None, max_length=10)
    availability: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    reliability_score: Optional[float] = None

class DonorResponse(BaseModel):
    id: UUID
    user_id: UUID
    blood_group: str
    availability: bool
    latitude: Optional[float]
    longitude: Optional[float]
    reliability_score: float
    donation_count: Optional[int] = 0
    last_donation_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DonorAvailabilityUpdate(BaseModel):
    availability: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
