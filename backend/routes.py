from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from models import UserProfile, Lifestyle, MedicalHistory, VitalSigns, Users
from database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

# ─── Request Models ──────────────────────────
class SignupRequest(BaseModel):
    fullName: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ─── Auth Routes ─────────────────────────────

@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing = db.query(Users).filter(Users.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = Users(
        full_name=data.fullName,
        email=data.email,
        password_hash=data.password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email
    }

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(Users).filter(Users.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found. Please register first.")

    if user.password_hash != data.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "is_form_submitted": user.is_form_submitted
    }

@router.post("/save-health-form")
def save_health_form(data: dict, db: Session = Depends(get_db)):
    user_id = data.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    user = db.query(Users).filter(Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    # ✅ UserProfile — matches model exactly
    db.merge(UserProfile(
        user_id=user_id,
        age=data.get("age"),
        gender=data.get("gender"),
        height_cm=data.get("height"),
        weight_kg=data.get("weight"),
        city=data.get("location"),
        work_type=data.get("work_type"),
    ))

    # ✅ Lifestyle — matches model exactly
    # exercise_type is a list from frontend, convert to string for DB
    exercise_type = data.get("exercise_type", [])
    db.merge(Lifestyle(
        user_id=user_id,
        exercise=data.get("exercise"),
        exercise_type=", ".join(exercise_type) if isinstance(exercise_type, list) else exercise_type,
        duration_minutes=data.get("duration"),
        diet_type=data.get("diet"),
        water_intake=data.get("water"),
        sleep_hours=data.get("sleep"),
        smoking=data.get("smoking"),
    ))

    # ✅ VitalSigns — matches model exactly
    db.add(VitalSigns(
        user_id=user_id,
        heart_rate=data.get("heart_rate"),
        systolic_bp=data.get("systolic"),
        diastolic_bp=data.get("diastolic"),
        spo2=data.get("spo2"),
        temperature=data.get("temperature"),
    ))

    # ✅ MedicalHistory — fixed to match actual model columns
    conditions = data.get("existing_conditions", [])
    db.merge(MedicalHistory(
        user_id=user_id,
        diabetes="Diabetes" in conditions,
        hypertension="Hypertension" in conditions,
        heart_disease="Heart Disease" in conditions,
        thyroid="Thyroid" in conditions,
        asthma="Asthma" in conditions,
        medications=data.get("current_medications"),
        allergies=data.get("allergies"),
    ))

    db.commit()

    # ✅ Mark the health form as submitted for this user
    user.is_form_submitted = True
    db.commit()

    return {"message": "Saved successfully"}

@router.get("/dashboard/{user_id}")
def get_dashboard(user_id: int, db: Session = Depends(get_db)):
    latest = (
        db.query(VitalSigns)
        .filter(VitalSigns.user_id == user_id)
        .order_by(VitalSigns.recorded_at.desc())
        .first()
    )
    return {
        "heart_rate": latest.heart_rate,
        "systolic": latest.systolic_bp,
        "diastolic": latest.diastolic_bp,
        "spo2": latest.spo2,
        "temperature": latest.temperature,
        "recorded_at": latest.recorded_at
    } if latest else {}

@router.get("/user/health/{user_id}")
def get_user_health(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Health profile not found")

    user = db.query(Users).filter(Users.id == user_id).first()
    lifestyle = db.query(Lifestyle).filter(Lifestyle.user_id == user_id).first()
    vitals = (
        db.query(VitalSigns)
        .filter(VitalSigns.user_id == user_id)
        .order_by(VitalSigns.recorded_at.desc())
        .first()
    )
    medical = db.query(MedicalHistory).filter(MedicalHistory.user_id == user_id).first()

    return {
        # Users table
        "fullName": user.full_name if user else "User",
        # UserProfile table
        "age": profile.age,
        "gender": profile.gender,
        "height": profile.height_cm,
        "weight": profile.weight_kg,
        "city": profile.city,
        "workType": profile.work_type,
        # Lifestyle table
        "sleepHours": lifestyle.sleep_hours if lifestyle else None,
        "stressLevel": 3,                      # not in model, using default
        "smoking": lifestyle.smoking if lifestyle else None,
        "dietType": lifestyle.diet_type if lifestyle else None,
        "exerciseType": lifestyle.exercise_type if lifestyle else None,
        # VitalSigns table
        "restingHeartRate": vitals.heart_rate if vitals else None,
        "bloodPressureSystolic": vitals.systolic_bp if vitals else None,
        "bloodPressureDiastolic": vitals.diastolic_bp if vitals else None,
        "spO2": vitals.spo2 if vitals else None,
        "bodyTemperature": vitals.temperature if vitals else None,
        # MedicalHistory table
        "diabetes": medical.diabetes if medical else None,
        "hypertension": medical.hypertension if medical else None,
        "heartDisease": medical.heart_disease if medical else None,
        "medications": medical.medications if medical else None,
        "allergies": medical.allergies if medical else None,
    }