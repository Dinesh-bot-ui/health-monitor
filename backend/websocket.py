"""
websocket.py — production-grade real-time pipeline

Improvements over original:
  1. JWT auth on connect (no anonymous access)
  2. Real user_id from token (not hardcoded 1)
  3. Async DB writes (non-blocking)
  4. Two-tier AI: rule-based every tick, LLM every 60s in background
  5. ConnectionManager tracks all active connections
  6. Structured error handling with WS close codes
  7. DB write failure no longer kills the WS loop
"""
from __future__ import annotations

import asyncio
import logging
from typing import Dict

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import AsyncSessionLocal
from core.security import ws_auth
from models import VitalSigns
from simulator import generate_vital_data
from core.orchestrator import AIState, fast_pipeline, slow_pipeline

logger = logging.getLogger(__name__)

SEND_INTERVAL = 2          # seconds between WS ticks


# ── Connection Manager ────────────────────────────────────────────────────────

class ConnectionManager:
    def __init__(self) -> None:
        # user_id → WebSocket (one active connection per user)
        self._connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, ws: WebSocket) -> None:
        # Disconnect existing session for this user if any
        if user_id in self._connections:
            try:
                await self._connections[user_id].close(code=4000)
            except Exception:
                pass
        await ws.accept()
        self._connections[user_id] = ws
        logger.info("WS connected: user_id=%d  active=%d", user_id, len(self._connections))

    def disconnect(self, user_id: int) -> None:
        self._connections.pop(user_id, None)
        logger.info("WS disconnected: user_id=%d  active=%d", user_id, len(self._connections))

    @property
    def active_count(self) -> int:
        return len(self._connections)


manager = ConnectionManager()


# ── Async DB write ────────────────────────────────────────────────────────────

async def _save_vitals(user_id: int, data: dict) -> None:
    """Fire-and-forget async DB write. Failure is logged, never propagated."""
    try:
        async with AsyncSessionLocal() as session:
            session.add(VitalSigns(
                user_id=user_id,
                heart_rate=data["heart_rate"],
                systolic_bp=data["systolic_bp"],
                diastolic_bp=data["diastolic_bp"],
                spo2=data["spo2"],
                temperature=data["temperature"],
            ))
            await session.commit()
    except Exception as exc:
        logger.error("DB write failed for user_id=%d: %s", user_id, exc)


# ── Main endpoint ─────────────────────────────────────────────────────────────

async def websocket_endpoint(websocket: WebSocket) -> None:
    # Authenticate before accepting
    try:
        user_id = await ws_auth(websocket)
    except Exception:
        return  # ws_auth already closed the socket

    await manager.connect(user_id, websocket)

    # Per-connection AI state cache (refreshes every 60s)
    ai_state = AIState()

    try:
        while True:
            # ── Tier-1: fast vitals + rules (<1ms) ──────────────────────────
            vitals = generate_vital_data()
            fast   = fast_pipeline(vitals)

            # ── Async DB write (non-blocking, runs concurrently) ─────────────
            asyncio.create_task(_save_vitals(user_id, vitals))

            # ── Tier-2: trigger LLM refresh if stale (non-blocking) ──────────
            asyncio.create_task(slow_pipeline(vitals, ai_state))

            # ── Payload assembly ─────────────────────────────────────────────
            payload = {
                "vitals": vitals,
                "health_score": fast["score"],
                "status":       fast["status"],
                "risk":         fast["risk"],
                "alerts":       fast["alerts"],
                "ai": {
                    "alerts":          fast["alerts"],
                    "predictions":     ai_state.predictions,
                    "insights":        ai_state.insights,
                    "recommendations": ai_state.recommendations,
                    "score_breakdown": ai_state.score_breakdown,
                },
            }

            await websocket.send_json(payload)
            await asyncio.sleep(SEND_INTERVAL)

    except WebSocketDisconnect:
        logger.info("WS normal disconnect: user_id=%d", user_id)
    except Exception as exc:
        logger.error("WS error for user_id=%d: %s", user_id, exc)
    finally:
        manager.disconnect(user_id)