import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core import db
from .core.config import get_settings
from .routers import admin, auth, copilot, inventory, models, nutrition, recipes, scans, users

log = logging.getLogger("pantry")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.close()


app = FastAPI(title="Smart Pantry API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=get_settings().cors_origins.split(","), allow_methods=["*"], allow_headers=["*"])
for r in (auth, users, scans, inventory, nutrition, recipes, copilot, models, admin):
    app.include_router(r.router)


@app.get("/health")
async def health():
    return {"ok": True}
