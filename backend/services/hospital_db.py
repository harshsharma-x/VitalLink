"""
Self-contained hospital directory backed by SQLite.

On first import the module seeds itself from the CSV.
The DB file lives at  backend/hospitals.db  (gitignore it if desired).
"""
from __future__ import annotations

import csv
import math
import os
import sqlite3
import threading
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_DB_PATH  = os.path.join(os.path.dirname(__file__), "..", "hospitals.db")
_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "..",
                          "Datasets", "Hospitals In India (Anonymized) 2.csv")
_READY    = threading.Event()


# ── Schema ─────────────────────────────────────────────────────────────────
_DDL = """
CREATE TABLE IF NOT EXISTS hospitals (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT NOT NULL,
    city      TEXT NOT NULL,
    state     TEXT NOT NULL,
    district  TEXT NOT NULL,
    latitude  REAL NOT NULL,
    longitude REAL NOT NULL,
    rating    REAL DEFAULT 0.0,
    reviews   INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_hosp_state ON hospitals(state);
CREATE INDEX IF NOT EXISTS idx_hosp_city  ON hospitals(city);
"""


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    la1, lo1, la2, lo2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = la2 - la1, lo2 - lo1
    a = math.sin(dlat / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dlon / 2) ** 2
    return 2 * R * math.asin(math.sqrt(max(0.0, min(1.0, a))))


def _seed(conn: sqlite3.Connection):
    """Load the CSV into the hospitals table (runs once)."""
    from services._name_gen import HospitalNamer
    namer = HospitalNamer()
    rows = []
    with open(_CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            try:
                city     = row["City"].strip()
                district = row["District"].strip()
                state    = row["State"].strip()
                rows.append((
                    namer.name(city, district, state),
                    city,
                    state,
                    district,
                    float(row["Latitude"]),
                    float(row["Longitude"]),
                    float(row["Rating"]) if row["Rating"] else 0.0,
                    int(row["Number of Reviews"]) if row["Number of Reviews"] else 0,
                ))
            except (ValueError, KeyError):
                pass

    conn.executemany(
        "INSERT INTO hospitals (name,city,state,district,latitude,longitude,rating,reviews) "
        "VALUES (?,?,?,?,?,?,?,?)",
        rows,
    )
    conn.commit()
    logger.info("Seeded %d hospitals from CSV → hospitals.db", len(rows))


def _init():
    db_path = os.path.abspath(_DB_PATH)
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.executescript(_DDL)
    if conn.execute("SELECT COUNT(*) FROM hospitals").fetchone()[0] == 0:
        _seed(conn)
    _READY.set()
    return conn


# ── Single connection (module-level, thread-safe reads) ────────────────────
_conn: Optional[sqlite3.Connection] = None
_lock = threading.Lock()


def _get_conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        with _lock:
            if _conn is None:
                _conn = _init()
    return _conn


# ── Public API ──────────────────────────────────────────────────────────────

def nearby(lat: float, lon: float, radius_km: float = 100,
           limit: int = 30, state: Optional[str] = None) -> list[dict]:
    """Return hospitals within radius_km, sorted nearest-first."""
    conn = _get_conn()
    where = "WHERE state = ?" if state else ""
    params = (state,) if state else ()
    rows = conn.execute(
        f"SELECT * FROM hospitals {where}", params
    ).fetchall()

    results = []
    for r in rows:
        d = _haversine(lat, lon, r["latitude"], r["longitude"])
        if d <= radius_km:
            results.append(_row_to_dict(r, d))

    results.sort(key=lambda x: x["distance_km"])
    return results[:limit]


def search(state: Optional[str] = None, city: Optional[str] = None,
           offset: int = 0, limit: int = 50) -> list[dict]:
    """Browse hospitals by state / city, ordered by rating desc."""
    conn = _get_conn()
    clauses, params = [], []
    if state:
        clauses.append("LOWER(state) LIKE ?")
        params.append(f"%{state.lower()}%")
    if city:
        clauses.append("LOWER(city) LIKE ?")
        params.append(f"%{city.lower()}%")
    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    rows = conn.execute(
        f"SELECT * FROM hospitals {where} ORDER BY rating DESC LIMIT ? OFFSET ?",
        (*params, limit, offset),
    ).fetchall()
    return [_row_to_dict(r) for r in rows]


def all_states() -> list[dict]:
    conn = _get_conn()
    rows = conn.execute(
        "SELECT state, COUNT(*) as cnt FROM hospitals GROUP BY state ORDER BY state"
    ).fetchall()
    return [{"state": r["state"], "count": r["cnt"]} for r in rows]


def get_by_id(hospital_id: int) -> Optional[dict]:
    conn = _get_conn()
    r = conn.execute("SELECT * FROM hospitals WHERE id=?", (hospital_id,)).fetchone()
    return _row_to_dict(r) if r else None


def _row_to_dict(r: sqlite3.Row, distance_km: Optional[float] = None) -> dict:
    d = {
        "id":          r["id"],
        "name":        r["name"],
        "city":        r["city"],
        "state":       r["state"],
        "district":    r["district"],
        "latitude":    r["latitude"],
        "longitude":   r["longitude"],
        "rating":      r["rating"],
        "reviews":     r["reviews"],
    }
    if distance_km is not None:
        d["distance_km"] = round(distance_km, 2)
    return d
