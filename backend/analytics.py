from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import VitalSigns
from datetime import datetime, timedelta
from sqlalchemy import func

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ Weekly Analytics
@router.get("/analytics/weekly/{user_id}")
def weekly_analytics(user_id: int, db: Session = Depends(get_db)):

    records = db.query(VitalSigns).filter(VitalSigns.user_id == user_id).all()

    result = []
    for r in records:
        result.append({
            "heart_rate": r.heart_rate,
            "systolic": r.systolic_bp,
            "diastolic": r.diastolic_bp,
            "spo2": r.spo2,
            "temperature": r.temperature,
            "date": r.recorded_at
        })

    return result


# ✅ Monthly Analytics
@router.get("/analytics/monthly/{user_id}")
def monthly_analytics(user_id: int):
    db: Session = SessionLocal()

    last_month = datetime.utcnow() - timedelta(days=30)

    data = (
        db.query(
            func.date(VitalSigns.recorded_at).label("date"),
            func.avg(VitalSigns.heart_rate).label("avg_hr"),
            func.avg(VitalSigns.spo2).label("avg_spo2"),
        )
        .filter(VitalSigns.user_id == user_id)
        .filter(VitalSigns.recorded_at >= last_month)
        .group_by(func.date(VitalSigns.recorded_at))
        .all()
    )

    return data