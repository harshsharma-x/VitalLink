"""
Self-contained blood bank directory backed by SQLite.

Seeded from the hospitals CSV — every hospital in India that hosts a blood bank.
Each record gets deterministic blood-stock levels (seeded by row ID) so the
data is stable across restarts but looks realistic.
"""
from __future__ import annotations

import csv
import math
import os
import random
import sqlite3
import threading
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_DB_PATH  = os.path.join(os.path.dirname(__file__), "..", "bloodbanks.db")
_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "..",
                         "Datasets", "Hospitals In India (Anonymized) 2.csv")

# Blood groups in standard order
BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

# ── Schema ─────────────────────────────────────────────────────────────────
_DDL = """
CREATE TABLE IF NOT EXISTS blood_banks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    city        TEXT NOT NULL,
    state       TEXT NOT NULL,
    district    TEXT NOT NULL,
    latitude    REAL NOT NULL,
    longitude   REAL NOT NULL,
    rating      REAL DEFAULT 0.0,
    reviews     INTEGER DEFAULT 0,
    stock_ap    INTEGER DEFAULT 0,
    stock_an    INTEGER DEFAULT 0,
    stock_bp    INTEGER DEFAULT 0,
    stock_bn    INTEGER DEFAULT 0,
    stock_op    INTEGER DEFAULT 0,
    stock_on    INTEGER DEFAULT 0,
    stock_abp   INTEGER DEFAULT 0,
    stock_abn   INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_bb_state ON blood_banks(state);
CREATE INDEX IF NOT EXISTS idx_bb_city  ON blood_banks(city);
"""

# Column names for the 8 blood group stocks in order
_STOCK_COLS = ["stock_ap", "stock_an", "stock_bp", "stock_bn",
               "stock_op", "stock_on", "stock_abp", "stock_abn"]

# Realistic max-units per group (common groups have more supply)
_MAX_UNITS = [20, 8, 18, 7, 25, 10, 6, 4]   # A+,A-,B+,B-,O+,O-,AB+,AB-


def _gen_stock(seed: int) -> list[int]:
    """Generate deterministic blood stock for a blood bank."""
    rng = random.Random(seed)
    return [
        rng.randint(0, mx) if rng.random() > 0.15 else 0
        for mx in _MAX_UNITS
    ]


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    la1, lo1, la2, lo2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = la2 - la1, lo2 - lo1
    a = math.sin(dlat / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dlon / 2) ** 2
    return 2 * R * math.asin(math.sqrt(max(0.0, min(1.0, a))))


def _seed(conn: sqlite3.Connection):
    from services._name_gen import BloodBankNamer
    namer = BloodBankNamer()
    rows = []
    with open(_CSV_PATH, newline="", encoding="utf-8") as f:
        for idx, row in enumerate(csv.DictReader(f)):
            try:
                city     = row["City"].strip()
                district = row["District"].strip()
                state    = row["State"].strip()
                stock    = _gen_stock(seed=idx + 1)
                rows.append((
                    namer.name(city, district, state),
                    city,
                    state,
                    district,
                    float(row["Latitude"]),
                    float(row["Longitude"]),
                    float(row["Rating"]) if row["Rating"] else 0.0,
                    int(row["Number of Reviews"]) if row["Number of Reviews"] else 0,
                    *stock,
                ))
            except (ValueError, KeyError):
                pass

    cols = "name,city,state,district,latitude,longitude,rating,reviews," + ",".join(_STOCK_COLS)
    placeholders = ",".join(["?"] * (8 + len(_STOCK_COLS)))
    conn.executemany(
        f"INSERT INTO blood_banks ({cols}) VALUES ({placeholders})", rows
    )
    conn.commit()
    logger.info("Seeded %d blood banks from CSV → bloodbanks.db", len(rows))


def _init() -> sqlite3.Connection:
    conn = sqlite3.connect(os.path.abspath(_DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.executescript(_DDL)
    if conn.execute("SELECT COUNT(*) FROM blood_banks").fetchone()[0] == 0:
        _seed(conn)
    return conn


_conn: Optional[sqlite3.Connection] = None
_lock = threading.Lock()


def _get_conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        with _lock:
            if _conn is None:
                _conn = _init()
    return _conn


# ── Helpers ─────────────────────────────────────────────────────────────────

def _row_to_dict(r: sqlite3.Row, distance_km: Optional[float] = None) -> dict:
    stock = {
        bg: r[col]
        for bg, col in zip(BLOOD_GROUPS, _STOCK_COLS)
    }
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
        "stock":       stock,
        "total_units": sum(stock.values()),
    }
    if distance_km is not None:
        d["distance_km"] = round(distance_km, 2)
    return d


def _stock_col(blood_group: str) -> Optional[str]:
    mapping = {
        "A+": "stock_ap", "A-": "stock_an",
        "B+": "stock_bp", "B-": "stock_bn",
        "O+": "stock_op", "O-": "stock_on",
        "AB+": "stock_abp", "AB-": "stock_abn",
    }
    return mapping.get(blood_group)


# ── Public API ───────────────────────────────────────────────────────────────

def nearby(
    lat: float,
    lon: float,
    radius_km: float = 100,
    limit: int = 30,
    state: Optional[str] = None,
    blood_group: Optional[str] = None,
) -> list[dict]:
    """
    Blood banks within radius_km sorted by distance.
    Optionally filter by state or blood_group availability (stock > 0).
    """
    conn = _get_conn()
    where_parts, params = [], []

    if state:
        where_parts.append("state = ?")
        params.append(state)

    col = _stock_col(blood_group) if blood_group else None
    if col:
        where_parts.append(f"{col} > 0")

    where = ("WHERE " + " AND ".join(where_parts)) if where_parts else ""
    rows = conn.execute(f"SELECT * FROM blood_banks {where}", params).fetchall()

    results = []
    for r in rows:
        d = _haversine(lat, lon, r["latitude"], r["longitude"])
        if d <= radius_km:
            results.append(_row_to_dict(r, d))

    results.sort(key=lambda x: x["distance_km"])
    return results[:limit]


def search(
    state: Optional[str] = None,
    city: Optional[str] = None,
    blood_group: Optional[str] = None,
    offset: int = 0,
    limit: int = 50,
) -> list[dict]:
    conn = _get_conn()
    clauses, params = [], []

    if state:
        clauses.append("LOWER(state) LIKE ?")
        params.append(f"%{state.lower()}%")
    if city:
        clauses.append("LOWER(city) LIKE ?")
        params.append(f"%{city.lower()}%")

    col = _stock_col(blood_group) if blood_group else None
    if col:
        clauses.append(f"{col} > 0")

    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    rows = conn.execute(
        f"SELECT * FROM blood_banks {where} ORDER BY rating DESC LIMIT ? OFFSET ?",
        (*params, limit, offset),
    ).fetchall()
    return [_row_to_dict(r) for r in rows]


def all_states() -> list[dict]:
    conn = _get_conn()
    rows = conn.execute(
        "SELECT state, COUNT(*) as cnt FROM blood_banks GROUP BY state ORDER BY state"
    ).fetchall()
    return [{"state": r["state"], "count": r["cnt"]} for r in rows]


def get_by_id(bank_id: int) -> Optional[dict]:
    conn = _get_conn()
    r = conn.execute("SELECT * FROM blood_banks WHERE id=?", (bank_id,)).fetchone()
    return _row_to_dict(r) if r else None


def update_stock(bank_id: int, blood_group: str, units: int) -> Optional[dict]:
    """Adjust stock for a single blood group (add positive, subtract negative)."""
    col = _stock_col(blood_group)
    if not col:
        return None
    conn = _get_conn()
    conn.execute(
        f"UPDATE blood_banks SET {col} = MAX(0, {col} + ?) WHERE id = ?",
        (units, bank_id),
    )
    conn.commit()
    return get_by_id(bank_id)
