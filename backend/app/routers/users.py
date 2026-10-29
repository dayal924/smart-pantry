from fastapi import APIRouter, Depends

from ..core.db import get_db
from ..core.deps import current_user
from ..schemas import ProfilePatch, PushTokenIn, UserOut
from .auth import user_out

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(current_user)):
    return user_out(user)


@router.patch("/me", response_model=UserOut)
async def update_me(body: ProfilePatch, user: dict = Depends(current_user)):
    patch = {}
    if body.name:
        patch["name"] = body.name.strip()
    if body.targets:
        patch["targets"] = body.targets.model_dump()
    if patch:
        await get_db().users.update_one({"_id": user["_id"]}, {"$set": patch})
        user = {**user, **patch}
    return user_out(user)


@router.put("/me/push-token", status_code=204)
async def push_token(body: PushTokenIn, user: dict = Depends(current_user)):
    await get_db().users.update_one({"_id": user["_id"]}, {"$set": {"push_token": body.token, "push_platform": body.platform}})
