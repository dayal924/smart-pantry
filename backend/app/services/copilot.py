"""Pantry-grounded culinary copilot: Groq / Gemini / OpenRouter with multi-tier fallback."""
import logging
import re
from datetime import datetime, timedelta, timezone

import httpx

from ..core.config import get_settings
from .catalog import all_items, get_item, normalize_key
from .recipes import days_left, match_recipes

log = logging.getLogger("copilot")

GROQ_FALLBACK_MODELS = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-20b",
]

SYSTEM = (
    "You are Pantry Copilot, a friendly zero-waste kitchen assistant. The user's live pantry is below. "
    "Prefer suggesting dishes that use items they already have, and prioritise items marked 'use now' or 'use soon'. "
    "For storage questions give a direct answer first, then one tip. "
    "If something is expired, say so and advise discarding when in doubt. Never invent pantry items.\n\n"
    "FORMATTING RULES:\n"
    "- When creating or suggesting a recipe, ALWAYS format it cleanly as:\n"
    "**Recipe: [Recipe Name]**\n"
    "Prep time: [X] mins | Servings: [Y]\n\n"
    "Ingredients:\n"
    "- [Amount] [Ingredient Name]\n"
    "- [Amount] [Ingredient Name]\n\n"
    "Instructions:\n"
    "1. [Step 1]\n"
    "2. [Step 2]\n"
    "3. [Step 3]\n\n"
    "- Do NOT output raw asterisk clutter (e.g. avoid '**Instructions:**' or '***' inside text).\n"
    "- Use clean plain bullet points with '-' and numbered steps with '1.', '2.'.\n\n"
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


def _make_rule_recipe(name: str) -> str:
    n = name.lower()
    if "banana" in n:
        return (
            "**Recipe: Golden Banana Oat Pancakes**\n"
            "Prep time: 15 mins | Servings: 2\n\n"
            "Ingredients:\n"
            "- 2 ripe Bananas, mashed\n"
            "- 1 cup rolled oats\n"
            "- 1/2 cup milk or almond milk\n"
            "- 1 tbsp honey or maple syrup\n"
            "- 1/2 tsp cinnamon and pinch of salt\n"
            "- 1 tsp butter or coconut oil for skillet\n\n"
            "Instructions:\n"
            "1. Peel and mash ripe bananas in a bowl until smooth.\n"
            "2. Whisk in oats, milk, honey, cinnamon, and salt; let sit 2 minutes to thicken.\n"
            "3. Heat butter in a skillet over medium heat.\n"
            "4. Pour batter in 1/4 cup scoops. Cook 2-3 minutes until bubbly, flip and cook 2 minutes until golden.\n"
            "5. Stack on a plate, drizzle with honey or fresh fruit, and serve warm!"
        )
    if "apple" in n:
        return (
            "**Recipe: Warm Spiced Apple Oatmeal Bowl**\n"
            "Prep time: 12 mins | Servings: 2\n\n"
            "Ingredients:\n"
            "- 2 fresh Apples, diced\n"
            "- 1 cup rolled oats\n"
            "- 1.5 cups milk or water\n"
            "- 1 tbsp butter or coconut oil\n"
            "- 1 tbsp honey or brown sugar\n"
            "- 1/2 tsp ground cinnamon\n\n"
            "Instructions:\n"
            "1. In a small pot, simmer oats and milk over medium-low heat for 5 minutes until creamy.\n"
            "2. In a skillet, melt butter over medium heat. Sauté diced apples with cinnamon and honey for 4 minutes.\n"
            "3. Spoon warm oatmeal into bowls, top generously with spiced apples, and enjoy warm!"
        )
    if "mango" in n:
        return (
            "**Recipe: Tropical Mango Chia Parfait**\n"
            "Prep time: 10 mins | Servings: 2\n\n"
            "Ingredients:\n"
            "- 2 ripe Mangoes, peeled and diced\n"
            "- 1 cup Greek yogurt\n"
            "- 2 tbsp chia seeds or granola\n"
            "- 1 tbsp honey or lime juice\n\n"
            "Instructions:\n"
            "1. Dice one mango into chunks and blend the other into a smooth puree with honey.\n"
            "2. In serving glasses, spoon a layer of yogurt at the bottom.\n"
            "3. Add the fresh mango puree, then top with diced mango chunks.\n"
            "4. Sprinkle with chia seeds or crunchy granola and serve chilled!"
        )

    # General fruit vs vegetable
    is_fruit = any(f in n for f in ["fruit", "berry", "orange", "strawberry", "grape", "pineapple", "watermelon", "peach", "pear", "kiwi", "melon", "cherry"])
    if is_fruit:
        return (
            f"**Recipe: Fresh {name} Breakfast Bowl**\n"
            "Prep time: 10 mins | Servings: 2\n\n"
            "Ingredients:\n"
            f"- 2 cups fresh {name}, sliced\n"
            "- 1 cup Greek yogurt or oatmeal\n"
            "- 1 tbsp honey\n"
            "- 2 tbsp toasted nuts or seeds\n\n"
            "Instructions:\n"
            f"1. Wash and prepare fresh {name.lower()}.\n"
            "2. Spoon yogurt or warm oatmeal into serving bowls.\n"
            f"3. Arrange sliced {name.lower()} nicely on top.\n"
            "4. Drizzle with honey, sprinkle with nuts, and serve fresh!"
        )

    # Savory vegetable
    return (
        f"**Recipe: Farmhouse Sautéed {name} Skillet**\n"
        "Prep time: 15 mins | Servings: 2\n\n"
        "Ingredients:\n"
        f"- 2 fresh {name}s, washed and sliced\n"
        "- 1.5 tbsp olive oil or butter\n"
        "- 2 cloves garlic, minced\n"
        "- 1/2 tsp salt and black pepper\n"
        "- 1 pinch red chili flakes or fresh herbs\n\n"
        "Instructions:\n"
        f"1. Wash and cut {name.lower()} into uniform bite-sized pieces.\n"
        "2. Heat olive oil in a skillet over medium heat. Sauté garlic for 30 seconds until fragrant.\n"
        f"3. Add sliced {name.lower()} and cook for 7-9 minutes, tossing regularly until tender-crisp.\n"
        "4. Season with salt, pepper, and herbs to taste, and serve hot as a side or over rice!"
    )


def rule_based(msg: str, lines: list[dict]) -> str:
    m = msg.lower()
    now = datetime.now(timezone.utc)
    catalog = all_items()

    if re.search(r"\b(store|keep|fridge|fresh|crisp|last|refrigerat)", m):
        for key, it in catalog.items():
            if key.replace("_", " ") in m or it["display"].lower() in m:
                sl = it["shelf_life_days"]
                return f"**{it['emoji']} {it['display']} Storage Guide**\n\n• **Room Temp:** ~{sl['room']} days\n• **Fridge:** ~{sl['fridge']} days\n\n💡 **Tip:** {it['tip']}"

    if re.search(r"\b(expire|expiring|use first|urgent|soon|waste)", m):
        urgent = [l for l in lines if l.get("days_left") is not None and l["days_left"] <= 5]
        if not urgent:
            return "Nothing in your pantry is close to expiring right now. 🎉"
        urgent.sort(key=lambda l: l["days_left"])
        return "**Items to use first (avoid waste):**\n\n" + "\n".join(
            f"• **{l.get('name') or get_item(l['class_key'])['display']}** – {l['days_left']} day(s) left"
            for l in urgent[:8]
        )

    # User asks for a recipe or cooking instructions
    if re.search(r"\b(recipe|cook|make|dish|bake|instructions|ingredients|prepare|using:?)", m):
        # Did the user mention a specific ingredient?
        for key, it in catalog.items():
            if key.replace("_", " ") in m or it["display"].lower() in m:
                return _make_rule_recipe(it["display"])

        # Check user's pantry lines
        for l in lines:
            p_name = l.get("name") or get_item(l["class_key"])["display"]
            if p_name.lower() in m:
                return _make_rule_recipe(p_name)

        # If pantry has items, make a medley recipe
        if lines:
            top_names = [l.get("name") or get_item(l["class_key"])["display"] for l in lines[:2]]
            title = " & ".join(top_names)
            return (
                f"**Recipe: Fresh {title} Harvest Medley**\n"
                "Prep time: 15 mins | Servings: 2\n\n"
                "Ingredients:\n"
                + "\n".join(f"- 1 {name}" for name in top_names)
                + "\n- 1 tbsp olive oil or butter\n"
                "- 1 pinch sea salt and freshly cracked pepper\n\n"
                "Instructions:\n"
                f"1. Wash and prepare the {' and '.join(n.lower() for n in top_names)}.\n"
                "2. Warm a pan over medium heat with oil or butter.\n"
                "3. Sauté ingredients for 6-8 minutes until tender and fragrant.\n"
                "4. Season with salt and pepper to taste, and serve fresh!"
            )

    # Recipe match fallback
    pantry = [
        {
            "class_key": l["class_key"],
            "expires_at": now + timedelta(days=(l["days_left"] if l.get("days_left") is not None else 10) - 0.5),
        }
        for l in lines
    ]
    top = [r for r in match_recipes(pantry, now, 3) if r["overlap"] > 0]
    if top:
        return "**Here's what you can cook from your pantry:**\n\n" + "\n".join(
            f"• **{r['title']}** ({r['overlap']}% match"
            + (f", still need {', '.join(r['missing_names'])}" if r["missing_names"] else ", ready to cook!")
            + ")"
            for r in top
        )

    return (
        "**I can help you with:**\n\n"
        "• **Custom recipes:** e.g. “Tell me a recipe using Banana”\n"
        "• **Pantry ideas:** “What should I cook tonight?”\n"
        "• **Storage tips:** “How do I store Tomatoes?”"
    )


async def chat(message: str, history: list[dict], lines: list[dict]) -> dict:
    s = get_settings()
    system = SYSTEM.format(pantry=pantry_context(lines))
    hist = [{"role": h["role"], "content": h["content"]} for h in history[-8:]]
    provider = s.llm_provider.lower().strip()

    # Cascade order: User selected provider first, then other available free AI backups
    providers_to_try: list[str] = []
    if provider in ("groq", "gemini", "openrouter", "openai", "anthropic"):
        providers_to_try.append(provider)

    for backup in ("groq", "gemini", "openrouter", "openai", "anthropic"):
        if backup not in providers_to_try:
            providers_to_try.append(backup)

    for p in providers_to_try:
        try:
            if p == "groq" and s.groq_api_key:
                groq_models = [s.groq_model] + [m for m in GROQ_FALLBACK_MODELS if m != s.groq_model]
                for gm in groq_models:
                    try:
                        reply = await _openai_compat(
                            "https://api.groq.com/openai/v1/chat/completions",
                            s.groq_api_key,
                            gm,
                            system,
                            hist,
                            message,
                        )
                        return {"reply": reply, "provider": f"groq ({gm})"}
                    except Exception as ge:
                        log.warning("Groq model %s failed (%s), trying backup Groq model...", gm, ge)

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
