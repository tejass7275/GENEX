import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import JSON, BigInteger, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Content(Base):
    __tablename__ = "contents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(100))

    sha256: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    phash: Mapped[Optional[str]] = mapped_column(String(16))
    # phash as signed 64-bit int so Postgres can compute Hamming distance in SQL
    phash_int: Mapped[Optional[int]] = mapped_column(BigInteger, index=True)

    rfc_tst: Mapped[Optional[str]] = mapped_column(Text)  # base64 RFC 3161 token

    # pending_ai -> pending_anchor -> anchored  (or failed)
    status: Mapped[str] = mapped_column(String(20), default="pending_ai", index=True)
    error: Mapped[Optional[str]] = mapped_column(String(500))

    ai_score: Mapped[Optional[float]] = mapped_column(Float)
    ai_label: Mapped[Optional[str]] = mapped_column(String(40))
    ai_scored_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    irys_tx_id: Mapped[Optional[str]] = mapped_column(String(100))
    merkle_proof: Mapped[Optional[list]] = mapped_column(JSON)
    batch_id: Mapped[Optional[str]] = mapped_column(ForeignKey("anchor_batches.id"))
    polygon_tx_hash: Mapped[Optional[str]] = mapped_column(String(80))

    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    owner = relationship("User")
    batch = relationship("AnchorBatch")

