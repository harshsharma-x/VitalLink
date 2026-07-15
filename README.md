
# 🩸 VitalLink

**Emergency Blood Matching Platform** — A React Native (Expo) app connecting patients with verified blood donors in under 10 minutes. Powered by ML-based donor matching, real-time tracking, and anti-corruption measures.

---

## ✅ What's Done

### Mobile App (`mobile/vitallink-app/`)

| Feature | Status |
|---------|--------|
| Unified app (Donor + Patient in one codebase) | ✅ |
| Role selection screen (Donor / Patient) | ✅ |
| Instant demo login — no sign-up required | ✅ |
| Donor home screen with availability toggle & stats | ✅ |
| Full-screen emergency alert (countdown, accept/decline) | ✅ |
| Live navigation screen with GPS tracking | ✅ |
| Donation complete screen with reliability score | ✅ |
| Donation history with milestones | ✅ |
| Patient home screen with emergency CTA | ✅ |
| SOS request form (blood group, units, urgency) | ✅ |
| Searching screen with animated radar & ML matching | ✅ |
| Live donor tracking on map (Blinkit-style) | ✅ |
| Request history with status pills | ✅ |
| Blood bank directory with per-group stock | ✅ |
| Hospital directory with GPS sort & directions | ✅ |
| Profile screen with identity card | ✅ |
| Google OAuth removed — pure instant demo mode | ✅ |
| Vercel deployment ready (`vercel.json`) | ✅ |

### Backend (`backend/`)

| Feature | Status |
|---------|--------|
| FastAPI server with full REST API | ✅ |
| User registration & JWT auth | ✅ |
| Dev/demo login endpoint (`POST /auth/demo`) | ✅ |
| Donor registration & profile management | ✅ |
| Emergency request creation & matching | ✅ |
| ML donor matching (GradientBoosting + RandomForest) | ✅ |
| Socket.IO real-time tracking | ✅ |
| Hospital directory API (2,566 records) | ✅ |
| Blood bank directory with live stock simulation | ✅ |
| Google Places integration (optional) | ✅ |
| Docker Compose (PostgreSQL + Redis + Backend) | ✅ |
| Render deployment config | ✅ |

### ML Models

| Model | Metric | Value |
|-------|--------|-------|
| Match Score (GBR) | MAE | **0.024** |
| Accept Probability (RFC) | AUC | **0.9996** |
| Training data | 50,000 synthetic pairs | ✅ |

---

## 📋 What's Left / In Progress

### High Priority

| Task | Status | Notes |
|------|--------|-------|
| Backend API key for deployment | 🔲 | Need to deploy FastAPI backend to Render or Railway |
| Fix `app.json` API URL for production | 🔲 | Currently `localhost:8000` — needs deployed backend URL |
| Handle web-specific issues (maps, notifications) | 🔲 | `react-native-maps` & `expo-notifications` have limited web support |
| Add real Google OAuth config | 🔲 | Currently using instant demo login — works for showcasing |
| Test full patient→donor flow end-to-end | 🔲 | Need running backend + two app instances |

### Medium Priority

| Task | Status | Notes |
|------|--------|-------|
| Play Store / App Store deployment | 🔲 | EAS Build config exists but not submitted |
| Real SMS OTP via Fast2SMS | 🔲 | Backend has the code, need API key & wire to app |
| Firebase push notifications | 🔲 | Backend supports it, need Firebase config |
| Production PostgreSQL setup | 🔲 | Docker Compose ready, need cloud DB |
| Socket.IO production config | 🔲 | Need WS-enabled hosting |
| Google Places API key | 🔲 | Needed for real hospital names & ratings |

### Future Scope

| Task | Status |
|------|--------|
| Multi-language support (Hindi, Bengali, Tamil) | 🔲 Planned |
| ABHA/Aadhaar KYC integration | 🔲 Planned |
| Blood unit QR hash chain (anti-corruption) | 🔲 Planned |
| Command Center web dashboard | 🔲 Planned |
| 7-day shortage prediction (LSTM) | 🔲 Planned |
| Blood desert heatmap | 🔲 Planned |

---

## 🚀 Quick Start

### Prerequisites
```
Node.js 18+   Python 3.9+   Expo Go app (phone)
```

### 1. Start Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# → http://localhost:8000
```

### 2. Start Mobile App
```bash
cd mobile/vitallink-app
npm install
npx expo start
# → http://localhost:8081 (web)
# → QR code for Expo Go (phone)
```

### 3. Demo Login
Open the app → choose **Donor** or **Patient** → tap **Login as Donor/Patient** → instant access, no credentials needed.

---

## 🌐 Deploy to Vercel

The app is configured for Vercel deployment:

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Repository**
3. **Root Directory:** `mobile/vitallink-app`
4. Click **Deploy**

Vercel will auto-run `npx expo export --platform web` and serve the static build.

> **Note:** The Expo web version has limited support for `react-native-maps` and notifications. For the full experience, run the app with `npx expo start` and open in Expo Go on your phone.

---

## 🏗️ Project Structure

```
vitallink/
├── mobile/vitallink-app/     ← React Native (Expo) — unified Donor + Patient app
│   ├── src/
│   │   ├── screens/          ← All app screens (auth, donor, patient)
│   │   ├── components/       ← Reusable UI (Drop, Card, BloodTag, etc.)
│   │   ├── theme/            ← Design tokens & colors
│   │   └── api/              ← API client & config
│   ├── app.json              ← Expo config (API URL, permissions)
│   ├── vercel.json           ← Vercel deployment config
│   └── dist/                 ← Web build output (auto-generated)
│
├── backend/                  ← FastAPI Python backend
│   ├── main.py               ← API server entry point
│   ├── routers/              ← API route handlers
│   ├── models/               ← SQLAlchemy ORM models
│   ├── services/             ← Business logic
│   ├── ml/                   ← ML models & training scripts
│   └── database/             ← DB connection & init
│
├── Datasets/                 ← Hospital data (2,566 records)
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.85 + Expo SDK 56 + TypeScript |
| Backend | Python 3.12 + FastAPI |
| ML | scikit-learn (GBR, RFC, Isolation Forest) |
| Database | SQLite (dev) / PostgreSQL (production) |
| Cache | Redis (live location, 5-min TTL) |
| Notifications | Expo Push API + Firebase Admin |
| Auth | Google OAuth / OTP (dev demo mode active) |
| Deployment | Vercel (web) / Render (backend) |

---

## 👤 Author

**Harsh Sharma** — MCA (AI & ML), Chandigarh University

---

<div align="center">
<b>🩸 VitalLink — Emergency blood matching, live and in sync.</b>
<br>
<i>Built to make India's blood black market obsolete — one verified match at a time.</i>
</div>
