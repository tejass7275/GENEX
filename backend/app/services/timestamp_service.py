import base64
import logging
from typing import Optional

import rfc3161ng

from app.core.config import settings

log = logging.getLogger(__name__)


def request_timestamp(sha256_hex: str) -> Optional[str]:
    """RFC 3161 timestamp over the SHA-256 digest. Returns the token base64-encoded.
    A TSA outage must not block registration, so failures return None."""
    try:
        stamper = rfc3161ng.RemoteTimestamper(settings.tsa_url, hashname="sha256")
        token = stamper.timestamp(digest=bytes.fromhex(sha256_hex))
        return base64.b64encode(token).decode()
    except Exception:
        log.exception("RFC 3161 timestamp failed")
        return None