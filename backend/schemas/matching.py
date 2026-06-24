from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class MatchCreate(BaseModel):
    request_id: UUID
    donor_id: UUID
    score: float = Field(default=0.0, ge=0.0, le=1.0)

class MatchResponse(BaseModel):
    id: UUID
    request_id: UUID
    donor_id: UUID
    score: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MatchAccept(BaseModel):
    match_id: UUID

class MatchReject(BaseModel):
    match_id: UUID

class MatchingStart(BaseModel):
    request_id: UUID

class MatchingResult(BaseModel):
    request_id: UUID
    matches: List[MatchResponse]
    donors_alerted: int
