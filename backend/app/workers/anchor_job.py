import logging
from datetime import datetime, timezone

from app.core.database import SessionLocal
from app.models import AnchorBatch, Content
from app.services import anchor_service, irys_service, merkle_service

log = logging.getLogger(__name__)

# ~64 hex chars per leaf keeps the tree JSON under IRYS's 100 KB free tier
MAX_BATCH = 1000


def run_anchor_batch() -> None:
    db = SessionLocal()
    try:
        pending = (
            db.query(Content)
            .filter(Content.status == "pending_anchor")
            .order_by(Content.registered_at)
            .limit(MAX_BATCH)
            .all()
        )
        if not pending:
            return

        leaves = [c.sha256 for c in pending]
        root, proofs = merkle_service.build_tree(leaves)

        tree_tx = irys_service.upload_json(
            {"root": root, "leaves": leaves, "createdAt": datetime.now(timezone.utc).isoformat()},
            {"App-Name": "DCAS", "Type": "merkle-tree"},
        )
        tx_hash = anchor_service.anchor_root(root)

        batch = AnchorBatch(
            merkle_root=root, leaf_count=len(leaves), tree_irys_tx_id=tree_tx, polygon_tx_hash=tx_hash
        )
        db.add(batch)
        db.flush()
        for c in pending:
            c.merkle_proof = proofs[c.sha256]
            c.batch_id = batch.id
            c.polygon_tx_hash = tx_hash
            c.status = "anchored"
        db.commit()
        log.info("Anchored %d items, root %s, tx %s", len(leaves), root, tx_hash)
    except Exception:
        db.rollback()
        log.exception("Anchor batch failed; items stay pending_anchor and retry next run")
    finally:
        db.close()

