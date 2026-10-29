from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Targets(BaseModel):
    kcal: float = 2000
    carbs_g: float = 250
    fiber_g: float = 28
    vitamin_c_mg: float = 90
    protein_g: float = 50


class RegisterIn(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=80)


class LoginIn(BaseModel):
    email: str
    password: str


class RefreshIn(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str
    targets: Targets = Targets()


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class ProfilePatch(BaseModel):
    name: str | None = None
    targets: Targets | None = None


class PushTokenIn(BaseModel):
    token: str
    platform: str = "unknown"


Storage = Literal["room", "fridge"]
Status = Literal["active", "consumed", "discarded"]


class InventoryItem(BaseModel):
    id: str  # client-generated uuid -> idempotent offline sync
    class_key: str
    name: str
    emoji: str | None = None
    quantity: float = Field(ge=0)
    storage: Storage
    added_at: datetime
    anchor_at: datetime
    life_used: float = 0
    expires_at: datetime
    status: Status = "active"
    closed_at: datetime | None = None
    source: str = "scan"
    scan_id: str | None = None
    updated_at: datetime
    deleted: bool = False


class ConsumptionLog(BaseModel):
    id: str
    item_id: str | None = None
    class_key: str
    grams: float
    kind: Literal["consumed", "recipe"] = "consumed"
    nutrients: dict[str, float] = {}
    date: datetime


class SyncIn(BaseModel):
    since: datetime | None = None
    items: list[InventoryItem] = []
    logs: list[ConsumptionLog] = []


class SyncOut(BaseModel):
    items: list[InventoryItem]
    server_time: datetime


class ScanLogItem(BaseModel):
    class_key: str
    quantity: int = 1
    confidence: float | None = None
    corrected_from: str | None = None  # user override -> labelled data for retraining


class ScanLogIn(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    client_scan_id: str
    source: Literal["device"] = "device"
    detector_version: str
    latency_ms: float
    timings: dict[str, float] = {}
    num_detections: int = 0
    items: list[ScanLogItem] = []
    platform: str | None = None
    created_at: datetime | None = None


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class PantryLine(BaseModel):
    class_key: str
    name: str | None = None
    quantity: float = 1
    days_left: int | None = None
    storage: Storage | None = None


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatTurn] = []
    inventory: list[PantryLine] | None = None  # live (possibly unsynced) pantry from the phone


class FeedbackIn(BaseModel):
    kind: Literal["scan", "recipe", "copilot", "app"] = "app"
    rating: int | None = Field(default=None, ge=1, le=5)
    message: str = Field(default="", max_length=2000)
    scan_id: str | None = None


class AnnouncementIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=1000)
    push: bool = True
