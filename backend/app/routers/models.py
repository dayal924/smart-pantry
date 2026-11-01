"""Model registry: phones poll /models/latest and download new ONNX versions over the air."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from ..core.config import get_settings
from ..core.db import get_db
from ..core.deps import current_user

router = APIRouter(prefix="/models", tags=["models"])


def model_dir(version: str) -> Path:
    p = Path(get_settings().storage_dir)
    if not p.is_absolute() and not p.exists():
        backend_p = Path(__file__).resolve().parent.parent.parent / get_settings().storage_dir
        if backend_p.exists():
            p = backend_p
    return p / "models" / version


def public(doc: dict) -> dict:
    return {k: doc[k] for k in ("version", "sha256", "md5", "size_bytes", "input_size", "num_classes", "labels", "notes", "created_at", "active") if k in doc} | {
        "download_url": f"/models/{doc['version']}/file"}


def file_hashes(path: Path) -> tuple[str, str]:
    sha, md5 = hashlib.sha256(), hashlib.md5()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            sha.update(chunk)
            md5.update(chunk)
    return sha.hexdigest(), md5.hexdigest()


@router.get("/latest")
async def latest(user: dict = Depends(current_user)):
    db = get_db()
    doc = await db.model_versions.find_one({"active": True})
    if not doc:
        # Check storage disk for published versions
        storage_base = Path(get_settings().storage_dir)
        if not storage_base.is_absolute() and not storage_base.exists():
            backend_p = Path(__file__).resolve().parent.parent.parent / get_settings().storage_dir
            if backend_p.exists():
                storage_base = backend_p
        models_root = storage_base / "models"
        if models_root.exists():
            candidates = sorted(
                [p for p in models_root.iterdir() if p.is_dir() and (p / "detector.onnx").exists()],
                key=lambda p: (p / "detector.onnx").stat().st_mtime,
                reverse=True,
            )
            if candidates:
                cand = candidates[0]
                version = cand.name
                onnx_file = cand / "detector.onnx"
                sha256, md5 = file_hashes(onnx_file)
                lbl_path = Path(__file__).resolve().parent.parent.parent.parent / "mobile/assets/model/labels.json"
                labels = json.loads(lbl_path.read_text())["names"] if lbl_path.exists() else []
                doc = {
                    "version": version,
                    "sha256": sha256,
                    "md5": md5,
                    "size_bytes": onnx_file.stat().st_size,
                    "input_size": 640,
                    "num_classes": len(labels) or 35,
                    "labels": labels,
                    "notes": "Published YOLOv8m-Seg production model",
                    "created_at": datetime.now(timezone.utc),
                    "active": True,
                }
                await db.model_versions.insert_one(doc)

    if not doc:
        raise HTTPException(404, "No active model registered")
    return public(doc)


@router.get("/{version}/file")
async def download(version: str, user: dict = Depends(current_user)):
    path = model_dir(version) / "detector.onnx"
    if "/" in version or ".." in version or not path.exists():
        raise HTTPException(404, "Model file not found")
    return FileResponse(path, media_type="application/octet-stream", filename=f"detector-{version}.onnx")


def file_hashes(path: Path) -> tuple[str, str]:
    sha, md5 = hashlib.sha256(), hashlib.md5()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            sha.update(chunk)
            md5.update(chunk)
    return sha.hexdigest(), md5.hexdigest()
