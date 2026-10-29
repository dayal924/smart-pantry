from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from pymongo.errors import DuplicateKeyError

from ..core.db import get_db
from ..core.deps import current_user
from ..schemas import InventoryItem, SyncIn, SyncOut
from ..services.catalog import get_item
from ..services.recipes import _to_utc

router = APIRouter(prefix="/inventory", tags=["inventory"])


def to_item(doc: dict) -> InventoryItem:
    d = {k: v for k, v in doc.items() if k not in ("_id", "user_id", "client_id", "server_updated_at")}
    return InventoryItem(id=doc["client_id"], **d)


@router.get("", response_model=list[InventoryItem])
async def list_items(status: str | None = "active", user: dict = Depends(current_user)):
    q = {"user_id": user["id"], "deleted": {"$ne": True}}
    if status:
        q["status"] = status
    return [to_item(d) async for d in get_db().inventory_items.find(q).sort("expires_at", 1)]


@router.post("/sync", response_model=SyncOut)
async def sync(body: SyncIn, user: dict = Depends(current_user)):
    """Offline-first sync. Phone pushes its dirty rows; server applies last-write-wins on `updated_at`
    and returns rows changed on the server since `since` (other devices)."""
    db = get_db()
    uid = user["id"]
    now = datetime.now(timezone.utc)
    for it in body.items:
        data = it.model_dump()
        cid = data.pop("id")
        existing = await db.inventory_items.find_one({"user_id": uid, "client_id": cid}, {"updated_at": 1})
        doc = {**data, "user_id": uid, "client_id": cid, "server_updated_at": now}
        if existing is None:
            try:
                await db.inventory_items.insert_one(doc)
            except DuplicateKeyError:
                pass
        elif _to_utc(it.updated_at) > _to_utc(existing["updated_at"]):
            await db.inventory_items.update_one({"user_id": uid, "client_id": cid}, {"$set": doc})
    for lg in body.logs:
        data = lg.model_dump()
        cid = data.pop("id")
        try:
            await db.consumption_logs.insert_one({**data, "user_id": uid, "client_id": cid})
        except DuplicateKeyError:
            pass
    q: dict = {"user_id": uid}
    if body.since:
        q["server_updated_at"] = {"$gt": body.since}
    out = [to_item(d) async for d in db.inventory_items.find(q)]
    return SyncOut(items=out, server_time=now)


@router.get("/stats/waste")
async def waste(days: int = 30, user: dict = Depends(current_user)):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    agg = {"consumed": {"items": 0.0, "grams": 0.0}, "discarded": {"items": 0.0, "grams": 0.0}}
    async for d in get_db().inventory_items.find({"user_id": user["id"], "status": {"$in": ["consumed", "discarded"]}, "closed_at": {"$gte": since}}):
        a = agg[d["status"]]
        a["items"] += d["quantity"]
        a["grams"] += d["quantity"] * get_item(d["class_key"])["grams_per_item"]
    total = agg["consumed"]["grams"] + agg["discarded"]["grams"]
    agg["waste_rate_pct"] = round(100 * agg["discarded"]["grams"] / total, 1) if total else 0.0
    return agg
