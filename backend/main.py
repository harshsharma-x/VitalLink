from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
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

# Socket.IO server
sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    print(f"Socket client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"Socket client disconnected: {sid}")


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
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)
