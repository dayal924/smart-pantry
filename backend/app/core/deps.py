from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .db import get_db
from .security import decode_token

bearer = HTTPBearer(auto_error=False)


async def current_user(cred: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if cred is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    payload = decode_token(cred.credentials, "access")
    try:
        user = await get_db().users.find_one({"_id": ObjectId(payload["sub"])})
    except Exception:
        user = None
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    user["id"] = str(user["_id"])
    return user


async def admin_user(user: dict = Depends(current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin only")
    return user
