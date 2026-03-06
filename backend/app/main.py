from fastapi import FastAPI
from app.core.lifespan import lifespan
from app.core.config import settings

from datetime import datetime

# app creation 
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS middleware
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.137.1:5173",
        "http://192.168.0.118:5173",
        # Tauri 2.x desktop app origins
        "http://tauri.localhost",  # Tauri 2.x production build
        "https://tauri.localhost",  # Tauri 2.x production build (HTTPS variant)
        "tauri://localhost",  # Tauri 1.x fallback
        "http://10.0.2.2:8000",   # Android emulator
        "http://10.0.2.2:8081",   # Metro bundler via emulator
        "http://localhost:8081",  # Metro bundler
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
from app.core.exceptions import setup_exception_handlers
setup_exception_handlers(app)

@app.get("/", tags=["Home"])
async def home():
    return {"message": f"Welcome to {settings.APP_NAME} ;>"}

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.VERSION
    }


# importing all router here 
from app.router.v1 import user_auth, user, template, workout, session, exercise, insights
app.include_router(user_auth.user_auth_router)
app.include_router(user.user_router)
app.include_router(template.temp_router)
app.include_router(workout.workout_router)
app.include_router(session.session_router)
app.include_router(exercise.exercise_router)
app.include_router(insights.insights_router)







