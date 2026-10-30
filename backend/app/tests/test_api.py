import asyncio
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient

from app.core import db as dbmod


@pytest.fixture()
def client(monkeypatch):
    dbmod._db = AsyncMongoMockClient(tz_aware=True)["test"]
    from app.main import app
    with TestClient(app) as c:
        yield c
    dbmod._db = None


def auth(client, email="a@b.co"):
    r = client.post("/auth/register", json={"email": email, "password": "password123", "name": "Asha"})
    assert r.status_code == 201, r.text
    return {"Authorization": "Bearer " + r.json()["access_token"]}


def iso(dt):
    return dt.isoformat().replace("+00:00", "Z")


def item(i, key="tomato", qty=3, days=1.0, updated=None):
    now = datetime.now(timezone.utc)
    return {"id": i, "class_key": key, "name": key.title(), "quantity": qty, "storage": "room", "added_at": iso(now), "anchor_at": iso(now),
            "life_used": 0, "expires_at": iso(now + timedelta(days=days)), "status": "active", "updated_at": iso(updated or now)}


def test_auth_flow(client):
    h = auth(client)
    assert client.post("/auth/register", json={"email": "a@b.co", "password": "password123", "name": "x"}).status_code == 409
    assert client.post("/auth/login", json={"email": "a@b.co", "password": "wrong-pass"}).status_code == 401
    assert client.get("/users/me", headers=h).json()["email"] == "a@b.co"
    assert client.get("/users/me").status_code == 401
    r = client.post("/auth/login", json={"email": "A@B.co", "password": "password123"}).json()
    assert client.post("/auth/refresh", json={"refresh_token": r["refresh_token"]}).status_code == 200
    assert client.post("/auth/refresh", json={"refresh_token": r["access_token"]}).status_code == 401


def test_sync_is_idempotent_and_last_write_wins(client):
    h = auth(client)
    now = datetime.now(timezone.utc)
    body = {"since": None, "items": [item("i1", qty=3, updated=now)], "logs": []}
    assert client.post("/inventory/sync", json=body, headers=h).status_code == 200
    client.post("/inventory/sync", json=body, headers=h)  # replay
    older = {"since": None, "items": [item("i1", qty=99, updated=now - timedelta(hours=1))], "logs": []}
    r = client.post("/inventory/sync", json=older, headers=h).json()
    assert len(r["items"]) == 1 and r["items"][0]["quantity"] == 3  # stale write ignored
    newer = {"since": None, "items": [item("i1", qty=1, updated=now + timedelta(minutes=1))], "logs": []}
    assert client.post("/inventory/sync", json=newer, headers=h).json()["items"][0]["quantity"] == 1
    # other user must not see it
    h2 = auth(client, "c@d.co")
    assert client.get("/inventory", headers=h2).json() == []


def test_recipes_and_urgency_boost(client):
    h = auth(client)
    items = [item("a", "eggplant", days=1), item("b", "onion", days=20), item("c", "tomato", days=1)]
    client.post("/inventory/sync", json={"items": items, "logs": []}, headers=h)
    m = client.get("/recipes/match", headers=h).json()
    top = m[0]
    assert top["id"] == "baingan-bharta" and top["overlap"] == 100 and "eggplant" in top["urgent_now"]
    assert top["rank_score"] > top["overlap"]


def test_copilot_rule_fallback_and_nutrition(client):
    h = auth(client)
    r = client.post("/copilot/chat", json={"message": "How do I store tomatoes?"}, headers=h).json()
    assert ("Tomato" in r["reply"] or "tomato" in r["reply"]) and ("provider" in r)
    r = client.post("/copilot/chat", json={"message": "what should I cook tonight", "inventory": [
        {"class_key": "cabbage", "quantity": 1, "days_left": 2}, {"class_key": "carrot", "quantity": 2, "days_left": 4}]}, headers=h).json()
    assert ("Cabbage" in r["reply"] or "cabbage" in r["reply"])
    assert client.get("/nutrition/daily", headers=h).json()["progress_pct"]["kcal"] == 0


def test_admin_guard_and_scan_log(client):
    h = auth(client)
    assert client.get("/admin/stats", headers=h).status_code == 403
    log = {"client_scan_id": "s1", "source": "device", "detector_version": "v1", "latency_ms": 420, "num_detections": 3,
           "items": [{"class_key": "apple", "quantity": 2, "confidence": 0.9, "corrected_from": "pear"}]}
    assert client.post("/scans/log", json=log, headers=h).status_code == 204
    assert client.post("/scans/log", json=log, headers=h).status_code == 204  # idempotent
    history_res = client.get("/scans/history", headers=h)
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 1
    assert history_res.json()[0]["client_scan_id"] == "s1"
    assert client.post("/scans/detect", files={"image": ("x.jpg", b"123", "image/jpeg")}, headers=h).status_code in (404, 405)  # no server-side detection
