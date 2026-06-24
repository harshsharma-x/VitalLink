from __future__ import annotations

import logging
import os
from typing import Optional, Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .base import Base

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/vitallink",
)

# Lazily created — avoids crashing at import time when PostgreSQL is unavailable.
_engine = None
_SessionLocal = None


def _get_engine():
    global _engine, _SessionLocal
    if _engine is None:
        try:
            _engine = create_engine(DATABASE_URL, pool_pre_ping=True)
            _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
        except Exception as exc:
            logger.warning("Could not create DB engine: %s", exc)
            raise
    return _engine


# Expose engine/SessionLocal as module-level names (may be None until first use)
engine = None
SessionLocal = None


def get_db() -> Generator[Optional[Session], None, None]:
    try:
        eng = _get_engine()
        db = _SessionLocal()
        try:
            yield db
        finally:
            db.close()
    except Exception:
        yield None  # type: ignore[misc]


def init_db():
    try:
        eng = _get_engine()
        Base.metadata.create_all(bind=eng)
        logger.info("Database tables initialised.")
    except Exception as exc:
        logger.warning("Could not initialise DB (PostgreSQL not available): %s", exc)
