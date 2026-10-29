import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import HTTPException, status

from .config import get_settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode()[:72], bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode()[:72], hashed.encode())
    except ValueError:
        return False


def make_token(user_id: str, role: str, kind: str) -> str:
    s = get_settings()
    ttl = timedelta(minutes=s.access_ttl_min) if kind == "access" else timedelta(days=s.refresh_ttl_days)
    now = datetime.now(timezone.utc)
    payload = {"sub": user_id, "role": role, "type": kind, "iat": now, "exp": now + ttl, "jti": uuid.uuid4().hex}
    return jwt.encode(payload, s.jwt_secret, algorithm=s.jwt_alg)


def decode_token(token: str, kind: str) -> dict:
    s = get_settings()
    try:
        payload = jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_alg])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    if payload.get("type") != kind:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Wrong token type")
    return payload
