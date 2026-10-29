"""Pantry <-> recipe matching with urgency boost. Mirrors mobile/src/domain/recipeMatch.ts."""
import math
from datetime import datetime, timezone

from .catalog import get_item, normalize_key, recipes

DAY = 86400.0


def _to_utc(dt: datetime | str) -> datetime:
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def days_left(expires_at: datetime | str, now: datetime | str) -> int:
    exp = _to_utc(expires_at)
    nw = _to_utc(now)
    return math.ceil((exp - nw).total_seconds() / DAY)


def urgency(expires_at: datetime | str, now: datetime | str) -> str:
    exp = _to_utc(expires_at)
    nw = _to_utc(now)
    if nw > exp:
        return "expired"
    d = days_left(exp, nw)
    return "use_now" if d <= 2 else "use_soon" if d <= 5 else "fresh_later"


def match_recipes(pantry: list[dict], now: datetime | None = None, limit: int = 20) -> list[dict]:
    """pantry: [{class_key, expires_at(datetime)}] (active, non-expired items only count as 'have')."""
    now = now or datetime.now(timezone.utc)
    stock: dict[str, str] = {}  # key -> most urgent bucket among its batches
    rank = {"use_now": 0, "use_soon": 1, "fresh_later": 2}
    for p in pantry:
        u = urgency(p["expires_at"], now)
        if u == "expired":
            continue
        k = normalize_key(p["class_key"])
        if k not in stock or rank[u] < rank[stock[k]]:
            stock[k] = u
    out = []
    for r in recipes():
        req = [i for i in r["ingredients"] if not i["optional"]]
        if not req:
            continue
        have = [i["key"] for i in req if i["key"] in stock]
        missing = [i["key"] for i in req if i["key"] not in stock]
        opt_have = [i["key"] for i in r["ingredients"] if i["optional"] and i["key"] in stock]
        overlap = round(100 * len(have) / len(req))
        urgent_now = [k for k in have + opt_have if stock[k] == "use_now"]
        urgent_soon = [k for k in have + opt_have if stock[k] == "use_soon"]
        boost = min(30, 12 * len(urgent_now) + 6 * len(urgent_soon))
        out.append({
            "id": r["id"], "title": r["title"], "time_min": r["time_min"], "servings": r["servings"],
            "overlap": overlap, "rank_score": overlap + (boost if have else 0),
            "have": have, "missing": missing, "optional_have": opt_have,
            "urgent_now": urgent_now, "urgent_soon": urgent_soon,
            "missing_names": [get_item(k)["display"] for k in missing],
            "staples": r["staples"], "steps": r["steps"],
        })
    out.sort(key=lambda m: (-m["rank_score"], -m["overlap"], m["time_min"]))
    return out[:limit]
