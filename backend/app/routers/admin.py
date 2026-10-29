import shutil
import statistics
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from ..core.db import get_db
from ..core.deps import admin_user, current_user
from ..schemas import AnnouncementIn, FeedbackIn
from ..services.detector import DetectorService
from ..services.push import send_expo_push
from .models import file_hashes, model_dir, public

router = APIRouter(tags=["admin"])


# ---- announcements & feedback (users) -------------------------------------------------
@router.get("/announcements")
async def announcements(user: dict = Depends(current_user)):
    docs = get_db().announcements.find({}, {"_id": 0}).sort("created_at", -1).limit(20)
    return [d async for d in docs]


@router.post("/feedback", status_code=201)
async def feedback(body: FeedbackIn, user: dict = Depends(current_user)):
    await get_db().feedback.insert_one({**body.model_dump(), "user_id": user["id"], "email": user["email"], "created_at": datetime.now(timezone.utc)})
    return {"ok": True}


# ---- admin ----------------------------------------------------------------------------
@router.post("/admin/announcements", status_code=201)
async def create_announcement(body: AnnouncementIn, admin: dict = Depends(admin_user)):
    db = get_db()
    await db.announcements.insert_one({"title": body.title, "body": body.body, "created_at": datetime.now(timezone.utc), "by": admin["email"]})
    sent = 0
    if body.push:
        tokens = [u["push_token"] async for u in db.users.find({"push_token": {"$exists": True}}, {"push_token": 1})]
        sent = await send_expo_push(tokens, body.title, body.body)
    return {"ok": True, "pushed": sent}


@router.get("/admin/feedback")
async def list_feedback(limit: int = 100, admin: dict = Depends(admin_user)):
    return [{**d, "_id": str(d["_id"])} async for d in get_db().feedback.find().sort("created_at", -1).limit(limit)]


@router.get("/admin/stats")
async def stats(days: int = 7, admin: dict = Depends(admin_user)):
    db = get_db()
    since = datetime.now(timezone.utc) - timedelta(days=days)
    recent = [d async for d in db.scans.find({"created_at": {"$gte": since}}, {"latency_ms": 1, "source": 1, "corrections": 1, "num_detections": 1, "detector_version": 1}).limit(5000)]
    lat: dict[str, list[float]] = {"device": [], "cloud": []}
    for s in recent:
        src = s.get("source") or "device"
        lat.setdefault(src, []).append(s.get("latency_ms", 0.0))

    def pct(v, p):
        return round(statistics.quantiles(v, n=100)[p - 1], 1) if len(v) >= 2 else (round(v[0], 1) if v else None)

    total_dets = sum(s.get("num_detections", 0) for s in recent)
    total_corr = sum(s.get("corrections", 0) for s in recent)
    versions: dict[str, int] = {}
    for s in recent:
        versions[s["detector_version"]] = versions.get(s["detector_version"], 0) + 1
    return {
        "window_days": days,
        "users": await db.users.count_documents({}),
        "scans": len(recent),
        "inventory_active": await db.inventory_items.count_documents({"status": "active"}),
        "inventory_consumed": await db.inventory_items.count_documents({"status": "consumed"}),
        "inventory_discarded": await db.inventory_items.count_documents({"status": "discarded"}),
        "latency_ms": {k: {"count": len(v), "p50": pct(v, 50), "p95": pct(v, 95)} for k, v in lat.items()},
        "correction_rate_pct": round(100 * total_corr / total_dets, 1) if total_dets else None,
        "scans_by_detector_version": versions,
        "feedback_count": await db.feedback.count_documents({}),
    }


@router.get("/admin/models")
async def list_models(admin: dict = Depends(admin_user)):
    return [public(d) async for d in get_db().model_versions.find().sort("created_at", -1)]


@router.post("/admin/models", status_code=201)
async def upload_model(version: str = Form(..., pattern=r"^[A-Za-z0-9._-]{1,40}$"), notes: str = Form(""), file: UploadFile = File(...),
                       admin: dict = Depends(admin_user)):
    """Upload detector.onnx (class names are read from the ONNX metadata Ultralytics embeds)."""
    db = get_db()
    if await db.model_versions.find_one({"version": version}):
        raise HTTPException(409, "Version already exists")
    d = model_dir(version)
    d.mkdir(parents=True, exist_ok=True)
    path = d / "detector.onnx"
    with path.open("wb") as out:
        shutil.copyfileobj(file.file, out)
    probe = DetectorService()
    try:
        probe.load(path, version)  # validates the model and extracts labels
    except Exception as e:
        shutil.rmtree(d, ignore_errors=True)
        raise HTTPException(400, f"Invalid ONNX detector: {e}")
    sha, md5 = file_hashes(path)
    doc = {"version": version, "sha256": sha, "md5": md5, "size_bytes": path.stat().st_size, "input_size": probe.size,
           "num_classes": len(probe.names), "labels": probe.names, "notes": notes, "active": False, "created_at": datetime.now(timezone.utc)}
    await db.model_versions.insert_one(doc)
    return public(doc)


@router.post("/admin/models/{version}/activate")
async def activate_model(version: str, admin: dict = Depends(admin_user)):
    db = get_db()
    doc = await db.model_versions.find_one({"version": version})
    if not doc:
        raise HTTPException(404, "Unknown version")
    await db.model_versions.update_many({}, {"$set": {"active": False}})
    await db.model_versions.update_one({"version": version}, {"$set": {"active": True}})
    return {"ok": True, "active": version}
