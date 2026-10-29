from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from .config import get_settings

_client = None
_db: AsyncIOMotorDatabase | None = None


async def connect() -> None:
    """Connect once. Tests may pre-set `_db` (mongomock) and this only ensures indexes."""
    global _client, _db
    if _db is None:
        s = get_settings()
        _client = AsyncIOMotorClient(s.mongodb_uri, tz_aware=True, serverSelectionTimeoutMS=5000)
        _db = _client[s.mongodb_db]
    db = _db
    try:
        await db.users.create_index("email", unique=True)
        await db.inventory_items.create_index([("user_id", 1), ("client_id", 1)], unique=True)
        await db.inventory_items.create_index([("user_id", 1), ("server_updated_at", 1)])
        await db.consumption_logs.create_index([("user_id", 1), ("client_id", 1)], unique=True)
        await db.scans.create_index([("user_id", 1), ("client_scan_id", 1)], unique=True)
        await db.scans.create_index("created_at")
        await db.model_versions.create_index("version", unique=True)
    except Exception as e:
        import logging
        logging.getLogger("pantry").warning(f"Could not initialize MongoDB indexes on startup: {e}")


def get_db() -> AsyncIOMotorDatabase:
    assert _db is not None, "Database not connected"
    return _db


async def close() -> None:
    if _client is not None:
        _client.close()
