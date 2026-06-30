from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Float, Integer, Text, JSON, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
import uuid


class User(BaseModel):
    __tablename__ = "users"

    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False, unique=True)
    role = Column(String(20), nullable=False)

    donor = relationship("Donor", back_populates="user", uselist=False)
    requests = relationship("EmergencyRequest", back_populates="patient")


class Donor(BaseModel):
    __tablename__ = "donors"

    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    blood_group = Column(String(10), nullable=False)
    availability = Column(Boolean, default=False)
    latitude = Column(Float)
    longitude = Column(Float)
    reliability_score = Column(Float, default=0.0)
    donation_count = Column(Integer, default=0)
    last_donation_date = Column(DateTime(timezone=True))
    push_token = Column(String(255), nullable=True)

    user = relationship("User", back_populates="donor")
    matches = relationship("Match", back_populates="donor")
    tracking_events = relationship("TrackingEvent", back_populates="donor")


class EmergencyRequest(BaseModel):
    __tablename__ = "emergency_requests"

    patient_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    blood_group = Column(String(10), nullable=False)
    units_required = Column(Integer, nullable=False, default=1)
    hospital_name = Column(String(255), nullable=False)
    hospital_address = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    urgency = Column(String(20), nullable=False, default="critical")
    status = Column(String(20), nullable=False, default="pending")

    patient = relationship("User", back_populates="requests")
    matches = relationship("Match", back_populates="request")
    tracking_events = relationship("TrackingEvent", back_populates="request")


class Match(BaseModel):
    __tablename__ = "matches"

    request_id = Column(Uuid(as_uuid=True), ForeignKey("emergency_requests.id", ondelete="CASCADE"), nullable=False)
    donor_id = Column(Uuid(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False, default=0.0)
    status = Column(String(20), nullable=False, default="pending")

    request = relationship("EmergencyRequest", back_populates="matches")
    donor = relationship("Donor", back_populates="matches")


class TrackingEvent(BaseModel):
    __tablename__ = "tracking_events"

    request_id = Column(Uuid(as_uuid=True), ForeignKey("emergency_requests.id", ondelete="CASCADE"), nullable=False)
    donor_id = Column(Uuid(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    request = relationship("EmergencyRequest", back_populates="tracking_events")
    donor = relationship("Donor", back_populates="tracking_events")


class BloodBank(BaseModel):
    __tablename__ = "blood_banks_pg"

    name = Column(String(255), nullable=False)
    address = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    available_units = Column(JSON, default={})


class OTPStore(BaseModel):
    __tablename__ = "otp_store"

    phone = Column(String(20), nullable=False, index=True)
    otp_hash = Column(String(64), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    verified = Column(Boolean, default=False)
