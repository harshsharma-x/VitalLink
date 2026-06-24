"""
Generates realistic Indian hospital and blood bank names from
city / district / state metadata.

The same city can appear many times in the dataset, so we track
a per-city counter and cycle through suffixes + area prefixes to
ensure every entry gets a distinct, plausible name.
"""
from __future__ import annotations

# ── Hospital name parts ──────────────────────────────────────────────────────

_H_SUFFIXES = [
    "General Hospital",
    "Medical College & Hospital",
    "District Hospital",
    "Civil Hospital",
    "Government Hospital",
    "Community Health Centre",
    "Super Speciality Hospital",
    "Multi Speciality Hospital",
    "Primary Health Centre",
    "Regional Medical Centre",
    "Institute of Medical Sciences",
    "Zonal Hospital",
    "Teaching Hospital",
    "Charitable Hospital",
    "Health Care Centre",
    "Trauma & Emergency Centre",
    "Maternity & Child Hospital",
    "ESI Hospital",
    "Railway Hospital",
    "Mission Hospital",
]

_H_AREA_PFX = [
    "North", "South", "East", "West", "Central",
    "New", "Old", "Upper", "Lower", "Inner",
]

_H_SPECIALTY_PFX = [
    "Eye & ENT", "Orthopaedic", "Children's", "Women's",
    "Heart Care", "Cancer Care", "Dental", "Skin & Dermatology",
    "Kidney & Urology", "Neuro",
]

# ── Blood bank name parts ────────────────────────────────────────────────────

_BB_SUFFIXES = [
    "Blood Bank",
    "Regional Blood Centre",
    "Government Blood Bank",
    "City Blood Centre",
    "Blood Storage Centre",
    "Voluntary Blood Bank",
    "Red Cross Blood Bank",
    "District Blood Bank",
    "Central Blood Bank",
    "Civil Hospital Blood Bank",
    "Community Blood Bank",
    "Emergency Blood Bank",
]

_BB_AREA_PFX = ["North", "South", "East", "West", "Central", "New"]


# ── Counters (reset between calls via fresh HospitalNamer instance) ──────────

class HospitalNamer:
    """Stateful generator — create one instance per seeding run."""

    def __init__(self):
        self._city_counts: dict[str, int] = {}

    def name(self, city: str, district: str, state: str) -> str:
        city = city.strip()
        n = self._city_counts.get(city, 0)
        self._city_counts[city] = n + 1

        total_suf = len(_H_SUFFIXES)
        total_area = len(_H_AREA_PFX)
        total_spec = len(_H_SPECIALTY_PFX)

        if n < total_suf:
            return f"{city} {_H_SUFFIXES[n]}"

        # Second wave: area prefix
        n2 = n - total_suf
        if n2 < total_area * total_suf:
            area = _H_AREA_PFX[n2 % total_area]
            suf  = _H_SUFFIXES[(n2 // total_area) % total_suf]
            return f"{area} {city} {suf}"

        # Third wave: specialty prefix
        n3 = n2 - total_area * total_suf
        spec = _H_SPECIALTY_PFX[n3 % total_spec]
        suf  = _H_SUFFIXES[n3 % total_suf]
        return f"{city} {spec} {suf}"


class BloodBankNamer:
    """Stateful generator — create one instance per seeding run."""

    def __init__(self):
        self._city_counts: dict[str, int] = {}

    def name(self, city: str, district: str, state: str) -> str:
        city = city.strip()
        n = self._city_counts.get(city, 0)
        self._city_counts[city] = n + 1

        total_suf = len(_BB_SUFFIXES)
        total_area = len(_BB_AREA_PFX)

        if n < total_suf:
            return f"{city} {_BB_SUFFIXES[n]}"

        n2 = n - total_suf
        area = _BB_AREA_PFX[n2 % total_area]
        suf  = _BB_SUFFIXES[(n2 // total_area) % total_suf]
        return f"{area} {city} {suf}"
