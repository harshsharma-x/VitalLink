"""
Train and save the VitalLink blood-donor matching model.

Two models are trained:
  1. score_model  — GradientBoostingRegressor predicts match quality (0–1)
  2. accept_model — RandomForestClassifier predicts P(donor accepts)

The final ranking score used at inference time is:
    final = 0.65 * score_model + 0.35 * accept_prob

Usage:
    cd backend
    python -m ml.train_model
"""

import os
import sys
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error,
    roc_auc_score, classification_report,
)

# Allow running from the backend/ directory
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from ml.generate_data import build_dataset

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'matching_model.pkl')

FEATURES = [
    'blood_compatible',
    'compatibility_score',
    'distance_km',
    'distance_bucket',
    'reliability_score',
    'is_available',
    'days_since_last_donation',
    'is_eligible',
    'urgency_score',
    'units_required',
    'hour_of_day',
    'donation_count',
]

N_SAMPLES = 50_000
SEED      = 42


def train():
    # ── 1. Generate data ───────────────────────────────────────
    print(f"Generating {N_SAMPLES:,} synthetic training samples…")
    t0 = time.time()
    df = build_dataset(n=N_SAMPLES, seed=SEED)
    print(f"  Done in {time.time()-t0:.1f}s  |  "
          f"accept rate: {df['accepted'].mean():.2%}  |  "
          f"avg score: {df['match_score'].mean():.4f}")

    X       = df[FEATURES]
    y_score = df['match_score']
    y_acc   = df['accepted']

    X_tr, X_te, ys_tr, ys_te, ya_tr, ya_te = train_test_split(
        X, y_score, y_acc, test_size=0.20, random_state=SEED
    )

    # ── 2. Train score model (regression) ─────────────────────
    print("\nTraining score model  (GradientBoostingRegressor)…")
    t0 = time.time()
    score_model = GradientBoostingRegressor(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.08,
        subsample=0.8,
        min_samples_leaf=20,
        random_state=SEED,
    )
    score_model.fit(X_tr, ys_tr)
    preds_score = score_model.predict(X_te)
    mae  = mean_absolute_error(ys_te, preds_score)
    rmse = mean_squared_error(ys_te, preds_score) ** 0.5
    print(f"  Trained in {time.time()-t0:.1f}s")
    print(f"  MAE : {mae:.4f}")
    print(f"  RMSE: {rmse:.4f}")

    # ── 3. Train accept model (classification) ─────────────────
    print("\nTraining accept model (RandomForestClassifier)…")
    t0 = time.time()
    accept_model = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        min_samples_leaf=10,
        n_jobs=-1,
        random_state=SEED,
        class_weight='balanced',
    )
    accept_model.fit(X_tr, ya_tr)
    accept_proba = accept_model.predict_proba(X_te)[:, 1]
    auc = roc_auc_score(ya_te, accept_proba)
    print(f"  Trained in {time.time()-t0:.1f}s")
    print(f"  AUC : {auc:.4f}")
    print(classification_report(ya_te, accept_model.predict(X_te),
                                 target_names=['decline', 'accept'],
                                 digits=3))

    # ── 4. Feature importance ──────────────────────────────────
    print("Feature importance (score model):")
    importances = sorted(
        zip(FEATURES, score_model.feature_importances_),
        key=lambda x: -x[1]
    )
    for feat, imp in importances:
        bar = '█' * int(imp * 40)
        print(f"  {feat:<35s} {imp:.3f}  {bar}")

    # ── 5. Cross-validation sanity check ──────────────────────
    print("\nCross-val MAE (score model, 5-fold)…")
    cv_scores = cross_val_score(
        GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=SEED),
        X, y_score, cv=5,
        scoring='neg_mean_absolute_error',
        n_jobs=-1,
    )
    print(f"  {-cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    # ── 6. Save ────────────────────────────────────────────────
    artifact = {
        'score_model':  score_model,
        'accept_model': accept_model,
        'features':     FEATURES,
        'meta': {
            'n_samples': N_SAMPLES,
            'score_mae': mae,
            'accept_auc': auc,
        },
    }
    joblib.dump(artifact, MODEL_PATH)
    size_kb = os.path.getsize(MODEL_PATH) / 1024
    print(f"\nModel saved → {MODEL_PATH}  ({size_kb:.0f} KB)")
    return artifact


if __name__ == '__main__':
    train()
