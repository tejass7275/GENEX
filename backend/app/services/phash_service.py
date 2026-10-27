from typing import Optional, Tuple

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Content
from app.utils.hashing import hamming_hex, phash_to_signed_int


def find_nearest(db: Session, phash_hex: str) -> Optional[Tuple[Content, int]]:
    """Closest registered pHash within PHASH_MAX_DISTANCE bits, else None."""
    if db.get_bind().dialect.name == "postgresql":
        row = db.execute(
            text(
                "SELECT id, length(replace(((phash_int # CAST(:q AS BIGINT))::bit(64))::text, '0', '')) AS dist "
                "FROM contents WHERE phash_int IS NOT NULL ORDER BY dist ASC LIMIT 1"
            ),
            {"q": phash_to_signed_int(phash_hex)},
        ).first()
        if row is None or row.dist > settings.phash_max_distance:
            return None
        return db.get(Content, row.id), int(row.dist)

    # Fallback for non-Postgres databases (tests)
    best = None
    for c in db.query(Content).filter(Content.phash.isnot(None)).all():
        d = hamming_hex(phash_hex, c.phash)
        if best is None or d < best[1]:
            best = (c, d)
    return best if best and best[1] <= settings.phash_max_distance else None

