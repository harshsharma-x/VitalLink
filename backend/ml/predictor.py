"""
ML inference wrapper for donor-request matching.

Loads the trained model once (lazy singleton) and exposes
`score_donors()` which ranks a list of donor dicts for a given request.
"""

import os
import datetime
import logging
from math import radians, cos, sin, asin, sqrt
from typing import Any

import joblib
import pandas as pd

logger = logging.getLogger(__name__)

_MODEL      = None
_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'matching_model.pkl')

# Which donor types can give to which recipient type
_COMPATIBLE: dict[str, list[str]] = {
    'A+':  ['A+', 'A-', 'O+', 'O-'],
    'A-':  ['A-', 'O-'],
    'B+':  ['B+', 'B-', 'O+', 'O-'],
    'B-':  ['B-', 'O-'],
    'O+':  ['O+', 'O-'],
    'O-':  ['O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    'AB-': ['A-', 'B-', 'O-', 'AB-'],
}

_URGENCY_MAP = {'critical': 3, 'day': 2, 'planned': 1}


def _load_model() -> dict[str, Any]:
    global _MODEL
    if _MODEL is None:
        if not os.path.exists(_MODEL_PATH):
            raise FileNotFoundError(
                f"Matching model not found at {_MODEL_PATH}. "
                "Run `python -m ml.train_model` from the backend/ directory first."
            )
        _MODEL = joblib.load(_MODEL_PATH)
        meta = _MODEL.get('meta', {})
        logger.info(
            "Loaded matching model  score_mae=%.4f  accept_auc=%.4f",
            meta.get('score_mae', 0),
            meta.get('accept_auc', 0),
        )
    return _MODEL


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in kilometres."""
    R = 6371.0
    la1, lo1, la2, lo2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = la2 - la1
    dlon = lo2 - lo1
    a = sin(dlat / 2) ** 2 + cos(la1) * cos(la2) * sin(dlon / 2) ** 2
    return 2 * R * asin(sqrt(a))


def _compat_score(donor_type: str, recipient_type: str) -> float:
    if donor_type == recipient_type:
        return 1.0
    if donor_type not in _COMPATIBLE.get(recipient_type, []):
        return 0.0
    if donor_type in ('O-', 'O+'):
        return 0.85
    return 0.70


def _days_since(last_donation_date) -> float:
    """Return days since last donation; returns 999 if never donated."""
    if last_donation_date is None:
        return 999.0
    if isinstance(last_donation_date, datetime.datetime):
        delta = datetime.datetime.utcnow() - last_donation_date.replace(tzinfo=None)
    else:
        delta = datetime.date.today() - last_donation_date
    return max(0.0, delta.days + (delta.seconds / 86400))


def _build_feature_row(donor, request_dict: dict[str, Any], hour: int) -> dict:
    """
    Build a single feature row from a Donor ORM object and a request dict.
    Compatible with both ORM objects and plain dicts (for testing).
    """
    def g(obj, key, default=None):
        return getattr(obj, key, None) if not isinstance(obj, dict) else obj.get(key, default)

    req_blood  = request_dict.get('blood_group', 'O+')
    req_lat    = request_dict.get('latitude')  or 30.90
    req_lon    = request_dict.get('longitude') or 75.85
    urgency    = request_dict.get('urgency', 'critical')
    units      = request_dict.get('units_required', 1)

    d_blood    = g(donor, 'blood_group', 'O+')
    d_lat      = g(donor, 'latitude')  or (req_lat + 0.02)
    d_lon      = g(donor, 'longitude') or (req_lon + 0.02)
    d_rel      = float(g(donor, 'reliability_score') or 50.0)
    d_avail    = bool(g(donor, 'availability', False))
    d_last_don = g(donor, 'last_donation_date')
    d_count    = int(g(donor, 'donation_count') or 0)

    compat      = d_blood in _COMPATIBLE.get(req_blood, [])
    compat_sc   = _compat_score(d_blood, req_blood)
    dist        = min(_haversine(d_lat, d_lon, req_lat, req_lon), 50.0)
    days_since  = _days_since(d_last_don)
    eligible    = days_since >= 56

    return {
        'blood_compatible':         int(compat),
        'compatibility_score':      compat_sc,
        'distance_km':              dist,
        'distance_bucket':          min(5, int(dist // 4)),
        'reliability_score':        d_rel,
        'is_available':             int(d_avail),
        'days_since_last_donation': days_since,
        'is_eligible':              int(eligible),
        'urgency_score':            _URGENCY_MAP.get(urgency, 3),
        'units_required':           int(units),
        'hour_of_day':              hour,
        'donation_count':           d_count,
    }


def score_donors(request_dict: dict[str, Any], donors: list) -> list:
    """
    Score and rank donors for a blood request.

    Args:
        request_dict: keys: blood_group, latitude, longitude, urgency,
                      units_required
        donors:       list of Donor ORM objects (or plain dicts for testing)

    Returns:
        List of (donor, ml_score) tuples sorted by ml_score descending.
        Incompatible donors (score == 0.0) are excluded.
    """
    if not donors:
        return []

    model       = _load_model()
    score_mdl   = model['score_model']
    accept_mdl  = model['accept_model']
    feature_cols = model['features']

    hour = datetime.datetime.now().hour

    rows = [_build_feature_row(d, request_dict, hour) for d in donors]
    X    = pd.DataFrame(rows)[feature_cols]

    score_preds   = score_mdl.predict(X)
    accept_probas = accept_mdl.predict_proba(X)[:, 1]

    # Combined ranking: 65 % match quality + 35 % accept probability
    final_scores = 0.65 * score_preds + 0.35 * accept_probas

    results = []
    for donor, score in zip(donors, final_scores):
        if score > 0.0:          # drop completely incompatible donors
            results.append((donor, float(score)))

    results.sort(key=lambda x: x[1], reverse=True)
    return results
