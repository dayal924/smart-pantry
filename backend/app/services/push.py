import httpx

EXPO_PUSH = "https://exp.host/--/api/v2/push/send"


async def send_expo_push(tokens: list[str], title: str, body: str) -> int:
    sent = 0
    async with httpx.AsyncClient(timeout=20) as c:
        for i in range(0, len(tokens), 100):
            batch = [{"to": t, "title": title, "body": body, "sound": "default"} for t in tokens[i:i + 100] if t.startswith("ExponentPushToken")]
            if not batch:
                continue
            try:
                r = await c.post(EXPO_PUSH, json=batch)
                r.raise_for_status()
                sent += len(batch)
            except Exception:
                pass
    return sent
