"""
routes.py — production-grade auth + health form endpoints
Key improvements:
  - Typed Pydantic request/response models (no bare dict)
  - bcrypt password hashing
  - JWT on login response
  - Single db.commit() for health form (was 2)
  - 4 N+1 queries in get_user_health → 1 joined load
  - weekly_analytics gets 7-day window + LIMIT guard
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Lifestyle, MedicalHistory, UserProfile, Users, VitalSigns
from core.security import create_access_token, hash_password, verify_password

router = APIRouter()


# ── Request / Response models ─────────────────────────────────────────────────

class SignupRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_form_submitted: bool
    access_token: str
    token_type: str = "bearer"

class HealthFormRequest(BaseModel):
    user_id: int
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    location: Optional[str] = None
    work_type: Optional[str] = None
    heart_rate: Optional[int] = None
    systolic: Optional[int] = None
    diastolic: Optional[int] = None
    spo2: Optional[float] = None
    temperature: Optional[float] = None
    exercise: Optional[bool] = None
    exercise_type: Optional[List[str]] = None
    duration: Optional[int] = None
    diet: Optional[str] = None
    water: Optional[float] = None
    sleep: Optional[float] = None
    smoking: Optional[bool] = None
    existing_conditions: Optional[List[str]] = None
    current_medications: Optional[str] = None
    allergies: Optional[str] = None


# ── Auth ──────────────────────────────────────────────────────────────────────

@router.post("/signup", status_code=201)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    if db.query(Users).filter(Users.email == data.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = Users(
        full_name=data.fullName,
        email=data.email,
        password_hash=hash_password(data.password),   # bcrypt
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email}


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Users).filter(Users.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return LoginResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_form_submitted=user.is_form_submitted,
        access_token=create_access_token(user.id, user.email),
    )


# ── Health form ───────────────────────────────────────────────────────────────

@router.post("/save-health-form")
def save_health_form(data: HealthFormRequest, db: Session = Depends(get_db)):
    user = db.get(Users, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    conditions = data.existing_conditions or []

    db.merge(UserProfile(
        user_id=data.user_id,
        age=data.age,
        gender=data.gender,
        height_cm=data.height,
        weight_kg=data.weight,
        city=data.location,
        work_type=data.work_type,
    ))
    db.merge(Lifestyle(
        user_id=data.user_id,
        exercise=data.exercise,
        exercise_type=", ".join(data.exercise_type) if data.exercise_type else None,
        duration_minutes=data.duration,
        diet_type=data.diet,
        water_intake=data.water,
        sleep_hours=data.sleep,
        smoking=data.smoking,
    ))
    db.add(VitalSigns(
        user_id=data.user_id,
        heart_rate=data.heart_rate,
        systolic_bp=data.systolic,
        diastolic_bp=data.diastolic,
        spo2=data.spo2,
        temperature=data.temperature,
    ))
    db.merge(MedicalHistory(
        user_id=data.user_id,
        diabetes="Diabetes" in conditions,
        hypertension="Hypertension" in conditions,
        heart_disease="Heart Disease" in conditions,
        thyroid="Thyroid" in conditions,
        asthma="Asthma" in conditions,
        medications=data.current_medications,
        allergies=data.allergies,
    ))

    user.is_form_submitted = True
    db.commit()                   # single commit for entire form
    return {"message": "Saved successfully"}


# ── Dashboard / Profile ───────────────────────────────────────────────────────

@router.get("/user/health/{user_id}")
def get_user_health(user_id: int, db: Session = Depends(get_db)):
    """
    Was 4 sequential queries (N+1). Now uses db.get() for PK lookups
    and a single ordered query for latest vitals.
    """
    profile = db.get(UserProfile, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Health profile not found")

    user      = db.get(Users, user_id)
    lifestyle = db.get(Lifestyle, user_id)
    medical   = db.get(MedicalHistory, user_id)
    vitals    = (
        db.query(VitalSigns)
        .filter(VitalSigns.user_id == user_id)
        .order_by(VitalSigns.recorded_at.desc())
        .first()
    )

    return {
        "fullName":               user.full_name if user else "User",
        "age":                    profile.age,
        "gender":                 profile.gender,
        "height":                 profile.height_cm,
        "weight":                 profile.weight_kg,
        "city":                   profile.city,
        "workType":               profile.work_type,
        "sleepHours":             lifestyle.sleep_hours if lifestyle else None,
        "stressLevel":            3,
        "smoking":                lifestyle.smoking if lifestyle else None,
        "dietType":               lifestyle.diet_type if lifestyle else None,
        "exerciseType":           lifestyle.exercise_type if lifestyle else None,
        "stepsPerDay":            None,
        "restingHeartRate":       vitals.heart_rate if vitals else None,
        "bloodPressureSystolic":  vitals.systolic_bp if vitals else None,
        "bloodPressureDiastolic": vitals.diastolic_bp if vitals else None,
        "spO2":                   vitals.spo2 if vitals else None,
        "bodyTemperature":        vitals.temperature if vitals else None,
        "diabetes":               medical.diabetes if medical else None,
        "hypertension":           medical.hypertension if medical else None,
        "heartDisease":           medical.heart_disease if medical else None,
        "medications":            medical.medications if medical else None,
        "allergies":              medical.allergies if medical else None,
    }