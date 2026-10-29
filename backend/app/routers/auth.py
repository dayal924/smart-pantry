from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
from pymongo.errors import DuplicateKeyError

from ..core.config import get_settings
from ..core.db import get_db
from ..core.security import decode_token, hash_password, make_token, verify_password
from ..schemas import LoginIn, RefreshIn, RegisterIn, TokenOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def user_out(u: dict) -> UserOut:
    return UserOut(id=str(u["_id"]), email=u["email"], name=u["name"], role=u.get("role", "user"), targets=u.get("targets") or {})


def tokens(u: dict) -> TokenOut:
    uid = str(u["_id"])
    role = u.get("role", "user")
    return TokenOut(access_token=make_token(uid, role, "access"), refresh_token=make_token(uid, role, "refresh"), user=user_out(u))


@router.post("/register", response_model=TokenOut, status_code=201)
async def register(body: RegisterIn):
    email = body.email.strip().lower()
    doc = {"email": email, "name": body.name.strip(), "password_hash": hash_password(body.password),
           "role": "admin" if email in get_settings().admin_email_set else "user",
           "targets": {}, "created_at": datetime.now(timezone.utc)}
    try:
        res = await get_db().users.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    doc["_id"] = res.inserted_id
    return tokens(doc)


@router.post("/login", response_model=TokenOut)
async def login(body: LoginIn):
    u = await get_db().users.find_one({"email": body.email.strip().lower()})
    if not u or not verify_password(body.password, u["password_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    return tokens(u)


@router.post("/refresh", response_model=TokenOut)
async def refresh(body: RefreshIn):
    payload = decode_token(body.refresh_token, "refresh")
    u = await get_db().users.find_one({"_id": ObjectId(payload["sub"])})
    if not u:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return tokens(u)
