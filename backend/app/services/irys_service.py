from typing import Optional

from app.services import web3_client


def upload_json(data: dict, tags: Optional[dict] = None) -> str:
    """Upload a small JSON document to IRYS (free under 100 KB). Returns the tx id."""
    payload = {"data": data, "tags": [{"name": k, "value": v} for k, v in (tags or {}).items()]}
    return web3_client.post("/irys/upload", payload)["id"]

