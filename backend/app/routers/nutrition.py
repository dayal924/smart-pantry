from datetime import datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends

from ..core.db import get_db
from ..core.deps import current_user
from ..schemas import Targets
from ..services.catalog import nutrients_for

router = APIRouter(prefix="/nutrition", tags=["nutrition"])
KEYS = ["kcal", "carbs_g", "fiber_g", "vitamin_c_mg", "protein_g"]


@router.get("/pantry")
async def pantry_summary(user: dict = Depends(current_user)):
    total = dict.fromkeys(KEYS, 0.0)
    from ..services.catalog import get_item
    async for d in get_db().inventory_items.find({"user_id": user["id"], "status": "active", "deleted": {"$ne": True}}):
        n = nutrients_for(d["class_key"], d["quantity"] * get_item(d["class_key"])["grams_per_item"])
        for k in KEYS:
            total[k] += n[k]
    return {k: round(v, 1) for k, v in total.items()}


@router.get("/daily")
async def daily(date: str | None = None, user: dict = Depends(current_user)):
    day = datetime.fromisoformat(date).date() if date else datetime.now(timezone.utc).date()
    start = datetime.combine(day, time.min, tzinfo=timezone.utc)
    total = dict.fromkeys(KEYS, 0.0)
    async for d in get_db().consumption_logs.find({"user_id": user["id"], "date": {"$gte": start, "$lt": start + timedelta(days=1)}}):
        for k in KEYS:
            total[k] += d.get("nutrients", {}).get(k, 0.0)
    targets = Targets(**(user.get("targets") or {})).model_dump()
    return {"date": day.isoformat(), "totals": {k: round(v, 1) for k, v in total.items()}, "targets": targets,
            "progress_pct": {k: round(100 * total[k] / targets[k]) if targets[k] else 0 for k in KEYS}}
