"""Model registry: phones poll /models/latest and download new ONNX versions over the air."""
import hashlib
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from ..core.config import get_settings
from ..core.db import get_db
from ..core.deps import current_user

router = APIRouter(prefix="/models", tags=["models"])


def model_dir(version: str) -> Path:
    return Path(get_settings().storage_dir) / "models" / version


def public(doc: dict) -> dict:
    return {k: doc[k] for k in ("version", "sha256", "md5", "size_bytes", "input_size", "num_classes", "labels", "notes", "created_at", "active") if k in doc} | {
        "download_url": f"/models/{doc['version']}/file"}


@router.get("/latest")
async def latest(user: dict = Depends(current_user)):
    doc = await get_db().model_versions.find_one({"active": True})
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
