# VitalLink Deployment Guide

## Deploy Backend to Render

### Prerequisites
- A [Render](https://render.com) account (free tier works)
- Your code pushed to a GitHub repository

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 2: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect your GitHub repo
3. Render will detect `render.yaml` in the root
4. It will auto-create:
   - A **Web Service** (`vitallink-backend`)
   - A **PostgreSQL database** (`vitallink-db`)
5. Click **Apply**

Render will:
- Provision the PostgreSQL database
- Build the Docker image
- Start the web service on `https://vitallink-backend.onrender.com`

### Step 3: Post-Deploy Configuration

After the first deploy, add these optional env vars in the Render Dashboard:

| Variable | Required | Notes |
|----------|----------|-------|
| `FAST2SMS_API_KEY` | No | For real SMS OTP delivery |
| `GOOGLE_CLIENT_ID` | No | For Google OAuth verification |
| `REDIS_URL` | No | For live tracking (Redis free tier from Render) |

### Step 4: Verify Deployment

Visit `https://vitallink-backend.onrender.com/health` — you should see:
```json
{"status": "healthy", "database": "connected", "version": "1.0.0"}
```

## Configure Mobile App for Production

### Option A: Auto-detection (recommended)

The app's `config.ts` resolves the API URL in this order:
1. `EXPO_PUBLIC_API_URL` environment variable (set in EAS builds)
2. `app.json` → `extra.apiUrl` (falls back to `localhost:8000` for dev)
3. `app.json` → `extra.localApiUrl` (explicit local URL)

For production builds, `eas.json` already has:
```json
"production": {
  "env": {
    "EXPO_PUBLIC_API_URL": "https://vitallink-backend.onrender.com"
  }
}
```

### Option B: Build for production

```bash
# Build APK pointing to production
npx eas build -p android --profile production

# Or build locally with env var
EXPO_PUBLIC_API_URL=https://vitallink-backend.onrender.com npx expo start
```

## Important Notes

### Render Free Tier Limitations
- **Spin-down after inactivity**: The free web service sleeps after 15 minutes of inactivity. First request after sleep takes 30-60 seconds.
- **Bandwidth**: 100 GB/month (sufficient for demo)
- **PostgreSQL**: 1 GB storage (free tier)

### Making API Requests from Vercel
The `render.yaml` already configures CORS to allow requests from:
- `https://vitallink-app.vercel.app`
- `https://vitallink.vercel.app`

If your Vercel deployment URL is different, update `CORS_ORIGINS` in the Render Dashboard.

### ML Models
Both ML models (`matching_model.pkl`, `fraud_model.pkl`) are included in the repository and will be deployed with the code. No manual training is needed on Render.

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| `/health` returns 503 | Check that Render's PostgreSQL is provisioned. It can take 2-3 minutes on first deploy. |
| Demo login fails | Verify `CORS_ORIGINS` includes your app's URL |
| "Cannot find matching_model.pkl" | Push the `backend/ml/` directory with the model files |
| Websocket not connecting | Render supports WebSockets. Ensure your app uses `wss://vitallink-backend.onrender.com` for Socket.IO |
