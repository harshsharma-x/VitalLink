from __future__ import annotations

import logging
import os
from typing import Optional, Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from .base import Base

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./vitallink.db",
)

_engine = None
_SessionLocal = None


def _get_engine():
    global _engine, _SessionLocal
    if _engine is None:
        kwargs = {}
        if DATABASE_URL.startswith("sqlite"):
            kwargs["connect_args"] = {"check_same_thread": False}
        _engine = create_engine(DATABASE_URL, pool_pre_ping=True, **kwargs)
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

        # Enable WAL mode for SQLite (better concurrent read performance)
        if DATABASE_URL.startswith("sqlite"):
            @event.listens_for(_engine, "connect")
            def set_sqlite_pragma(dbapi_conn, _):
                cursor = dbapi_conn.cursor()
                cursor.execute("PRAGMA journal_mode=WAL")
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.close()

    return _engine


def get_db() -> Generator[Session, None, None]:
    eng = _get_engine()
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    try:
        eng = _get_engine()
        Base.metadata.create_all(bind=eng)
        logger.info("Database tables initialised at %s", DATABASE_URL)
    except Exception as exc:
        logger.error("Could not initialise DB: %s", exc)
        raise
