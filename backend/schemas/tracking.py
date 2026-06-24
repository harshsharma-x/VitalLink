from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class TrackingLocationUpdate(BaseModel):
    request_id: UUID
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class TrackingEventResponse(BaseModel):
    id: UUID
    request_id: UUID
    donor_id: UUID
    latitude: float
    longitude: float
    timestamp: datetime

    class Config:
        from_attributes = True

class TrackingStatusResponse(BaseModel):
    request_id: UUID
    donor_id: UUID
    current_latitude: float
    current_longitude: float
    status: str
    eta_minutes: Optional[int]
    last_updated: datetime
