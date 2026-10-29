import json
import re
from functools import lru_cache
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"
GENERIC = {
    "display": None, "emoji": "🥗", "category": "produce",
    "shelf_life_days": {"room": 5, "fridge": 10}, "default_storage": "fridge", "grams_per_item": 150,
    "nutrition_per_100g": {"kcal": 40, "carbs_g": 9, "fiber_g": 2, "vitamin_c_mg": 15, "protein_g": 1}, "tip": "",
}


@lru_cache
def _raw() -> dict:
    return json.loads((DATA / "produce_catalog.json").read_text())


def normalize_key(label: str) -> str:
    """Must match mobile/src/domain/catalog.ts normalizeKey()."""
    k = re.sub(r"[^a-z0-9]+", "_", label.lower()).strip("_")
    return _raw()["aliases"].get(k, k)


def get_item(key: str) -> dict:
    k = normalize_key(key)
    item = _raw()["items"].get(k)
    if item:
        return {"key": k, **item}
    return {"key": k, **GENERIC, "display": k.replace("_", " ").title()}


def all_items() -> dict:
    return _raw()["items"]


@lru_cache
def recipes() -> list[dict]:
    return json.loads((DATA / "recipes.json").read_text())


def nutrients_for(key: str, grams: float) -> dict[str, float]:
    n = get_item(key)["nutrition_per_100g"]
    return {k: round(v * grams / 100.0, 2) for k, v in n.items()}
