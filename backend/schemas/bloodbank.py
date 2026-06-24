from pydantic import BaseModel, Field
from typing import Optional, Dict
from uuid import UUID
from datetime import datetime

class BloodBankResponse(BaseModel):
    id: UUID
    name: str
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    available_units: Optional[Dict]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
