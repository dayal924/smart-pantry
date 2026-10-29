from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from ..core.db import get_db
from ..core.deps import current_user
from ..schemas import ScanLogIn

router = APIRouter(prefix="/scans", tags=["scans"])


@router.post("/log", status_code=204)
async def log_scan(body: ScanLogIn, user: dict = Depends(current_user)):
    """Called AFTER the user confirms a scan (detection itself happens only on the phone).
    Idempotent telemetry + user corrections = free labelled data for the next training round."""
    doc = body.model_dump()
    doc.update(user_id=user["id"], created_at=body.created_at or datetime.now(timezone.utc),
               corrections=sum(1 for i in body.items if i.corrected_from))
    await get_db().scans.update_one({"user_id": user["id"], "client_scan_id": body.client_scan_id}, {"$setOnInsert": doc}, upsert=True)


@router.get("/history")
async def scan_history(limit: int = 50, user: dict = Depends(current_user)):
    """Retrieve scan history for the authenticated user, sorted latest first."""
    docs = get_db().scans.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(limit)
    out = []
    async for d in docs:
        if isinstance(d.get("created_at"), datetime):
            d["created_at"] = d["created_at"].isoformat()
        out.append(d)
    return out

