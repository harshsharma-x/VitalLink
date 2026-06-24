from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class EmergencyRequestCreate(BaseModel):
    blood_group: str = Field(..., max_length=10)
    units_required: int = Field(default=1, ge=1)
    hospital_name: str = Field(..., max_length=255)
    hospital_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    urgency: str = Field(default="high", pattern="^(low|medium|high|critical)$")

class EmergencyRequestResponse(BaseModel):
    id: UUID
    patient_id: UUID
    blood_group: str
    units_required: int
    hospital_name: str
    hospital_address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    urgency: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EmergencyRequestCancel(BaseModel):
    status: str = "cancelled"
