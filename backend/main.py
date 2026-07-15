from dotenv import load_dotenv
load_dotenv()

import os
import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from sqlalchemy import text
import socketio
import uvicorn

from database.database import init_db
from routers.auth import router as auth
from routers.donor import router as donor
from routers.request import router as request
from routers.matching import router as matching
from routers.tracking import router as tracking
from routers.bloodbank import router as bloodbank
from routers.hospitals import router as hospitals
from routers.compliance import router as compliance

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Socket.IO server ──────────────────────────────────────────────────────────
# Parse CORS origins for Socket.IO (must be * or a list)
cors_origins_str = os.getenv("CORS_ORIGINS", "*")
if cors_origins_str == "*":
    sio_cors = "*"
else:
    sio_cors = [o.strip() for o in cors_origins_str.split(",")]

sio = socketio.AsyncServer(
    cors_allowed_origins=sio_cors,
    async_mode="asgi"
)

# ── Rate limiter (sliding window with periodic cleanup) ───────────────────────
_rate_limit_store: dict[str, list[float]] = {}
_LAST_CLEANUP: float = time.time()

RATE_LIMITED_PATHS = {
    "/auth/send-otp": {"max": 5, "window": 60},
    "/auth/verify-otp": {"max": 10, "window": 60},
    "/requests/": {"max": 20, "window": 60},
}

def _prune_rate_store(now: float) -> None:
    """Remove stale entries older than 5 minutes to prevent memory leaks."""
    global _LAST_CLEANUP
    if now - _LAST_CLEANUP < 300:  # Only clean up every 5 minutes
        return
    cutoff = now - 300
    expired_keys = [
        k for k, v in _rate_limit_store.items()
        if all(t < cutoff for t in v)
    ]
    for k in expired_keys:
        del _rate_limit_store[k]
    _LAST_CLEANUP = now

async def rate_limit_middleware(request: Request, call_next):
    path = request.url.path
    method = request.method

    # Check if this path needs rate limiting (only POST)
    if method != "POST":
        return await call_next(request)

    limit_config = None
    for prefix, cfg in RATE_LIMITED_PATHS.items():
        if path.startswith(prefix):
            limit_config = cfg
            break

    if limit_config is None:
        return await call_next(request)

    client_ip = request.client.host if request.client else "unknown"
    key = f"{client_ip}:{path}"
    now = time.time()
    window_start = now - limit_config["window"]

    # Prune stale entries periodically
    _prune_rate_store(now)

    store = _rate_limit_store.get(key, [])
    store = [t for t in store if t > window_start]

    if len(store) >= limit_config["max"]:
        logger.warning("Rate limit exceeded for %s (%d/%d in %ds)",
                       key, len(store), limit_config["max"], limit_config["window"])
        return JSONResponse(
            status_code=429,
            content={"detail": f"Too many requests. Max {limit_config['max']} per {limit_config['window']}s."}
        )

    store.append(now)
    _rate_limit_store[key] = store
    return await call_next(request)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="VitalLink API",
    description="Emergency Blood Matching Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: use env var with fallback to * for development
cors_origins = (
    ["*"] if cors_origins_str == "*"
    else [o.strip() for o in cors_origins_str.split(",")]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting middleware
app.middleware("http")(rate_limit_middleware)

app.include_router(auth)
app.include_router(donor)
app.include_router(request)
app.include_router(matching)
app.include_router(tracking)
app.include_router(bloodbank)
app.include_router(hospitals)
app.include_router(compliance)


@sio.event
async def connect(sid, environ):
    logger.info("Socket client connected: %s", sid)


@sio.event
async def disconnect(sid):
    logger.info("Socket client disconnected: %s", sid)


@sio.event
async def join_tracking(sid, data):
    request_id = data.get("request_id")
    await sio.enter_room(sid, f"tracking_{request_id}")


@sio.event
async def leave_tracking(sid, data):
    request_id = data.get("request_id")
    await sio.leave_room(sid, f"tracking_{request_id}")


@sio.event
async def donor_location(sid, data):
    request_id = data.get("request_id")
    await sio.emit("location_update", data, room=f"tracking_{request_id}", skip_sid=sid)


socket_app = socketio.ASGIApp(sio, other_asgi_app=app)


@app.get("/")
def root():
    return {"message": "VitalLink API - Emergency Blood Matching", "version": "1.0.0", "status": "operational"}


@app.get("/health")
def health_check():
    """Health check — also pings the database so Render knows if DB is connected."""
    try:
        from database.database import get_db
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "healthy", "database": "connected", "version": "1.0.0"}
    except Exception as exc:
        logger.warning("Health check failed: %s", exc)
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected", "detail": str(exc)}
        )


if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)
