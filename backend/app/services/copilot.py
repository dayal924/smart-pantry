"""Pantry-grounded culinary copilot: Groq / Gemini / OpenRouter with multi-tier fallback."""
import logging
import re
from datetime import datetime, timedelta, timezone

import httpx

from ..core.config import get_settings
from .catalog import all_items, get_item, normalize_key
from .recipes import days_left, match_recipes

log = logging.getLogger("copilot")

SYSTEM = (
    "You are Pantry Copilot, a friendly zero-waste kitchen assistant. The user's live pantry is below. "
    "Prefer suggesting dishes that use items they already have, and prioritise items marked 'use now' or 'use soon'. "
    "For storage questions give a direct answer first, then one tip. "
    "If something is expired, say so and advise discarding when in doubt. Never invent pantry items.\n\n"
    "When suggesting or creating a recipe, ALWAYS format it cleanly as:\n"
    "**Recipe: [Recipe Name]**\n"
    "Prep time: [X] mins | Servings: [Y]\n"
    "Ingredients:\n"
    "- [Amount] [Ingredient Name]\n"
    "Instructions:\n"
    "1. [Step 1]\n"
    "2. [Step 2]\n"
    "3. [Step 3]\n\n"
    "PANTRY:\n{pantry}"
)


def pantry_context(lines: list[dict]) -> str:
    if not lines:
        return "(empty)"
    rows = []
    for l in sorted(lines, key=lambda x: x.get("days_left") if x.get("days_left") is not None else 99):
        d = l.get("days_left")
        tag = "EXPIRED" if d is not None and d < 0 else "use now" if d is not None and d <= 2 else "use soon" if d is not None and d <= 5 else "fresh"
        name = l.get("name") or get_item(l["class_key"])["display"]
        rows.append(f"- {name} x{l.get('quantity', 1):g} ({l.get('storage') or '?'}, {d if d is not None else '?'} days left, {tag})")
    return "\n".join(rows)


async def _openai_compat(url: str, key: str, model: str, system: str, history: list[dict], msg: str, extra_headers: dict | None = None) -> str:
    headers = {"Authorization": f"Bearer {key}"}
    if extra_headers:
        headers.update(extra_headers)
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(
            url,
            headers=headers,
            json={
                "model": model,
                "max_tokens": 600,
                "messages": [{"role": "system", "content": system}] + history + [{"role": "user", "content": msg}],
            },
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"].strip()


async def _gemini(system: str, history: list[dict], msg: str) -> str:
    s = get_settings()
    return await _openai_compat(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        s.gemini_api_key,
        s.gemini_model,
        system,
        history,
        msg,
    )


async def _openrouter(system: str, history: list[dict], msg: str) -> str:
    s = get_settings()
    return await _openai_compat(
        "https://openrouter.ai/api/v1/chat/completions",
        s.openrouter_api_key,
        s.openrouter_model,
        system,
        history,
        msg,
        extra_headers={"HTTP-Referer": "http://localhost:8000", "X-Title": "Smart Pantry"},
    )


async def _anthropic(system: str, history: list[dict], msg: str) -> str:
    s = get_settings()
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(
            "https://api.anthropic.com/v1/messages",
            headers={"x-api-key": s.anthropic_api_key, "anthropic-version": "2023-06-01"},
            json={
                "model": s.anthropic_model,
                "max_tokens": 600,
                "system": system,
                "messages": history + [{"role": "user", "content": msg}],
            },
        )
        r.raise_for_status()
        return "".join(b.get("text", "") for b in r.json()["content"]).strip()


def rule_based(msg: str, lines: list[dict]) -> str:
    m = msg.lower()
    now = datetime.now(timezone.utc)
    pantry = [
        {
            "class_key": l["class_key"],
            "expires_at": now + timedelta(days=(l["days_left"] if l.get("days_left") is not None else 10) - 0.5),
        }
        for l in lines
    ]
    if re.search(r"\b(store|keep|fridge|fresh|crisp|last|refrigerat)", m):
        for key, it in all_items().items():
            if key.replace("_", " ") in m or it["display"].lower() in m:
                sl = it["shelf_life_days"]
                return f"{it['emoji']} {it['display']}: about {sl['room']} days at room temperature, {sl['fridge']} in the fridge. {it['tip']}"
    if re.search(r"\b(expire|expiring|use first|urgent|soon|waste)", m):
        urgent = [l for l in lines if l.get("days_left") is not None and l["days_left"] <= 5]
        if not urgent:
            return "Nothing in your pantry is close to expiring right now. 🎉"
        urgent.sort(key=lambda l: l["days_left"])
        return "Use these first:\n" + "\n".join(
            f"• {l.get('name') or get_item(l['class_key'])['display']} - {l['days_left']} day(s) left"
            for l in urgent[:8]
        )
    if re.search(r"\b(cook|dinner|lunch|recipe|make|tonight|meal|eat)", m):
        top = [r for r in match_recipes(pantry, now, 3) if r["overlap"] > 0]
        if not top:
            return "I couldn't match your pantry to a recipe yet - scan a few more items and ask again."
        return "Here's what you can cook:\n" + "\n".join(
            f"• {r['title']} ({r['overlap']}% match"
            + (f", still need {', '.join(r['missing_names'])}" if r["missing_names"] else ", you have everything")
            + ")"
            for r in top
        )
    return "I can suggest meals from your pantry, tell you what to use first, or share storage tips (try: “How do I store tomatoes?”)."


async def chat(message: str, history: list[dict], lines: list[dict]) -> dict:
    s = get_settings()
    system = SYSTEM.format(pantry=pantry_context(lines))
    hist = [{"role": h["role"], "content": h["content"]} for h in history[-8:]]
    provider = s.llm_provider.lower().strip()

    # Cascade order: User selected provider first, then other available free AI backups
    providers_to_try: list[str] = []
    if provider in ("groq", "gemini", "openrouter", "openai", "anthropic"):
        providers_to_try.append(provider)

    for backup in ("gemini", "openrouter", "groq", "openai", "anthropic"):
        if backup not in providers_to_try:
            providers_to_try.append(backup)

    for p in providers_to_try:
        try:
            if p == "groq" and s.groq_api_key:
                reply = await _openai_compat(
                    "https://api.groq.com/openai/v1/chat/completions",
                    s.groq_api_key,
                    s.groq_model,
                    system,
                    hist,
                    message,
                )
                return {"reply": reply, "provider": "groq"}

            if p == "gemini" and s.gemini_api_key:
                reply = await _gemini(system, hist, message)
                return {"reply": reply, "provider": "gemini"}

            if p == "openrouter" and s.openrouter_api_key:
                reply = await _openrouter(system, hist, message)
                return {"reply": reply, "provider": "openrouter"}

            if p == "anthropic" and s.anthropic_api_key:
                reply = await _anthropic(system, hist, message)
                return {"reply": reply, "provider": "anthropic"}

            if p == "openai" and s.openai_api_key:
                reply = await _openai_compat(
                    "https://api.openai.com/v1/chat/completions",
                    s.openai_api_key,
                    s.openai_model,
                    system,
                    hist,
                    message,
                )
                return {"reply": reply, "provider": "openai"}
        except Exception as e:
            log.warning("Provider %s failed (%s), trying next fallback...", p, e)

    # Local rule-based fallback when all AI APIs are exhausted or offline
    return {"reply": rule_based(message, lines), "provider": "rules"}
