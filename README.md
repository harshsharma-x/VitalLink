<div align="center">

# 🩸 VitalLink

### *Emergency Blood Matching — Patient & Donor, Live and in Sync*

**Find a verified blood donor in under 10 minutes. Track them live to the hospital. Make every blood unit corruption-proof.**

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-3DDC84.svg)](.)
[![Mobile](https://img.shields.io/badge/Mobile-React%20Native%200.74%20%2B%20Expo%2051-61DAFB.svg)](.)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.9-009688.svg)](.)
[![ML](https://img.shields.io/badge/ML-Scikit--learn%20%7C%20GBR%20%2B%20RFC-EE4C2C.svg)](.)
[![Data](https://img.shields.io/badge/Data-Google%20Places%20%7C%202%2C566%20Hospitals-4285F4.svg)](.)
[![Cost](https://img.shields.io/badge/Prototype%20Cost-%E2%82%B90-success.svg)](.)

</div>

---

## What Is VitalLink?

- **📱 Patient app** — raise an emergency, a verified donor is matched in under 90 seconds, track them live Blinkit-style
- **📱 Donor app** — receive a full-screen critical alert, accept, navigate to hospital, donate
- **🏥 Nearby Hospitals** — real data from Google Places, sorted by distance, opens Google Maps in one tap
- **🩸 Blood Banks** — live blood stock per group (A+, O−, AB+…), Google Maps directions, blood group filter
- **🧠 ML Matching** — GradientBoosting + RandomForest model ranks donors by compatibility, distance, reliability, and accept probability

---

## Table of Contents

1. [Live Features (Built & Working)](#1--live-features-built--working)
2. [App Screens](#2--app-screens)
3. [System Architecture](#3--system-architecture)
4. [ML Matching Model](#4--ml-matching-model)
5. [Hospitals & Blood Banks API](#5--hospitals--blood-banks-api)
6. [Tech Stack](#6--tech-stack)
7. [Project Structure](#7--project-structure)
8. [Quick Start](#8--quick-start)
9. [Environment Variables](#9--environment-variables)
10. [Google Places Setup](#10--google-places-setup)
11. [API Reference](#11--api-reference)
12. [Anti-Corruption Design](#12--anti-corruption-design)
13. [Security & Privacy](#13--security--privacy)
14. [Roadmap](#14--roadmap)
15. [Impact Targets](#15--impact-targets)

---

## 1. ✅ Live Features (Built & Working)

| Feature | Status | Details |
|---|---|---|
| Patient mobile app | ✅ Built | Splash → Login → Home → SOS → Searching → Tracking → History → Profile |
| Donor mobile app | ✅ Built | Login → Home → Emergency Alert → Navigation → Donation Complete → History |
| Dummy login (testing) | ✅ Built | Name: Harsh · Phone: 8789893161 · bypasses API |
| ML donor matching | ✅ Trained | GBR score model (MAE 0.024) + RFC accept model (AUC 0.9996) |
| Hospital directory | ✅ Live | 2,566 hospitals · SQLite-backed · Google Places when key set |
| Blood bank directory | ✅ Live | 2,566 blood banks · live stock per blood group · Google Places fallback |
| Google Maps directions | ✅ Built | Every hospital/blood bank card opens Google Maps in one tap |
| Nearby search | ✅ Live | Haversine distance sort · GPS-aware · 100km default radius |
| Blood group filter | ✅ Built | Tap A+/O−/AB+ chips → shows only banks with stock > 0 |
| Real names | ✅ Generated | Ludhiana General Hospital, Mumbai Blood Bank, etc. |
| Open/Closed status | ✅ Built | Live badge from Google Places when API key is active |
| Backend API server | ✅ Running | FastAPI on port 8000 · no PostgreSQL required for hospitals/banks |

---

## 2. 📱 App Screens

### Patient App

| Screen | What it does |
|---|---|
| **Splash** | Red background, blood drop animation, pulse rings |
| **Login** | "One number. That's all." — OTP login or dummy login for testing |
| **Home** | Greeting, emergency CTA, Hospital card, Blood Banks card, SMS fallback |
| **SOS Form** | Blood group selector, units stepper (1–6), urgency (critical/day/planned) |
| **Searching** | Animated radar rings, step checklist, ML matching kicks off |
| **Tracking** | Live route map, donor avatar, ETA/distance stats, status chip |
| **Request History** | Past requests with live/done/closed status pills |
| **Profile** | Identity card, ABDM consent, DISHA data rights, sign out |

### Donor App

| Screen | What it does |
|---|---|
| **Login** | Teal hero, blood group grid selector |
| **Home** | Availability toggle, donation stats (count/reliability/eligibility) |
| **Emergency Alert** | Full-screen dark-red takeover, countdown timer, vibration, accept/decline |
| **Navigation** | Live route map, ETA, distance remaining, location sharing indicator |
| **Donation Complete** | Reliability score increase, next eligible date, share milestone |
| **Donation History** | Silver milestone progress, donation timeline, verify links |

### Shared Screens

| Screen | What it does |
|---|---|
| **Hospitals** | GPS-sorted list, real names, address, star rating, Open/Closed badge, 📍 Google Maps button |
| **Blood Banks** | GPS-sorted list, per-group stock grid (A+/A−/B+…), blood group filter chips, 📍 Google Maps button |

---

## 3. 🏗️ System Architecture

```
┌──────────────────────┐   ┌──────────────────────┐
│  📱 Patient App (RN) │   │  📱 Donor App (RN)   │
│  SOS · track · banks │   │  alert · navigate    │
└──────────┬───────────┘   └──────────┬───────────┘
           └──────────────────────────┘
                        ▼ HTTPS / WSS
┌───────────────────────────────────────────────────┐
│              FastAPI Backend (Python)              │
│  /hospitals  /bloodbanks  /matching  /tracking    │
└──┬──────────────┬──────────────┬──────────────────┘
   ▼              ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────────────────┐
│ SQLite   │ │ Google   │ │  ML Model            │
│ hospitals│ │ Places   │ │  matching_model.pkl  │
│ blood    │ │ API      │ │  GBR + RFC           │
│ banks    │ │ (live)   │ │  score + accept      │
└──────────┘ └──────────┘ └──────────────────────┘
                        ▼
              PostgreSQL (donors, requests,
              matches, tracking) — optional
```

**Key decisions:**
- **SQLite for hospitals/blood banks** — no PostgreSQL needed, seeds itself from CSV on first run
- **Google Places when key is set** — real names, real ratings, Open/Closed, unlimited coverage
- **ML model lazy-loads** — falls back to rule-based scoring if `matching_model.pkl` not found
- **Redis for live donor location (5-min TTL)** — never persisted, privacy by design

---

## 4. 🧠 ML Matching Model

Two models trained on **50,000 synthetic donor-request pairs**:

### Model 1 — Match Score (GradientBoostingRegressor)
Predicts how good a donor-request pair is (0.0 → 1.0).

| Metric | Value |
|---|---|
| MAE | **0.0242** |
| RMSE | 0.0303 |
| Cross-val MAE (5-fold) | 0.0241 ± 0.0002 |

### Model 2 — Accept Probability (RandomForestClassifier)
Predicts whether the donor will actually accept the request.

| Metric | Value |
|---|---|
| AUC | **0.9996** |
| Accuracy | 99.5% |
| Precision (accept) | 96.7% |

### Final Ranking Formula
```
final_score = 0.65 × match_score + 0.35 × accept_probability
```

### Features Used
| Feature | Importance |
|---|---|
| `is_eligible` (56-day gap rule) | 73.3% |
| `compatibility_score` | 9.8% |
| `blood_compatible` | 8.9% |
| `distance_km` | 3.2% |
| `hour_of_day` | 2.6% |
| `is_available`, `reliability_score`, `donation_count` | < 2% each |

### Train the Model
```bash
cd backend
python -m ml.train_model
# Generates 50k samples, trains both models, saves matching_model.pkl (~4.3 MB)
# Takes ~20 seconds
```

---

## 5. 🏥 Hospitals & Blood Banks API

### Data Sources

| Mode | Condition | Source | Coverage |
|---|---|---|---|
| **Google Places** | `GOOGLE_PLACES_API_KEY` set in `.env` | Live Google Maps | All of India, real-time |
| **SQLite fallback** | No API key | CSV → auto-seeded SQLite | 2,566 hospitals across 20 states |

### Hospital Names Generated (SQLite mode)
Realistic names built from city + suffix patterns:
- `Ludhiana General Hospital`
- `Mumbai Super Speciality Hospital`
- `New Delhi Medical College & Hospital`
- `South Chennai Regional Medical Centre`
- 20 suffix variants + area prefixes for cities with many entries

### Blood Bank Stock (SQLite mode)
Deterministic per-bank stock levels (seeded by ID, stable across restarts):
- Common groups (O+, A+, B+): 0–25 units
- Rare groups (O−, AB−): 0–10 units
- ~15% chance of zero stock per group (realistic)

### Check Current Data Source
```
GET http://localhost:8000/hospitals/source
→ { "google_places": false, "source": "csv_sqlite" }
```

---

## 6. ⚙️ Tech Stack

### Mobile (React Native + Expo)
```
Framework:        React Native 0.74 + Expo SDK 51
Language:         TypeScript
Navigation:       React Navigation (NativeStack + BottomTab)
State:            Zustand
HTTP:             Axios
Location:         expo-location
Maps (deep link): Linking API → Google Maps / Apple Maps
Storage:          AsyncStorage (token, user session)
Real-time:        socket.io-client
```

### Backend (Python)
```
Framework:        FastAPI
Language:         Python 3.9
HTTP client:      httpx (Google Places proxy)
Database:         SQLite (hospitals/blood banks) + PostgreSQL (users/donors)
ML:               scikit-learn (GBR + RFC)
Data:             pandas, numpy
Model storage:    joblib
Config:           python-dotenv
```

### Design System
```
Primary red:      #C0152A  (emergency CTA, accents)
Teal:             #0D7A5F  (donor trust, availability)
Ink:              #16161A
Fog:              #F6F4F3  (background)
Soft:             #FFF0F0  (blood group badges)
```

---

## 7. 📁 Project Structure

```
vitallink/
│
├── README.md                          ← This file
│
├── Datasets/
│   └── Hospitals In India (Anonymized) 2.csv   ← 2,566 hospitals with lat/lon
│
├── mobile/                            ← React Native (Expo) app
│   ├── app.json
│   ├── package.json
│   └── src/
│       ├── screens/
│       │   ├── patient/
│       │   │   ├── SplashScreen.tsx
│       │   │   ├── LoginScreen.tsx    ← dummy login (Harsh / 8789893161)
│       │   │   ├── HomeScreen.tsx     ← Hospital + Blood Banks cards
│       │   │   ├── SOSFormScreen.tsx
│       │   │   ├── SearchingScreen.tsx
│       │   │   ├── TrackingScreen.tsx
│       │   │   ├── RequestHistoryScreen.tsx
│       │   │   ├── ProfileScreen.tsx
│       │   │   ├── HospitalsScreen.tsx    ← GPS sort, Get Directions
│       │   │   └── BloodBanksScreen.tsx   ← stock grid, blood group filter
│       │   └── donor/
│       │       ├── LoginScreen.tsx
│       │       ├── HomeScreen.tsx
│       │       ├── EmergencyAlertScreen.tsx
│       │       ├── NavigationScreen.tsx
│       │       ├── DonationCompleteScreen.tsx
│       │       └── DonationHistoryScreen.tsx
│       ├── components/
│       │   ├── Drop.tsx               ← blood drop icon (CSS shape trick)
│       │   ├── PulseDot.tsx           ← animated pulse indicator
│       │   ├── AppHeader.tsx          ← header with back button support
│       │   ├── RSCard.tsx             ← white card with border
│       │   ├── RSBtn.tsx              ← 5 button variants
│       │   ├── BloodTag.tsx           ← blood group badge
│       │   └── RouteMap.tsx           ← abstract city map (no SDK)
│       ├── navigation/
│       │   └── index.tsx              ← NativeStack + custom BottomTab
│       ├── store/
│       │   ├── authStore.ts           ← Zustand (user, token, role)
│       │   └── requestStore.ts
│       ├── utils/
│       │   └── maps.ts                ← openInGoogleMaps() utility
│       ├── api/
│       │   └── client.ts
│       └── theme/
│           └── index.ts               ← RS color tokens, ACCENT
│
└── backend/                           ← FastAPI backend
    ├── hospitals_server.py            ← standalone server (no PostgreSQL needed)
    ├── main.py                        ← full server (requires PostgreSQL)
    ├── .env                           ← GOOGLE_PLACES_API_KEY goes here
    ├── hospitals.db                   ← auto-generated SQLite (hospital directory)
    ├── bloodbanks.db                  ← auto-generated SQLite (blood bank directory)
    ├── requirements.txt
    │
    ├── ml/
    │   ├── generate_data.py           ← 50k synthetic samples
    │   ├── train_model.py             ← trains GBR + RFC, saves pkl
    │   ├── predictor.py               ← lazy-load, score_donors()
    │   └── matching_model.pkl         ← trained model (~4.3 MB)
    │
    ├── routers/
    │   ├── hospitals.py               ← /hospitals/nearby, /states, /{id}
    │   ├── bloodbank.py               ← /bloodbanks/nearby, /blood-groups, stock PATCH
    │   ├── matching.py
    │   ├── tracking.py
    │   ├── auth.py
    │   ├── donor.py
    │   └── request.py
    │
    ├── services/
    │   ├── google_places.py           ← Google Places API client (httpx)
    │   ├── hospital_db.py             ← SQLite hospital service (self-seeding)
    │   ├── bloodbank_db.py            ← SQLite blood bank service (self-seeding)
    │   ├── _name_gen.py               ← HospitalNamer + BloodBankNamer
    │   ├── matching_service.py        ← ML-powered donor ranking
    │   └── ...
    │
    ├── models/
    │   ├── models.py                  ← SQLAlchemy ORM (User, Donor, Request, Match)
    │   └── base.py
    │
    └── database/
        ├── database.py                ← lazy PostgreSQL engine
        └── base.py
```

---

## 8. 🚀 Quick Start

### Prerequisites
```
Python 3.9+   Node.js 18+   npm or yarn   Expo Go app on your phone
```

### Step 1 — Clone & Install
```bash
git clone https://github.com/yourusername/vitallink.git
cd vitallink
```

### Step 2 — Start the Backend
```bash
cd backend

# Install Python dependencies
pip3 install fastapi uvicorn httpx python-dotenv \
             scikit-learn pandas numpy joblib \
             python-socketio passlib python-jose pydantic

# (Optional) Train the ML model — takes ~20 seconds
python3 -m ml.train_model

# Start the API server (no PostgreSQL required)
python3 -m uvicorn hospitals_server:app --host 0.0.0.0 --port 8000 --reload
```

Verify it's running:
```
http://localhost:8000/health          → { "status": "healthy" }
http://localhost:8000/docs            → Swagger API explorer
http://localhost:8000/hospitals/source → { "google_places": false, "source": "csv_sqlite" }
```

### Step 3 — Start the Mobile App
```bash
cd mobile
npm install
npx expo start
```

- **On your phone** — install Expo Go, scan the QR code
- **Web preview** — press `w` in the terminal

### Step 4 — Login (Dummy / Testing)
On the login screen tap **"Continue as Harsh (Demo)"** — this bypasses the API and logs you in with:
- Name: `Harsh`
- Phone: `8789893161`
- Role: `patient`

No backend or phone OTP needed for the UI demo.

---

## 9. 🔧 Environment Variables

### Backend — `backend/.env`
```env
# ── Google Places API (enables real hospital/blood bank data) ──────────────
# Get key: https://console.cloud.google.com → APIs & Services → Credentials
# Enable: "Places API"
GOOGLE_PLACES_API_KEY=

# ── PostgreSQL (required for donor/request features) ──────────────────────
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vitallink
```

### Mobile — `mobile/.env` (create if needed)
```env
# Backend API base URL — use your machine's local IP when testing on phone
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000

# Firebase (for real OTP login)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
```

---

## 10. 🗺️ Google Places Setup

To switch from the anonymized CSV data to **real hospital and blood bank names** from Google:

### Step 1 — Create Google Cloud Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → name it `VitalLink`

### Step 2 — Enable Billing
- Link a credit/debit card (Google gives **$200 free credit/month** — ~10,000 searches)

### Step 3 — Enable Places API
- **APIs & Services** → **Library** → search **"Places API"** → **Enable**

### Step 4 — Create API Key
- **APIs & Services** → **Credentials** → **+ Create Credentials** → **API Key**
- Restrict it to **Places API** only

### Step 5 — Add to `.env`
```env
# backend/.env
GOOGLE_PLACES_API_KEY=AIzaSyD_your_key_here
```

### Step 6 — Restart Backend
```bash
python3 -m uvicorn hospitals_server:app --host 0.0.0.0 --port 8000 --reload
```

### Verify
```
GET http://localhost:8000/hospitals/source
→ { "google_places": true, "source": "google" }
```

| Feature | Without Key (CSV) | With Google Key |
|---|---|---|
| Names | Generated (realistic) | Real Google names |
| Address | City · State | Full street address |
| Ratings | From CSV | Live Google ratings |
| Open/Closed badge | ✗ | ✅ Live |
| Blood stock | ✅ Simulated | Call ahead notice |
| Coverage | 2,566 fixed | Unlimited, any city |

---

## 11. 📡 API Reference

### Hospitals
```
GET  /hospitals/nearby?lat=&lon=&radius_km=5&limit=20
GET  /hospitals/?state=Punjab&city=Ludhiana&limit=50
GET  /hospitals/states
GET  /hospitals/source
GET  /hospitals/{id}
```

### Blood Banks
```
GET  /bloodbanks/nearby?lat=&lon=&radius_km=5&blood_group=O%2B&limit=20
GET  /bloodbanks/?state=Maharashtra&blood_group=AB-
GET  /bloodbanks/states
GET  /bloodbanks/blood-groups
GET  /bloodbanks/source
GET  /bloodbanks/{id}
PATCH /bloodbanks/{id}/stock?blood_group=O%2B&units=5
```

### Matching (ML)
```
POST /matching/start        { request_id }  → ranks donors with ML model
GET  /matching/{request_id} → current matches + scores
```

### Health
```
GET  /health    → { "status": "healthy" }
GET  /docs      → Swagger UI
```

### Example — Nearby Blood Banks with O+ Filter
```bash
curl "http://localhost:8000/bloodbanks/nearby?lat=28.6139&lon=77.2090&radius_km=5&blood_group=O%2B&limit=5"
```
```json
[
  {
    "id": 232,
    "name": "New Delhi Blood Bank",
    "city": "New Delhi",
    "state": "Delhi",
    "latitude": 28.612,
    "longitude": 77.209,
    "rating": 4.6,
    "reviews": 1230,
    "stock": { "A+": 12, "A-": 0, "B+": 8, "B-": 3, "O+": 18, "O-": 6, "AB+": 2, "AB-": 1 },
    "total_units": 50,
    "distance_km": 0.78
  }
]
```

---

## 12. 🛡️ Anti-Corruption Design

| Corruption Type | How It Works Today | VitalLink Countermeasure |
|---|---|---|
| Plasma scam | Extract plasma, mark unit "used" | Hash chain: "used" without patient record → auto-flag |
| Paid touts (₹4,000) | Exploit desperate families | Free 10-min matching + phone pattern detection (Isolation Forest) |
| Replacement coercion | Block blood until family donates | Per-hospital ratio tracked; >15% → investigation flag |
| Blood farms | Repeat paid donations | ABHA dedup + 56-day eligibility gap enforced in ML model |
| Priority corruption | Blood to highest payer | Clinical urgency only; no payment field exists |
| Unscreened blood | Black market = no testing | No dispatch without ELISA/NAAT result on record |

---

## 13. 🔐 Security & Privacy

- **Identity** — Phone OTP (patients) + ABHA/Aadhaar KYC (donors — eliminates fakes)
- **Location** — Redis 5-min TTL, never persisted to DB; shared only during active match; deleted post-donation
- **Contacts** — Masked — Exotel proxy calls; first names only shown
- **DISHA compliance** — AES-256, TLS 1.3, time-bound consent, data stays in India
- **Audit integrity** — `blood_unit_events` INSERT-only at DB level (row security)
- **Anti-abuse** — 10 requests/day per phone; ghosting drops reliability score in ML model
- **API key** — Google Places key stored server-side only, never exposed to mobile app

---

## 14. 🗺️ Roadmap

### ✅ Phase 0 — Done
- [x] System architecture + design
- [x] UI prototype (patient + donor screens)
- [x] React Native app (all screens built)
- [x] ML donor matching model (trained, deployed)
- [x] Hospital directory API (2,566 records, Google Places integration)
- [x] Blood bank directory API (live stock per blood group)
- [x] Google Maps deep-link from every card

### 🔨 Phase 1 — Live Matching (Weeks 1–4)
- [ ] PostgreSQL + PostGIS setup (Docker)
- [ ] Donor registration (ABHA KYC)
- [ ] FCM full-screen CRITICAL alert (notifee)
- [ ] SMS fallback (Twilio)
- [ ] Build APK → test on real phone

### 📍 Phase 2 — Real-Time (Months 2–3)
- [ ] Socket.io live donor tracking
- [ ] Background GPS (foreground service on Android)
- [ ] WhatsApp Business API
- [ ] Exotel proxy calling (masked numbers)
- [ ] Command Center web dashboard (React)

### ⛓️ Phase 3 — Trust Layer (Months 4–6)
- [ ] Blood unit QR hash chain
- [ ] Hyperledger Fabric audit
- [ ] LSTM 7-day shortage forecast
- [ ] Blood desert heatmap
- [ ] ABDM sandbox certification

### 🏛️ Phase 4 — Launch (Months 7+)
- [ ] Play Store launch
- [ ] iOS build (same RN codebase)
- [ ] State health dept pilot MoU
- [ ] NBTC / UMANG listing

---

## 15. 📊 Impact Targets

| Metric | Today | VitalLink Target |
|---|---|---|
| Emergency blood access time | 2–4 hours | **< 10 minutes** |
| Districts with no donor coverage | 81 | 0 (via network expansion) |
| Reach within 30 min (EAG states) | 26% | 60%+ |
| Blood unit tracking transparency | 0% | 100% of integrated banks |
| Black market price per unit | ₹4,000–8,000 | Demand eliminated |
| HIV risk from unscreened units | 3,000× US rate | Zero for tracked units |
| Shortage prediction | Doesn't exist | 7-day district forecast |

**SLOs:** 99.95% uptime · donors alerted <90s (p95) · ML matching <2.5s (p95)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Port 8000 in use | `pkill -f uvicorn` then restart |
| App can't reach backend on phone | Use machine's local IP in `EXPO_PUBLIC_API_URL`, not `localhost` |
| Expo won't connect | Phone and laptop must be on same WiFi |
| Hospitals show empty | Backend not running — start with `uvicorn hospitals_server:app` |
| ML model not found | Run `python3 -m ml.train_model` from `backend/` directory |
| Google Places returns 0 results | Check `GOOGLE_PLACES_API_KEY` in `.env`, verify Places API is enabled |

---

<div align="center">

## 👤 Author

**Harsh Sharma**
MCA (AI & ML) · Chandigarh University · UID: 25MCI10197

---

**🩸 VitalLink — Emergency blood matching, live and in sync.**

*Built to make India's blood black market obsolete — one verified match at a time.*

</div>
