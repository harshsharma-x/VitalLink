"""
Blood Bank Stock Level Predictor

Two models:
  1. days_model   — GradientBoostingRegressor predicts days until stock hits critical (<5 units)
  2. risk_model   — RandomForestClassifier predicts P(shortage in next 24h)

Inputs per (blood_bank, blood_group):
  - current_units, demand_rate, days_since_restock, rarity_score,
    day_of_week, hour_of_day, bank_capacity_tier

Output:
  - days_until_critical   (regression)
  - shortage_risk_24h     (classification probability)
  - urgency_level         CRITICAL / LOW / ADEQUATE / GOOD
  - recommended_collect   units to collect to replenish to safe level
"""

from __future__ import annotations

import os
import math
import datetime
import logging
from typing import Any

logger = logging.getLogger(__name__)

# Blood group properties
_DEMAND_RATE: dict[str, float] = {
    "O+":  0.85,   # Most common, high demand
    "A+":  0.72,
    "B+":  0.58,
    "AB+": 0.25,
    "O-":  1.10,   # Universal donor, always critically needed
    "A-":  0.38,
    "B-":  0.28,
    "AB-": 0.18,
}

_RARITY: dict[str, float] = {
    "O+":  0.38, "A+":  0.34, "B+":  0.09, "AB+": 0.03,
    "O-":  0.07, "A-":  0.06, "B-":  0.02, "AB-": 0.01,
}

_CRITICAL_THRESHOLD = 5      # Below this → CRITICAL
_LOW_THRESHOLD      = 10     # Below this → LOW
_GOOD_THRESHOLD     = 20     # Above this → GOOD

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "stock_model.pkl")

_MODEL: dict | None = None


def _load_model() -> dict | None:
    global _MODEL
    if _MODEL is None:
        if not os.path.exists(_MODEL_PATH):
            logger.warning("Stock model not found at %s — using rule-based fallback", _MODEL_PATH)
            return None
        import joblib
        _MODEL = joblib.load(_MODEL_PATH)
        meta = _MODEL.get("meta", {})
        logger.info(
            "Loaded stock model  days_mae=%.3f  risk_auc=%.3f",
            meta.get("days_mae", 0), meta.get("risk_auc", 0),
        )
    return _MODEL


def _build_features(
    current_units: int,
    blood_group: str,
    days_since_restock: float = 7.0,
    bank_capacity_tier: int = 2,
    now: datetime.datetime | None = None,
) -> dict:
    if now is None:
        now = datetime.datetime.now()

    demand  = _DEMAND_RATE.get(blood_group, 0.5)
    rarity  = _RARITY.get(blood_group, 0.1)
    dow     = now.weekday()          # 0=Mon … 6=Sun
    hour    = now.hour
    month   = now.month

    # Weekend demand drops ~20%; emergency peaks at 8-20h
    demand_adj = demand * (0.80 if dow >= 5 else 1.0)
    demand_adj *= (1.15 if 8 <= hour <= 20 else 0.75)
    # Winter months (Nov-Feb) have ~10% higher demand
    demand_adj *= (1.10 if month in (11, 12, 1, 2) else 1.0)

    return {
        "current_units":       current_units,
        "demand_rate":         demand,
        "demand_adj":          round(demand_adj, 4),
        "rarity_score":        rarity,
        "days_since_restock":  days_since_restock,
        "day_of_week":         dow,
        "hour_of_day":         hour,
        "month":               month,
        "bank_capacity_tier":  bank_capacity_tier,   # 1=small, 2=medium, 3=large
        "is_weekend":          int(dow >= 5),
        "is_peak_hour":        int(8 <= hour <= 20),
        "below_critical":      int(current_units < _CRITICAL_THRESHOLD),
        "below_low":           int(current_units < _LOW_THRESHOLD),
    }


def _rule_based_prediction(current_units: int, demand_rate: float) -> dict:
    """Fallback when model is not trained — pure math."""
    units_per_day = max(0.5, demand_rate * 2.5)
    days_remaining = current_units / units_per_day

    risk_24h = 1.0 - min(1.0, current_units / max(1, _CRITICAL_THRESHOLD * 2))

    if current_units < _CRITICAL_THRESHOLD:
        level = "CRITICAL"
    elif current_units < _LOW_THRESHOLD:
        level = "LOW"
    elif current_units < _GOOD_THRESHOLD:
        level = "ADEQUATE"
    else:
        level = "GOOD"

    target = _GOOD_THRESHOLD + int(units_per_day * 3)
    recommended = max(0, target - current_units)

    return {
        "days_until_critical": round(max(0.0, days_remaining), 1),
        "shortage_risk_24h":   round(max(0.0, min(1.0, risk_24h)), 3),
        "urgency_level":       level,
        "recommended_collect": recommended,
        "units_per_day":       round(units_per_day, 2),
    }


def predict_stock(
    current_units: int,
    blood_group: str,
    days_since_restock: float = 7.0,
    bank_capacity_tier: int = 2,
    now: datetime.datetime | None = None,
) -> dict:
    """
    Predict stock trajectory for one blood group at one bank.

    Returns:
        days_until_critical  — days before stock < 5 units
        shortage_risk_24h    — P(shortage in next 24h) [0-1]
        urgency_level        — CRITICAL / LOW / ADEQUATE / GOOD
        recommended_collect  — units to collect to reach GOOD level
        units_per_day        — estimated daily demand
        ml_powered           — True if ML model was used
    """
    demand = _DEMAND_RATE.get(blood_group, 0.5)
    model  = _load_model()

    if model is None:
        result = _rule_based_prediction(current_units, demand)
        result["ml_powered"] = False
        return result

    import pandas as pd
    feats       = _build_features(current_units, blood_group, days_since_restock, bank_capacity_tier, now)
    feat_cols   = model["features"]
    X           = pd.DataFrame([feats])[feat_cols]

    days_pred   = float(model["days_model"].predict(X)[0])
    risk_pred   = float(model["risk_model"].predict_proba(X)[0, 1])

    if current_units < _CRITICAL_THRESHOLD:
        level = "CRITICAL"
    elif current_units < _LOW_THRESHOLD:
        level = "LOW"
    elif current_units < _GOOD_THRESHOLD:
        level = "ADEQUATE"
    else:
        level = "GOOD"

    units_per_day = max(0.3, demand * 2.5)
    target        = _GOOD_THRESHOLD + int(units_per_day * 3)
    recommended   = max(0, target - current_units)

    return {
        "days_until_critical": round(max(0.0, days_pred), 1),
        "shortage_risk_24h":   round(max(0.0, min(1.0, risk_pred)), 3),
        "urgency_level":       level,
        "recommended_collect": recommended,
        "units_per_day":       round(units_per_day, 2),
        "ml_powered":          True,
    }


def predict_all_groups(
    stock: dict[str, int],
    days_since_restock: float = 7.0,
    bank_capacity_tier: int = 2,
) -> dict[str, dict]:
    """Predict for all 8 blood groups at once. stock = {blood_group: units}."""
    now = datetime.datetime.now()
    return {
        bg: predict_stock(
            current_units=stock.get(bg, 0),
            blood_group=bg,
            days_since_restock=days_since_restock,
            bank_capacity_tier=bank_capacity_tier,
            now=now,
        )
        for bg in ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
    }


def bank_shortage_score(predictions: dict[str, dict]) -> float:
    """
    Aggregate shortage risk across all blood groups.
    Weighted by demand rate so O- shortage matters more than AB-.
    Returns 0.0 (all fine) to 1.0 (critical across the board).
    """
    total_weight = sum(_DEMAND_RATE.values())
    weighted_risk = sum(
        _DEMAND_RATE.get(bg, 0.3) * pred["shortage_risk_24h"]
        for bg, pred in predictions.items()
    )
    return round(weighted_risk / total_weight, 3)
