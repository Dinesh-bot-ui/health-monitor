from sqlalchemy import Column, Integer, Float, String, Boolean, ForeignKey, TIMESTAMP
from database import Base
from datetime import datetime

class VitalSigns(Base):
    __tablename__ = "vital_signs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    heart_rate = Column(Integer)
    systolic_bp = Column(Integer)
    diastolic_bp = Column(Integer)
    spo2 = Column(Float)
    temperature = Column(Float)
    recorded_at = Column(TIMESTAMP, default=datetime.utcnow)


class HealthScore(Base):
    __tablename__ = "health_score"

    user_id = Column(Integer, primary_key=True)
    score = Column(Integer)
    status = Column(String)

class UserProfile(Base):
    __tablename__ = "user_profile"

    user_id = Column(Integer, primary_key=True)
    age = Column(Integer)
    gender = Column(String)
    height_cm = Column(Float)
    weight_kg = Column(Float)
    city = Column(String)
    work_type = Column(String)


class Lifestyle(Base):
    __tablename__ = "lifestyle"

    user_id = Column(Integer, primary_key=True)
    exercise = Column(Boolean)
    exercise_type = Column(String)
    duration_minutes = Column(Integer)
    diet_type = Column(String)
    water_intake = Column(Float)
    sleep_hours = Column(Float)
    smoking = Column(Boolean)

class MedicalHistory(Base):
    __tablename__ = "medical_history"

    user_id = Column(Integer, primary_key=True)
    diabetes = Column(Boolean)
    hypertension = Column(Boolean)
    heart_disease = Column(Boolean)
    thyroid = Column(Boolean)
    asthma = Column(Boolean)
    medications = Column(String)
    allergies = Column(String)

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    is_form_submitted = Column(Boolean, default=False, nullable=False)