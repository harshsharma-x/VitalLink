# Changelog

## [1.0.0] - 2025-07-16

### Added
- **Demo login now hits real backend** — LoginScreen calls `POST /auth/demo` to get real JWT tokens, donor IDs, and profile data. Falls back to offline mode gracefully if backend is unreachable.
- **Rate limiting** — OTP send endpoints limited to 5 requests/hour per phone number. Global middleware limits 30 requests/minute per IP.
- **Form validation** — `CreateRequestScreen` validates blood group, units, hospital, and urgency before submission with clear inline error messages.
- **GitHub Actions CI** — Automated backend tests + frontend type-checking on every PR.
- **CHANGELOG.md** — This file.
- **CONTRIBUTING.md** — Contribution guidelines.

### Fixed
- **Navigation anti-pattern** — `PatientHomeScreen` no longer calls `navigation.navigate()` inside the render function; uses proper event handlers.
- **Background task safety** — `request.py` now uses FastAPI `BackgroundTasks` instead of raw `threading.Thread` for background matching, avoiding potential DB session conflicts.
- **CORS configuration** — `allow_origins` now reads from `CORS_ORIGINS` env var instead of hardcoded `*`, enabling secure production deployments.
- **Demo login response** — Now returns `blood_group`, `name`, and `donor_id` for a complete profile setup.
- **Clean up orphaned directories** — Removed legacy `donor-app/`, `patient-app/`, `vitallink_flutter/`, and `Frontend/`.
- **app.json cleanup** — Removed placeholder Google OAuth client IDs.

### Changed
- **ML models retrained** — Matching model (MAE: 0.024, AUC: 0.9997) and fraud detector (AUC: 0.9536) retrained with latest training data.
- **Donor profile creation** — Demo login now sets `reliability_score=80.0` for new donors so they start with a meaningful score.
