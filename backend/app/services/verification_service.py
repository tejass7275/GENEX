import logging
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Content
from app.schemas.verify import AIInfo, Provenance, VerifyOut
from app.services import anchor_service, merkle_service, phash_service

log = logging.getLogger(__name__)


def lookup(db: Session, sha256: str, phash: Optional[str]) -> Tuple[Optional[Content], str, Optional[int]]:
    exact = db.query(Content).filter(Content.sha256 == sha256).first()
    if exact:
        return exact, "exact", 0
    if phash:
        near = phash_service.find_nearest(db, phash)
        if near:
            return near[0], "similar", near[1]
    return None, "none", None


def _merkle_verified(c: Content) -> bool:
    """True only if the stored proof matches the batch root AND that root is on-chain."""
    if c.status != "anchored" or c.batch is None or c.merkle_proof is None:
        return False
    if not merkle_service.verify_proof(c.sha256, c.merkle_proof, c.batch.merkle_root):
        return False
    try:
        return anchor_service.is_root_anchored(c.batch.merkle_root)
    except Exception:
        log.exception("On-chain root check failed")
        return False


def build_result(c: Optional[Content], match: str, distance: Optional[int], base_url: str) -> VerifyOut:
    if c is None:
        return VerifyOut(match="none")
    return VerifyOut(
        match=match,
        distance=distance,
        provenance=Provenance(
            creator_did=c.owner.did,
            wallet_address=c.owner.wallet_address,
            registered_at=c.registered_at,
            rfc_timestamp_url=f"{base_url}content/{c.id}/timestamp" if c.rfc_tst else None,
            polygon_tx_hash=c.polygon_tx_hash,
            irys_url=f"{settings.irys_gateway}/{c.irys_tx_id}" if c.irys_tx_id else None,
            merkle_verified=_merkle_verified(c),
        ),
        ai=AIInfo(score=c.ai_score, label=c.ai_label, scored_at=c.ai_scored_at)
        if c.ai_score is not None
        else None,
    )

