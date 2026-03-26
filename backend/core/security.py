"""
security.py — bcrypt hashing + JWT token auth
Replaces plain-text password comparison in routes.py
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, WebSocket
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "CHANGE_ME_USE_ENV_VAR"          # os.environ["JWT_SECRET"]
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24          # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


# ── Password hashing ──────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=12)).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# ── FastAPI dependency ────────────────────────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    return decode_token(token)

def get_current_user_id(current: dict = Depends(get_current_user)) -> int:
    return int(current["sub"])


# ── WebSocket token auth (query param: ?token=...) ───────────────────────────

async def ws_auth(websocket: WebSocket) -> int:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)
        raise HTTPException(status_code=401, detail="Missing token")
    payload = decode_token(token)
    return int(payload["sub"])