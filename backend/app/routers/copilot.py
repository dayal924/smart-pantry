from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from ..core.db import get_db
from ..core.deps import current_user
from ..schemas import ChatIn
from ..services import copilot
from ..services.recipes import days_left

router = APIRouter(prefix="/copilot", tags=["copilot"])


@router.post("/chat")
async def chat(body: ChatIn, user: dict = Depends(current_user)):
    if body.inventory is not None:
        lines = [l.model_dump() for l in body.inventory]
    else:
        now = datetime.now(timezone.utc)
        docs = [d async for d in get_db().inventory_items.find({"user_id": user["id"], "status": "active", "deleted": {"$ne": True}})]
        lines = [{"class_key": d["class_key"], "name": d["name"], "quantity": d["quantity"], "storage": d["storage"],
                  "days_left": days_left(d["expires_at"], now)} for d in docs]
    return await copilot.chat(body.message, [h.model_dump() for h in body.history], lines)
