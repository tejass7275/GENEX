"""AI-generated-media screening.

AI_PROVIDER=mock              deterministic fake score (development)
AI_PROVIDER=reality_defender  Reality Defender REST API. Check the endpoint names and
                              the score scale against their current docs before production.
"""
import hashlib
import time

import httpx

from app.core.config import settings


def label_for(score: float) -> str:
    if score < 0.3:
        return "Authentic"
    if score < 0.6:
        return "Uncertain"
    if score < 0.8:
        return "Possibly manipulated"
    return "AI-generated"


def _mock(path: str) -> float:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return int(h.hexdigest()[:8], 16) / 0xFFFFFFFF


def _reality_defender(path: str) -> float:
    base = settings.reality_defender_base_url
    headers = {"X-API-KEY": settings.reality_defender_api_key}
    name = path.replace("\\", "/").split("/")[-1]

    r = httpx.post(f"{base}/api/files/aws-presigned", json={"fileName": name}, headers=headers, timeout=60)
    r.raise_for_status()
    data = r.json()
    signed_url = data["response"]["signedUrl"]
    request_id = data["requestId"]

    with open(path, "rb") as f:
        put = httpx.put(signed_url, content=f.read(), timeout=300)
    put.raise_for_status()

    for _ in range(60):  # up to ~5 minutes
        res = httpx.get(f"{base}/api/media/users/{request_id}", headers=headers, timeout=60)
        res.raise_for_status()
        summary = res.json().get("resultsSummary", {})
        final = summary.get("metadata", {}).get("finalScore")
        if final is not None:
            return max(0.0, min(1.0, float(final) / 100.0))  # API reports 0-100
        time.sleep(5)
    raise TimeoutError("Reality Defender did not return a result in time")


def score_media(path: str) -> float:
    if settings.ai_provider == "reality_defender":
        return _reality_defender(path)
    return _mock(path)

