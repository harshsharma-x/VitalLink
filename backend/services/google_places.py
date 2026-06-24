"""
Google Places API client for nearby hospitals and blood banks.

Set GOOGLE_PLACES_API_KEY in backend/.env to enable real data.
Falls back to the SQLite CSV data when the key is absent.

Docs: https://developers.google.com/maps/documentation/places/web-service/search-nearby
"""
from __future__ import annotations

import logging
import math
import os
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

logger = logging.getLogger(__name__)

_NEARBY_URL  = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"


def api_key() -> str:
    return os.getenv("GOOGLE_PLACES_API_KEY", "").strip()


def is_configured() -> bool:
    return bool(api_key())


# ── Distance helper ──────────────────────────────────────────────────────────

def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    la1, lo1, la2, lo2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = la2 - la1, lo2 - lo1
    a = math.sin(dlat / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dlon / 2) ** 2
    return 2 * R * math.asin(math.sqrt(max(0.0, min(1.0, a))))


# ── Raw Google Places fetch ──────────────────────────────────────────────────

def _fetch_nearby(lat: float, lon: float, place_type: str,
                  radius_m: int, keyword: Optional[str] = None) -> list[dict]:
    """
    Fetches up to 60 places (3 pages × 20) from the Nearby Search API.
    Uses synchronous httpx so FastAPI routes don't need to be async.
    """
    key    = api_key()
    params = {
        "location": f"{lat},{lon}",
        "radius":   radius_m,
        "type":     place_type,
        "key":      key,
    }
    if keyword:
        params["keyword"] = keyword

    results: list[dict] = []
    next_page: Optional[str] = None

    with httpx.Client(timeout=10.0) as client:
        for page in range(3):          # max 3 pages = 60 results
            if page > 0:
                if not next_page:
                    break
                import time; time.sleep(2)   # Google requires a short delay before next page
                params = {"pagetoken": next_page, "key": key}

            resp = client.get(_NEARBY_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

            status = data.get("status")
            if status == "ZERO_RESULTS":
                break
            if status not in ("OK", "UNKNOWN_ERROR"):
                raise RuntimeError(f"Google Places API error: {status} — {data.get('error_message', '')}")

            results.extend(data.get("results", []))
            next_page = data.get("next_page_token")

    return results


# ── Formatters ───────────────────────────────────────────────────────────────

def _parse_address(vicinity: str) -> tuple[str, str]:
    """
    Best-effort extraction of city and state from a Google vicinity string.
    Example: "Near Gandhi Nagar, Ludhiana" → ("Ludhiana", "")
    """
    parts = [p.strip() for p in vicinity.split(",")]
    city  = parts[-1] if parts else ""
    state = parts[-2] if len(parts) >= 2 else ""
    return city, state


def _fmt_hospital(p: dict, user_lat: float, user_lon: float) -> dict:
    loc  = p["geometry"]["location"]
    lat, lon = loc["lat"], loc["lng"]
    city, state = _parse_address(p.get("vicinity", ""))
    return {
        "id":           p["place_id"],
        "name":         p.get("name", "Unknown"),
        "address":      p.get("vicinity", ""),
        "city":         city,
        "state":        state,
        "district":     city,
        "latitude":     lat,
        "longitude":    lon,
        "rating":       p.get("rating", 0.0),
        "reviews":      p.get("user_ratings_total", 0),
        "open_now":     p.get("opening_hours", {}).get("open_now"),
        "distance_km":  round(_haversine(user_lat, user_lon, lat, lon), 2),
        "place_id":     p["place_id"],
        "maps_url":     f"https://www.google.com/maps/place/?q=place_id:{p['place_id']}",
        "source":       "google",
    }


def _fmt_blood_bank(p: dict, user_lat: float, user_lon: float) -> dict:
    base = _fmt_hospital(p, user_lat, user_lon)
    base["stock"] = None        # Google Places doesn't expose stock levels
    base["total_units"] = None
    return base


# ── Public API ───────────────────────────────────────────────────────────────

def nearby_hospitals(lat: float, lon: float,
                     radius_km: float = 5, limit: int = 20) -> list[dict]:
    radius_m = min(int(radius_km * 1000), 50_000)
    places   = _fetch_nearby(lat, lon, "hospital", radius_m)
    results  = [_fmt_hospital(p, lat, lon) for p in places]
    results.sort(key=lambda x: x["distance_km"])
    return results[:limit]


def nearby_blood_banks(lat: float, lon: float,
                       radius_km: float = 5, limit: int = 20) -> list[dict]:
    radius_m = min(int(radius_km * 1000), 50_000)
    # "blood_bank" is a first-class Google Places type
    places = _fetch_nearby(lat, lon, "blood_bank", radius_m)

    # If no dedicated blood banks found, search by keyword inside hospitals
    if not places:
        places = _fetch_nearby(lat, lon, "health", radius_m, keyword="blood bank")

    results = [_fmt_blood_bank(p, lat, lon) for p in places]
    results.sort(key=lambda x: x["distance_km"])
    return results[:limit]
