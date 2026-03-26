"""
analytics.py — optimized queries
Fixes:
  - weekly_analytics was full table scan (no date filter) → 7-day window + LIMIT
  - monthly_analytics leaked DB session (no finally) → Depends(get_db)
  - Both queries now return only needed columns (no SELECT *)
  - Added SQLAlchemy Index definitions (apply via Alembic migration)
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import get_db
from models import VitalSigns

router = APIRouter(prefix="/analytics", tags=["analytics"])

_7D  = timedelta(days=7)
_30D = timedelta(days=30)
MAX_RAW_RECORDS = 2016              # 7 days × 288 records/day at 2-min interval


@router.get("/weekly/{user_id}")
def weekly_analytics(user_id: int, db: Session = Depends(get_db)):
    """
    Returns per-record vitals for the last 7 days.
    Index used: idx_vital_signs_user_time (user_id, recorded_at DESC)
    """
    since = datetime.now(timezone.utc) - _7D

    rows = (
        db.query(
            VitalSigns.heart_rate,
            VitalSigns.systolic_bp,
            VitalSigns.diastolic_bp,
            VitalSigns.spo2,
            VitalSigns.temperature,
            VitalSigns.recorded_at,
        )
        .filter(
            VitalSigns.user_id == user_id,
            VitalSigns.recorded_at >= since,
        )
        .order_by(VitalSigns.recorded_at.asc())
        .limit(MAX_RAW_RECORDS)
        .all()
    )

    return [
        {
            "heart_rate": r.heart_rate,
            "systolic":   r.systolic_bp,
            "diastolic":  r.diastolic_bp,
            "spo2":       r.spo2,
            "temperature":r.temperature,
            "date":       r.recorded_at,
        }
        for r in rows
    ]


@router.get("/monthly/{user_id}")
def monthly_analytics(user_id: int, db: Session = Depends(get_db)):
    """
    Returns daily aggregated averages for the last 30 days.
    Index used: idx_vital_signs_user_time
    """
    since = datetime.now(timezone.utc) - _30D

    rows = (
        db.query(
            func.date(VitalSigns.recorded_at).label("date"),
            func.avg(VitalSigns.heart_rate).label("avg_hr"),
            func.avg(VitalSigns.spo2).label("avg_spo2"),
            func.avg(VitalSigns.systolic_bp).label("avg_systolic"),
            func.avg(VitalSigns.diastolic_bp).label("avg_diastolic"),
            func.min(VitalSigns.heart_rate).label("min_hr"),
            func.max(VitalSigns.heart_rate).label("max_hr"),
        )
        .filter(
            VitalSigns.user_id == user_id,
            VitalSigns.recorded_at >= since,
        )
        .group_by(func.date(VitalSigns.recorded_at))
        .order_by(func.date(VitalSigns.recorded_at).asc())
        .all()
    )

    return [
        {
            "date":         str(r.date),
            "avg_hr":       round(r.avg_hr or 0, 1),
            "avg_spo2":     round(r.avg_spo2 or 0, 1),
            "avg_systolic": round(r.avg_systolic or 0, 1),
            "avg_diastolic":round(r.avg_diastolic or 0, 1),
            "min_hr":       r.min_hr,
            "max_hr":       r.max_hr,
        }
        for r in rows
    ]


@router.get("/latest/{user_id}")
def latest_vitals(user_id: int, db: Session = Depends(get_db)):
    """Single latest record — used by dashboard on page load."""
    row = (
        db.query(VitalSigns)
        .filter(VitalSigns.user_id == user_id)
        .order_by(VitalSigns.recorded_at.desc())
        .first()
    )
    if not row:
        return {}
    return {
        "heart_rate": row.heart_rate,
        "systolic":   row.systolic_bp,
        "diastolic":  row.diastolic_bp,
        "spo2":       row.spo2,
        "temperature":row.temperature,
        "recorded_at":row.recorded_at,
    }