"""Thin HTTP client for the Node web3-service. With WEB3_MOCK=true it returns
deterministic fake responses so the backend can be developed without it."""
import hashlib
import json

import httpx

from app.core.config import settings


def _mock(path: str, payload: dict) -> dict:
    digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
    if path == "/wallet":
        return {"address": "0x" + digest[:40]}
    if path == "/irys/upload":
        return {"id": "mock" + digest[:40]}
    if path == "/anchor":
        return {"txHash": "0x" + digest}
    if path == "/anchor/verify":
        return {"anchored": True}
    raise ValueError(f"No mock for {path}")


def _headers() -> dict:
    return {"x-api-key": settings.web3_service_key}


def post(path: str, payload: dict) -> dict:
    if settings.web3_mock:
        return _mock(path, payload)
    r = httpx.post(settings.web3_service_url + path, json=payload, headers=_headers(), timeout=180)
    r.raise_for_status()
    return r.json()


def get(path: str, params: dict) -> dict:
    if settings.web3_mock:
        return _mock(path, params)
    r = httpx.get(settings.web3_service_url + path, params=params, headers=_headers(), timeout=60)
    r.raise_for_status()
    return r.json()