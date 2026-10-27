import logging
import os
from datetime import datetime, timezone

from app.core.database import SessionLocal
from app.models import Content
from app.services import ai_screening, irys_service

log = logging.getLogger(__name__)


def process_content(content_id: str, media_path: str) -> None:
    """Score the media, publish the metadata package to IRYS, move to pending_anchor.
    The temporary media file is always deleted afterwards."""
    db = SessionLocal()
    try:
        c = db.get(Content, content_id)
        if c is None:
            return
        try:
            score = ai_screening.score_media(media_path)
            c.ai_score = score
            c.ai_label = ai_screening.label_for(score)
            c.ai_scored_at = datetime.now(timezone.utc)

            meta = {
                "contentId": c.id,
                "sha256": c.sha256,
                "phash": c.phash,
                "walletAddress": c.owner.wallet_address,
                "rfcTimestamp": c.rfc_tst,
                "contentType": c.content_type,
                "registeredAt": c.registered_at.isoformat(),
                "aiScore": c.ai_score,
                "aiLabel": c.ai_label,
                "aiScoredAt": c.ai_scored_at.isoformat(),
            }
            c.irys_tx_id = irys_service.upload_json(meta, {"App-Name": "DCAS", "Content-Id": c.id})
            c.status = "pending_anchor"
            c.error = None
        except Exception as e:
            log.exception("AI screening failed for %s", content_id)
            c.status = "failed"
            c.error = str(e)[:500]
        db.commit()
    finally:
        db.close()
        try:
            os.remove(media_path)
        except OSError:
            pass

