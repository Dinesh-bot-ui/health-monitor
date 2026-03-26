"""
database.py + models.py — optimized schema
Key improvements:
  - Composite index on (user_id, recorded_at DESC) for vital_signs
  - Index on users.email (was relying on unique=True, which creates index but
    making it explicit improves planner statistics)
  - Async SQLAlchemy engine for non-blocking queries
  - Connection pool tuned for concurrent WebSocket users
"""
from __future__ import annotations

import os
from sqlalchemy import (
    Boolean, Column, Float, ForeignKey, Index, Integer,
    String, TIMESTAMP, create_engine, text,
)
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# ── Sync engine (used by existing sync routes during migration) ───────────────

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:root@localhost/health_monitoring",
)
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_engine(
    DATABASE_URL,
    pool_size=10,           # baseline connections kept open
    max_overflow=20,        # burst connections above pool_size
    pool_timeout=30,
    pool_pre_ping=True,     # detect stale connections
    echo=False,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# ── Async engine (for WebSocket + new async routes) ──────────────────────────

async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False,
)
AsyncSessionLocal = async_sessionmaker(async_engine, expire_on_commit=False)


# ── Base ──────────────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    pass


# ── Models ────────────────────────────────────────────────────────────────────

class Users(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    full_name     = Column(String, nullable=False)
    email         = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_form_submitted = Column(Boolean, default=False, nullable=False)


class UserProfile(Base):
    __tablename__ = "user_profile"
    user_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    age       = Column(Integer)
    gender    = Column(String(20))
    height_cm = Column(Float)
    weight_kg = Column(Float)
    city      = Column(String(100))
    work_type = Column(String(50))


class Lifestyle(Base):
    __tablename__ = "lifestyle"
    user_id          = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    exercise         = Column(Boolean)
    exercise_type    = Column(String(200))
    duration_minutes = Column(Integer)
    diet_type        = Column(String(50))
    water_intake     = Column(Float)
    sleep_hours      = Column(Float)
    smoking          = Column(Boolean)


class VitalSigns(Base):
    __tablename__ = "vital_signs"
    id           = Column(Integer, primary_key=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    heart_rate   = Column(Integer)
    systolic_bp  = Column(Integer)
    diastolic_bp = Column(Integer)
    spo2         = Column(Float)
    temperature  = Column(Float)
    recorded_at  = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False)

    __table_args__ = (
        # The single most impactful index: covers weekly/monthly analytics + latest lookup
        Index("idx_vital_signs_user_time", "user_id", recorded_at.desc()),
    )


class MedicalHistory(Base):
    __tablename__ = "medical_history"
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    diabetes     = Column(Boolean)
    hypertension = Column(Boolean)
    heart_disease= Column(Boolean)
    thyroid      = Column(Boolean)
    asthma       = Column(Boolean)
    medications  = Column(String(500))
    allergies    = Column(String(500))


class HealthScore(Base):
    __tablename__ = "health_score"
    user_id  = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    score    = Column(Integer, nullable=False)
    status   = Column(String(20), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))


# ── Dependency injectors ──────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session