from __future__ import annotations

import logging
import os
from typing import Optional, Generator

from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.orm import sessionmaker, Session
from .base import Base

logger = logging.getLogger(__name__)

_raw_url = os.getenv("DATABASE_URL", "sqlite:///./vitallink.db")
# Render (and Heroku) return postgres:// — SQLAlchemy needs postgresql://
DATABASE_URL = _raw_url.replace("postgres://", "postgresql://", 1)

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


def get_db_for_task() -> Session:
    """Return a DB session for background tasks. Caller is responsible for closing."""
    _get_engine()
    return _SessionLocal()


def _migrate_add_columns(eng) -> None:
    """Add new columns to existing tables without full Alembic setup."""
    migrations = [
        ("users",  "push_token", "VARCHAR(255)"),
        ("users",  "email",      "VARCHAR(255)"),
        ("users",  "google_id",  "VARCHAR(255)"),
    ]
    insp = inspect(eng)
    with eng.connect() as conn:
        for table, col, col_type in migrations:
            existing = {c["name"] for c in insp.get_columns(table)}
            if col not in existing:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                conn.commit()
                logger.info("Added column %s.%s", table, col)


def init_db():
    try:
        eng = _get_engine()
        Base.metadata.create_all(bind=eng)
        _migrate_add_columns(eng)
        logger.info("Database tables initialised at %s", DATABASE_URL)
    except Exception as exc:
        logger.error("Could not initialise DB: %s", exc)
        raise
