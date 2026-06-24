from sqlalchemy.orm import Session
from models.models import BloodBank
from typing import List

def get_blood_banks(db: Session, skip: int = 0, limit: int = 100) -> List[BloodBank]:
    return db.query(BloodBank).offset(skip).limit(limit).all()

def get_blood_bank(db: Session, bank_id) -> BloodBank:
    bank = db.query(BloodBank).filter(BloodBank.id == bank_id).first()
    if not bank:
        raise HTTPException(status_code=404, detail="Blood bank not found")
    return bank

def get_live_stock(db: Session) -> List[dict]:
    banks = db.query(BloodBank).all()
    return [{"id": b.id, "name": b.name, "stock": b.available_units or {}} for b in banks]
