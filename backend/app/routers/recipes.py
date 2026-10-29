from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from ..core.db import get_db
from ..core.deps import current_user
from ..services.catalog import recipes as all_recipes
from ..services.recipes import match_recipes

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("")
async def list_recipes(user: dict = Depends(current_user)):
    return all_recipes()  # the phone caches this for offline matching


@router.get("/match")
async def match(user: dict = Depends(current_user)):
    items = [d async for d in get_db().inventory_items.find({"user_id": user["id"], "status": "active", "deleted": {"$ne": True}})]
    return match_recipes([{"class_key": d["class_key"], "expires_at": d["expires_at"]} for d in items], datetime.now(timezone.utc))
