"""
Train Blood Bank Stock Level ML Models.

Generates 80,000 synthetic records covering all realistic stock scenarios
and trains two models:
  1. GradientBoostingRegressor  — days_until_critical
  2. RandomForestClassifier     — will_shortage_24h (binary)

Run:  cd backend && python3 -m ml.train_stock_model
"""

import os
import random
import datetime
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, roc_auc_score
import joblib

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "stock_model.pkl")

DEMAND_RATE = {
    "O+": 0.85, "A+": 0.72, "B+": 0.58, "AB+": 0.25,
    "O-": 1.10, "A-": 0.38, "B-": 0.28, "AB-": 0.18,
}
RARITY = {
    "O+": 0.38, "A+": 0.34, "B+": 0.09, "AB+": 0.03,
    "O-": 0.07, "A-": 0.06, "B-": 0.02, "AB-": 0.01,
}
BLOOD_GROUPS = list(DEMAND_RATE.keys())

_CRIT = 5
_LOW  = 10
_GOOD = 20


def _simulate_days_to_critical(
    current_units: int,
    demand_rate: float,
    bank_capacity_tier: int,
    dow: int,
    hour: int,
    month: int,
) -> float:
    """Ground-truth using simple stochastic simulation."""
    demand_adj = demand_rate * (0.80 if dow >= 5 else 1.0)
    demand_adj *= (1.15 if 8 <= hour <= 20 else 0.75)
    demand_adj *= (1.10 if month in (11, 12, 1, 2) else 1.0)
    daily = max(0.3, demand_adj * 2.5) * (0.8 + 0.4 * random.random())

    # Restock events
    capacity = {1: 30, 2: 60, 3: 120}[bank_capacity_tier]
    units = float(current_units)
    days = 0
    for _ in range(120):
        units = max(0, units - daily)
        # Small daily donation chance
        if random.random() < 0.35:
            units = min(capacity, units + random.randint(1, 4))
        if units < _CRIT:
            return float(days)
        days += 1

    return 120.0


def generate_data(n: int = 80_000) -> pd.DataFrame:
    rows = []
    for _ in range(n):
        bg   = random.choice(BLOOD_GROUPS)
        dr   = DEMAND_RATE[bg]
        rar  = RARITY[bg]

        current_units     = random.randint(0, 50)
        days_since_restock = round(random.uniform(0.0, 30.0), 1)
        tier              = random.choice([1, 2, 3])

        dt  = datetime.datetime(
            2025, random.randint(1, 12), random.randint(1, 28),
            random.randint(0, 23), 0
        )
        dow  = dt.weekday()
        hour = dt.hour
        month = dt.month

        demand_adj = dr * (0.80 if dow >= 5 else 1.0)
        demand_adj *= (1.15 if 8 <= hour <= 20 else 0.75)
        demand_adj *= (1.10 if month in (11, 12, 1, 2) else 1.0)

        days_to_crit = _simulate_days_to_critical(current_units, dr, tier, dow, hour, month)
        shortage_24h = int(days_to_crit < 1.0) if current_units < _LOW else 0

        rows.append({
            "current_units":       current_units,
            "demand_rate":         dr,
            "demand_adj":          round(demand_adj, 4),
            "rarity_score":        rar,
            "days_since_restock":  days_since_restock,
            "day_of_week":         dow,
            "hour_of_day":         hour,
            "month":               month,
            "bank_capacity_tier":  tier,
            "is_weekend":          int(dow >= 5),
            "is_peak_hour":        int(8 <= hour <= 20),
            "below_critical":      int(current_units < _CRIT),
            "below_low":           int(current_units < _LOW),
            # targets
            "days_until_critical": days_to_crit,
            "shortage_24h":        shortage_24h,
        })

    return pd.DataFrame(rows)


def train():
    print("Generating synthetic data …")
    df = generate_data(80_000)

    FEATURES = [
        "current_units", "demand_rate", "demand_adj", "rarity_score",
        "days_since_restock", "day_of_week", "hour_of_day", "month",
        "bank_capacity_tier", "is_weekend", "is_peak_hour",
        "below_critical", "below_low",
    ]

    X     = df[FEATURES]
    y_reg = df["days_until_critical"]
    y_cls = df["shortage_24h"]

    X_tr, X_te, y_reg_tr, y_reg_te = train_test_split(X, y_reg, test_size=0.15, random_state=SEED)
    _, _, y_cls_tr, y_cls_te       = train_test_split(X, y_cls, test_size=0.15, random_state=SEED)

    print("Training GradientBoostingRegressor (days_until_critical) …")
    days_model = GradientBoostingRegressor(
        n_estimators=300, learning_rate=0.08, max_depth=5,
        subsample=0.8, random_state=SEED
    )
    days_model.fit(X_tr, y_reg_tr)
    days_mae = mean_absolute_error(y_reg_te, days_model.predict(X_te))
    print(f"  days_mae = {days_mae:.3f}")

    print("Training RandomForestClassifier (shortage_24h) …")
    risk_model = RandomForestClassifier(
        n_estimators=200, max_depth=12, class_weight="balanced", random_state=SEED, n_jobs=-1
    )
    risk_model.fit(X_tr, y_cls_tr)
    risk_auc = roc_auc_score(y_cls_te, risk_model.predict_proba(X_te)[:, 1])
    print(f"  risk_auc = {risk_auc:.4f}")

    bundle = {
        "days_model": days_model,
        "risk_model": risk_model,
        "features":   FEATURES,
        "meta": {
            "days_mae": round(days_mae, 4),
            "risk_auc": round(risk_auc, 4),
            "n_samples": len(df),
            "trained_on": str(datetime.date.today()),
        },
    }
    joblib.dump(bundle, OUTPUT_PATH, compress=3)
    print(f"\nSaved → {OUTPUT_PATH}")
    print(f"days_mae={days_mae:.3f}  risk_auc={risk_auc:.4f}")


if __name__ == "__main__":
    train()
