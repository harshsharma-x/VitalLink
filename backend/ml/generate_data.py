"""
Synthetic training data generator for blood donor-request matching.

Simulates realistic donor-request pairs with outcomes based on:
  - Blood type compatibility
  - Distance to hospital
  - Donor reliability history
  - Availability status
  - Time of day / eligibility window

Run directly to preview samples:
    python generate_data.py
"""

import numpy as np
import pandas as pd

BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

# Which donor types can give to which recipient type
COMPATIBLE: dict[str, list[str]] = {
    'A+':  ['A+', 'A-', 'O+', 'O-'],
    'A-':  ['A-', 'O-'],
    'B+':  ['B+', 'B-', 'O+', 'O-'],
    'B-':  ['B-', 'O-'],
    'O+':  ['O+', 'O-'],
    'O-':  ['O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    'AB-': ['A-', 'B-', 'O-', 'AB-'],
}

URGENCY_MAP = {'critical': 3, 'day': 2, 'planned': 1}
URGENCY_LEVELS = list(URGENCY_MAP.keys())
URGENCY_PROBS  = [0.40, 0.35, 0.25]


def is_compatible(donor_type: str, recipient_type: str) -> bool:
    return donor_type in COMPATIBLE.get(recipient_type, [])


def compatibility_score(donor_type: str, recipient_type: str) -> float:
    """Granular compatibility: exact > universal donor > compatible."""
    if donor_type == recipient_type:
        return 1.0
    if not is_compatible(donor_type, recipient_type):
        return 0.0
    # O- / O+ are universal (or near-universal) donors — useful but not ideal
    if donor_type in ('O-', 'O+'):
        return 0.85
    return 0.70


def generate_sample(rng: np.random.Generator) -> dict:
    # ── Request features ───────────────────────────────────────
    req_blood  = rng.choice(BLOOD_GROUPS)
    urgency    = rng.choice(URGENCY_LEVELS, p=URGENCY_PROBS)
    units      = int(rng.integers(1, 5))
    hour       = int(rng.integers(0, 24))

    # ── Donor features ─────────────────────────────────────────
    donor_blood   = rng.choice(BLOOD_GROUPS)
    # Exponential distance (most donors nearby; long tail up to 50 km)
    distance_km   = float(min(rng.exponential(scale=5.0), 50.0))
    # Right-skewed reliability (most donors are decent)
    reliability   = float(rng.beta(a=8, b=2) * 100)
    availability  = bool(rng.random() < 0.60)
    days_since    = float(min(rng.exponential(scale=90.0), 365.0))
    donation_count = int(rng.integers(0, 25))

    # ── Derived features ───────────────────────────────────────
    compat      = is_compatible(donor_blood, req_blood)
    compat_sc   = compatibility_score(donor_blood, req_blood)
    eligible    = days_since >= 56
    urgency_sc  = URGENCY_MAP[urgency]

    # ── Rule-based base score (becomes the regression target) ──
    s_blood   = compat_sc
    s_dist    = max(0.0, 1.0 - distance_km / 20.0)
    s_rel     = reliability / 100.0
    s_avail   = 1.0 if availability else 0.20

    base = (0.40 * s_blood +
            0.30 * s_dist  +
            0.20 * s_rel   +
            0.10 * s_avail)

    # Modifiers
    base += (urgency_sc - 1) * 0.04          # critical pulls in more donors
    base += min(donation_count, 10) * 0.004   # experience bonus
    if not eligible:
        base *= 0.25                           # heavy penalty: can't donate yet
    if hour < 6:
        base *= 0.80                           # night-time dampening
    base = float(np.clip(base + rng.normal(0, 0.03), 0.0, 1.0))

    # ── Binary accept outcome ──────────────────────────────────
    # Donor accepts iff: compatible, available, eligible, and score is high
    p_accept = base * 0.75 + rng.random() * 0.25
    accepted  = int(p_accept > 0.55 and compat and availability and eligible)

    return {
        # Features
        'blood_compatible':        int(compat),
        'compatibility_score':     round(compat_sc, 4),
        'distance_km':             round(distance_km, 2),
        'distance_bucket':         min(5, int(distance_km // 4)),
        'reliability_score':       round(reliability, 2),
        'is_available':            int(availability),
        'days_since_last_donation': round(days_since, 1),
        'is_eligible':             int(eligible),
        'urgency_score':           urgency_sc,
        'units_required':          units,
        'hour_of_day':             hour,
        'donation_count':          donation_count,
        # Targets
        'match_score':             round(base, 4),   # regression target
        'accepted':                accepted,          # classification target
    }


def build_dataset(n: int = 50_000, seed: int = 42) -> pd.DataFrame:
    rng  = np.random.default_rng(seed)
    rows = [generate_sample(rng) for _ in range(n)]
    return pd.DataFrame(rows)


if __name__ == '__main__':
    df = build_dataset(1000)
    print(df.describe())
    print(f"\nAccept rate: {df['accepted'].mean():.2%}")
    print(f"Avg match score: {df['match_score'].mean():.4f}")
