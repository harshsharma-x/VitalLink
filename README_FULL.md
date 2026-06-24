COM# RaktSetu — Full-Stack Blood Emergency Platform

A React Native mobile app + FastAPI backend with AI/ML for instant emergency blood matching across India.

## 📱 **Mobile App** (React Native + Expo)

Patient & Donor apps with live tracking, OTP login, Firebase Auth, and push notifications.

**Location:** `/src`, `App.tsx`, `app.json`  
**Setup:** See `DEVELOPER.md`

```bash
npm install
npm run start
```

**Key Features:**
- 🔐 Phone OTP login (Firebase)
- 📍 Live location tracking (Expo Location + MapView)
- 🔔 Push notifications (Expo Notifications)
- 🧭 Navigation with TypeScript
- 🎯 State management (Zustand)

---

## 🧠 **Backend API** (FastAPI + ML)

RESTful endpoints with AI/ML models for urgency scoring, fraud detection, donor reliability, and spatial matching.

**Location:** `/backend`  
**Setup:** See `backend/README.md`

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**ML Models:**
1. **Urgency Scorer** (XGBoost) — CRITICAL/URGENT/SCHEDULED triage
2. **Fraud Detector** (Isolation Forest) — Plasma scams, touts, blood farms
3. **Reliability Predictor** (Gradient Boosting) — Donor show-up probability
4. **PostGIS Matcher** — Find nearby donors by blood type & location

**API Endpoints:**
- `POST /requests` — Create emergency request (auto-scores urgency)
- `GET /requests/{id}/donors` — Get matching donors (ranked by reliability + distance)
- `POST /donors/register` — Register donor with location
- `GET /fraudcheck/donor/{id}` — Fraud detection
- `GET /reliability/{id}` — Donor reliability score

---

## 🏗️ **Project Structure**

```
RaktSetu/
├── README.md                 # This file
├── package.json              # Frontend npm dependencies
├── src/                      # React Native source code
│   ├── screens/              # 8 UI screens (Login, Home, Patient, Donor, etc.)
│   ├── services/             # Firebase, API, Location, Notifications
│   ├── store/                # Zustand state management
│   └── navigation/           # React Navigation
│
├── backend/                  # Python FastAPI backend
│   ├── main.py               # FastAPI app + endpoints
│   ├── database.py           # SQLAlchemy models (PostgreSQL + PostGIS)
│   ├── models_ml/            # ML modules
│   │   ├── urgency_scorer.py      # XGBoost model
│   │   ├── fraud_detector.py      # Isolation Forest
│   │   ├── reliability_predictor.py # Gradient Boosting
│   │   └── matcher.py             # PostGIS spatial matching
│   ├── scripts/
│   │   └── train_urgency_scorer.py # Training script
│   ├── requirements.txt       # Python dependencies
│   ├── setup.sh              # Backend setup script
│   └── README.md             # Backend docs
│
├── DEVELOPER.md              # Developer guide (Android app)
└── .env.example              # Environment template
```

---

## 🚀 **Quick Start**

### 1. Mobile App (Android)

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with Firebase credentials

# Type-check
npm run tsc

# Start Expo
npm run start
# Press 'a' for Android Emulator or scan QR with Expo Go app
```

**Docs:** See `DEVELOPER.md`

### 2. Backend API (Python)

```bash
cd backend

# Setup Python
bash setup.sh
source venv/bin/activate

# Start PostgreSQL
docker run -d --name raktsetu-db \
  -e POSTGRES_PASSWORD=dev123 \
  -e POSTGRES_DB=vitallink \
  -p 5432:5432 postgis/postgis:15-3.4

# Train ML models (first time)
python scripts/train_urgency_scorer.py

# Start FastAPI server
python main.py
```

API docs: `http://localhost:8000/docs`  
**Docs:** See `backend/README.md`

---

## 🎯 **MVP Feature Status**

| Feature | Status | Notes |
|---------|--------|-------|
| Emergency request creation | ✅ | Auto-scored urgency (XGBoost) |
| Donor registration | ✅ | With location (PostGIS) |
| Matching donors | ✅ | Ranked by reliability + distance |
| Urgency scorer | ✅ | XGBoost model trained |
| Fraud detection | ✅ | Isolation Forest (tout, farm patterns) |
| Donor reliability | ✅ | Gradient Boosting (show-up prob) |
| Firebase Auth | ✅ | Phone OTP scaffold |
| Live tracking | ✅ | Maps + location stream ready |
| Push notifications | ✅ | Expo Notifications scaffold |
| API endpoints | ✅ | RESTful with Swagger docs |

---

## 📊 **ML Models Summary**

### Urgency Scorer (XGBoost)
- **Input:** blood_type, units_needed, stock_available, is_emergency
- **Output:** score (0-100), level (CRITICAL/URGENT/SCHEDULED)
- **Training:** Synthetic data, 100 estimators
- **Use:** Automatically triage all incoming requests

### Fraud Detector (Isolation Forest)
- **Input:** num_requests, days_since_last, total_donations, no_shows
- **Output:** is_anomaly, anomaly_score, fraud_types (TOUT_PATTERN, BLOOD_FARM, etc.)
- **Training:** Synthetic data, 50 estimators
- **Use:** Flag suspicious donor/patient patterns

### Reliability Predictor (Gradient Boosting)
- **Input:** total_donations, no_shows, days_since_last, is_available
- **Output:** reliability_score (0-1), show_up_prob, recommendation
- **Training:** Synthetic data, 50 estimators
- **Use:** Rank donors when matching requests

### PostGIS Matcher
- **Input:** hospital_location, blood_type, radius_km
- **Output:** sorted list of compatible, nearby donors
- **Database:** PostgreSQL + PostGIS (GIST index on location)
- **Query:** ST_DWithin + distance ranking

---

## 🔐 **Security & Privacy**

- ✅ PostgreSQL encryption at rest (configure in production)
- ✅ Location data only shared during active match (Redis TTL 5 min)
- ✅ DISHA compliance ready (AES-256, TLS 1.3)
- ✅ Fraud flags auto-trigger for anomalies
- ✅ Phone numbers masked during calls (Exotel proxy)

---

## 🔧 **Environment Variables**

### Frontend (`.env.local`)
```env
FIREBASE_API_KEY=xxx
FIREBASE_PROJECT_ID=xxx
API_BASE_URL=http://192.168.x.x:8000
GOOGLE_MAPS_API_KEY=xxx
```

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres:dev123@localhost/vitallink
JWT_SECRET=your-secret
```

---

## 📖 **Documentation**

- **Mobile Dev Guide:** [DEVELOPER.md](DEVELOPER.md)
- **Backend API Docs:** [backend/README.md](backend/README.md)
- **Interactive API Docs:** http://localhost:8000/docs (Swagger)

---

## 🚢 **Deployment**

### Mobile (Android)
```bash
# Build APK
npx eas build -p android --profile preview

# Or submit to Play Store
# (requires Google Play account + signing key)
```

### Backend (Python)
```bash
# Docker deployment
docker build -t raktsetu-api .
docker run -p 8000:8000 raktsetu-api

# Or cloud (AWS Lambda, GCP Cloud Run, etc.)
```

---

## 🎓 **Next Steps**

### Phase 2 (Months 2–3)
- [ ] Graph Neural Network donor matching
- [ ] LSTM 7-day shortage forecasting
- [ ] WhatsApp Business API integration
- [ ] Socket.io live tracking server
- [ ] Command Center web dashboard (React)

### Phase 3 (Months 4–6)
- [ ] Unit QR hash chain + blockchain audit
- [ ] ABDM sandbox certification
- [ ] NBTC dashboard listing

### Phase 4 (Months 7+)
- [ ] Play Store launch
- [ ] iOS app (same React Native codebase)
- [ ] State health dept pilot MoU

---

## 🆘 **Support**

- **Issues:** Create GitHub issues for bugs
- **Docs:** See DEVELOPER.md and backend/README.md
- **Questions:** Email or open discussion

---

## 📄 **License**

Open source. See LICENSE file.

---

## 👨‍💻 **Built By**

**Harsh** — MCA (AI & ML), Chandigarh University  
**GitHub:** [anchalkumarsharma](https://github.com/anchalkumarsharma)

---

<div align="center">

**🩸 RaktSetu — Emergency blood matching, live and in sync.**

*Making India's blood black market obsolete — one verified match at a time.*

</div>
