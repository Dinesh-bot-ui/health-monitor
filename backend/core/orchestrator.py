"""
orchestrator.py — two-tier AI pipeline

Tier 1 (every 2s, <1ms):  rule_engine + health_engine → alerts, score, risk
Tier 2 (every 60s, async): LLM agents (insight, prediction, fitness, nutrition)
                            runs in a background task, result cached in memory

This eliminates the main bug: LLM inference was blocking the WS event loop.
Each WebSocket connection gets its own cached AI state that updates independently.
"""
from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import Any

from rule_engine import evaluate_rules
from health_engine import calculate_health_score
from ai_engine import predict_risk

logger = logging.getLogger(__name__)

AI_REFRESH_INTERVAL = 60          # seconds between LLM agent runs
AI_TIMEOUT_SECONDS  = 45          # max wait for a single agent


# ── Cached AI state per user session ─────────────────────────────────────────

@dataclass
class AIState:
    alerts:          list  = field(default_factory=list)
    predictions:     list  = field(default_factory=list)
    insights:        list  = field(default_factory=list)
    recommendations: list  = field(default_factory=list)
    score_breakdown: dict  = field(default_factory=dict)
    last_updated:    float = 0.0

    def is_stale(self) -> bool:
        return (time.monotonic() - self.last_updated) >= AI_REFRESH_INTERVAL


# ── Tier-1: fast synchronous pipeline (called every tick) ────────────────────

def fast_pipeline(vitals: dict) -> dict:
    """
    Pure rule-based — no LLM, no I/O.
    Returns alerts + score in <1ms.
    """
    ai_input = {
        "hr":   int(vitals.get("heart_rate", 72)),
        "spo2": int(vitals.get("spo2", 98)),
        "temp": float(vitals.get("temperature", 37.0)),
        "bpS":  int(vitals.get("systolic_bp", 120)),
        "bpD":  int(vitals.get("diastolic_bp", 80)),
    }

    alerts        = evaluate_rules(ai_input)
    score, status = calculate_health_score(vitals)
    risk          = predict_risk(vitals)

    smart_alerts = _enrich_alerts(alerts, ai_input)

    return {
        "score":  score,
        "status": status,
        "risk":   risk,
        "alerts": smart_alerts,
    }


def _enrich_alerts(base_alerts: list, vitals: dict) -> list:
    enriched = []
    for msg in base_alerts:
        if "Heart Rate" in msg and vitals["hr"] > 100:
            msg += " — consider slow breathing"
        elif "Oxygen" in msg:
            msg += " — sit upright, ensure ventilation"
        enriched.append({"cls": _severity(msg), "msg": msg})
    return enriched

def _severity(msg: str) -> str:
    if any(w in msg for w in ["Low Oxygen", "High Blood Pressure", "Critical"]):
        return "danger"
    if any(w in msg for w in ["High Heart Rate", "Low Heart Rate", "Elevated"]):
        return "warn"
    return "info"


# ── Tier-2: slow LLM pipeline (background task, cached) ──────────────────────

async def slow_pipeline(vitals: dict, state: AIState) -> None:
    """
    Runs LLM agents in a thread pool with a timeout.
    Updates `state` in place — never blocks the WS send loop.
    """
    if not state.is_stale():
        return

    ai_input = {
        "hr":   int(vitals.get("heart_rate", 72)),
        "spo2": int(vitals.get("spo2", 98)),
        "temp": float(vitals.get("temperature", 37.0)),
        "bpS":  int(vitals.get("systolic_bp", 120)),
        "bpD":  int(vitals.get("diastolic_bp", 80)),
        "hrv":  float(vitals.get("hrv", 42)),
    }

    try:
        result = await asyncio.wait_for(
            asyncio.to_thread(_run_llm_agents, ai_input),
            timeout=AI_TIMEOUT_SECONDS,
        )
        state.predictions     = result.get("predictions", [])
        state.insights        = result.get("insights", [])
        state.recommendations = result.get("recommendations", [])
        state.score_breakdown = result.get("score_breakdown", {})
        state.last_updated    = time.monotonic()
        logger.info("AI state refreshed for session")
    except asyncio.TimeoutError:
        logger.warning("LLM pipeline timed out after %ds", AI_TIMEOUT_SECONDS)
    except Exception as exc:
        logger.error("LLM pipeline error: %s", exc)


def _run_llm_agents(data: dict) -> dict:
    """
    Synchronous LLM calls — runs in thread pool via asyncio.to_thread.
    Agents are imported lazily so startup isn't blocked if models not loaded.
    """
    result: dict[str, Any] = {
        "predictions": [],
        "insights": [],
        "recommendations": [],
        "score_breakdown": _compute_breakdown(data),
    }

    # Each agent is wrapped in try/except so one failure doesn't kill the rest
    try:
        from agents.realtime_agent import realtime_analysis
        recs = realtime_analysis(data)
        result["recommendations"] = recs if isinstance(recs, list) else [str(recs)]
    except Exception as e:
        logger.warning("realtime_agent failed: %s", e)

    try:
        from agents.insight_agent import generate_insight
        insight = generate_insight(data)
        result["insights"] = _to_list(insight)
    except Exception as e:
        logger.warning("insight_agent failed: %s", e)

    try:
        from agents.prediction_agent import predict_future
        pred = predict_future(data)
        result["predictions"] = _to_list(pred)
    except Exception as e:
        logger.warning("prediction_agent failed: %s", e)

    return result


def _compute_breakdown(vitals: dict) -> dict:
    hr, spo2, bps, rr, hrv = (
        vitals.get("hr", 72),
        vitals.get("spo2", 98),
        vitals.get("bpS", 120),
        vitals.get("rr", 16),
        vitals.get("hrv", 42),
    )
    return {
        "heart":       20 if 60 <= hr  <= 100 else 10,
        "oxygen":      20 if spo2 >= 95        else 10,
        "stress":      20 if hrv  >= 40        else 10,
        "respiration": 20 if 12  <= rr  <= 20  else 10,
        "bp":          20 if bps  <= 120 else (15 if bps <= 130 else 10),
    }

def _to_list(val: Any) -> list:
    if isinstance(val, list):
        return [str(v) for v in val if v]
    s = str(val).strip()
    return [s] if s else []