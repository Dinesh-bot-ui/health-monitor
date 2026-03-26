"""
main.py — production-ready app entry point

Improvements:
  - lifespan() replaces deprecated @app.on_event("startup")
  - Structured logging (JSON-ready)
  - CORS locked to explicit origins
  - /health endpoint for load balancer checks
  - All routers use consistent prefixes
"""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from core.database import Base, async_engine, engine
from core.routes import router as form_router
from core.analytics import router as analytics_router
from websocket import websocket_endpoint
from models.load_ml import init_ml
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)

ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")
print("🔥 THIS IS NEW MAIN.PY")

# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    # Sync table creation (idempotent)
    Base.metadata.create_all(bind=engine)
    # ML models (lightweight, <100ms)
    init_ml()
    # LLMs are loaded lazily per-agent on first call (heavy, optional)
    logger.info("Startup complete")
    yield
    logger.info("Shutting down...")
    await async_engine.dispose()


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="HealthPulse API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],   # 🔥 allow all methods
    allow_headers=["*"],   # 🔥 allow all headers
)

app.include_router(form_router)
app.include_router(analytics_router)


# ── WebSocket ─────────────────────────────────────────────────────────────────

@app.websocket("/ws/health")
async def ws_health(websocket: WebSocket):
    await websocket_endpoint(websocket)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["ops"])
def health_check():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/", tags=["ops"])
def root():
    return {"message": "HealthPulse API v2", "ws": "/ws/health?token=<jwt>"}


# ── Dev entrypoint ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        workers=1,      # use gunicorn + uvicorn workers in production
    )