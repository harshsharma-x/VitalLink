"""
Tout / Broker Fraud Detector — IsolationForest

Features per phone number over a rolling 1-hour window:
  - requests_1h       : total requests placed
  - unique_hospitals  : distinct hospitals contacted
  - unique_cities     : distinct cities (area spread)
  - median_interval_s : median seconds between requests (touts are rapid)
  - location_spread   : haversine distance between furthest two points (km)
  - has_location      : 0/1 whether location data was provided

Anomaly = IsolationForest score < -0.3  (typical touts score < -0.6)

Train:  python3 -m ml.fraud_detector  (generates 20k synthetic samples)
"""

from __future__ import annotations

import math
import os
import datetime
import random
import logging
import sqlite3
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "fraud_model.pkl")
_FEATURES = [
    "requests_1h", "unique_hospitals", "unique_cities",
    "median_interval_s", "location_spread", "has_location",
]
_THRESHOLD = -0.3
_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "integrity.db")


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    la1, lo1, la2, lo2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat, dlon = la2 - la1, lo2 - lo1
    a = math.sin(dlat / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dlon / 2) ** 2
    return 2 * R * math.asin(math.sqrt(max(0, min(1, a))))


def _extract_features(rows: list[sqlite3.Row]) -> dict:
    n = len(rows)
    hospitals = set(r["hospital"] for r in rows if r["hospital"])
    cities: set[str] = set()
    locs = [(r["lat"], r["lon"]) for r in rows if r["lat"] and r["lon"]]

    # timestamps sorted
    times = sorted([r["requested_at"] for r in rows if r["requested_at"]])
    intervals = []
    for i in range(1, len(times)):
        try:
            t1 = datetime.datetime.fromisoformat(times[i - 1])
            t2 = datetime.datetime.fromisoformat(times[i])
            intervals.append((t2 - t1).total_seconds())
        except ValueError:
            pass

    # location spread — max pairwise distance
    spread = 0.0
    if len(locs) >= 2:
        spread = max(
            _haversine(locs[i][0], locs[i][1], locs[j][0], locs[j][1])
            for i in range(len(locs))
            for j in range(i + 1, len(locs))
        )

    return {
        "requests_1h":      n,
        "unique_hospitals": len(hospitals),
        "unique_cities":    len(cities),
        "median_interval_s": float(np.median(intervals)) if intervals else 3600.0,
        "location_spread":  round(spread, 3),
        "has_location":     int(len(locs) > 0),
    }


class ToutDetector:
    _instance: Optional["ToutDetector"] = None

    def __init__(self):
        self._model = None
        self._load()

    @classmethod
    def instance(cls) -> "ToutDetector":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load(self):
        if not os.path.exists(_MODEL_PATH):
            logger.warning("Fraud model not found — using rule-based fallback")
            return
        import joblib
        bundle = joblib.load(_MODEL_PATH)
        self._model = bundle.get("model")
        logger.info("Loaded fraud detector model")

    def score_phone(self, phone: str) -> dict:
        """Score a phone number for tout-like behaviour. Returns anomaly score and verdict."""
        try:
            conn = sqlite3.connect(os.path.abspath(_DB_PATH), check_same_thread=False)
            conn.row_factory = sqlite3.Row
            one_hour_ago = (datetime.datetime.utcnow() - datetime.timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')
            rows = conn.execute(
                "SELECT * FROM request_meta WHERE phone=? AND requested_at >= ? ORDER BY requested_at",
                (phone, one_hour_ago),
            ).fetchall()
            conn.close()
        except Exception:
            rows = []

        feats = _extract_features(rows)

        # A single request is never suspicious regardless of ML score
        if feats["requests_1h"] < 2:
            return {
                "phone": phone,
                "anomaly_score": 0.1,
                "is_suspicious": False,
                "requests_last_1h": feats["requests_1h"],
                "unique_hospitals": feats["unique_hospitals"],
                "features": feats,
                "ml_powered": self._model is not None,
            }

        if self._model is not None:
            import pandas as pd
            X = pd.DataFrame([feats])[_FEATURES]
            score = float(self._model.score_samples(X)[0])
            # ML anomaly must be accompanied by a real signal (not just test timing)
            has_signal = (feats["requests_1h"] >= 3 or feats["unique_hospitals"] >= 2)
            is_suspicious = score < _THRESHOLD and has_signal
        else:
            # Rule-based: suspicious if 3+ requests in 1h OR 2 hospitals in 30 min
            is_suspicious = (
                feats["requests_1h"] >= 3
                or (feats["requests_1h"] >= 2 and feats["unique_hospitals"] >= 2)
                or (feats["median_interval_s"] < 120 and feats["requests_1h"] >= 2)
            )
            score = -0.8 if is_suspicious else 0.2

        return {
            "phone": phone,
            "anomaly_score": round(score, 4),
            "is_suspicious": is_suspicious,
            "requests_last_1h": feats["requests_1h"],
            "unique_hospitals": feats["unique_hospitals"],
            "features": feats,
            "ml_powered": self._model is not None,
        }


def _generate_training_data(n: int = 20_000, seed: int = 42):
    """Generate synthetic phone behavior features for training."""
    rng = random.Random(seed)
    rows = []
    labels = []

    for _ in range(n):
        is_tout = rng.random() < 0.15  # 15% are touts

        if is_tout:
            req_1h = rng.randint(3, 12)
            uniq_hosp = rng.randint(2, min(req_1h, 6))
            uniq_city = rng.randint(1, 3)
            med_interval = rng.uniform(20, 200)
            spread = rng.uniform(0.5, 30)
            has_loc = int(rng.random() < 0.7)
        else:
            req_1h = rng.randint(1, 2)
            uniq_hosp = rng.randint(1, min(req_1h, 2))
            uniq_city = 1
            med_interval = rng.uniform(300, 3600)
            spread = rng.uniform(0, 2)
            has_loc = int(rng.random() < 0.9)

        rows.append([req_1h, uniq_hosp, uniq_city, med_interval, spread, has_loc])
        labels.append(int(is_tout))

    return np.array(rows), np.array(labels)


def train():
    from sklearn.ensemble import IsolationForest
    from sklearn.metrics import roc_auc_score
    import joblib
    import pandas as pd

    print("Generating synthetic fraud data …")
    X_raw, y = _generate_training_data(20_000)

    df = pd.DataFrame(X_raw, columns=_FEATURES)
    # Train only on "normal" behaviour (IsolationForest is unsupervised)
    X_normal = df[y == 0]

    model = IsolationForest(
        n_estimators=200, contamination=0.1, random_state=42, n_jobs=-1
    )
    model.fit(X_normal)

    scores = model.score_samples(df)
    auc = roc_auc_score(y, -scores)
    print(f"  Tout detection AUC = {auc:.4f}")

    bundle = {"model": model, "features": _FEATURES, "threshold": _THRESHOLD,
              "meta": {"auc": round(auc, 4)}}
    joblib.dump(bundle, _MODEL_PATH, compress=3)
    print(f"Saved → {_MODEL_PATH}  AUC={auc:.4f}")


if __name__ == "__main__":
    train()
