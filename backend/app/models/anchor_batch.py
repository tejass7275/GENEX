import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AnchorBatch(Base):
    __tablename__ = "anchor_batches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    merkle_root: Mapped[str] = mapped_column(String(64), index=True)
    leaf_count: Mapped[int] = mapped_column(Integer)
    tree_irys_tx_id: Mapped[Optional[str]] = mapped_column(String(100))
    polygon_tx_hash: Mapped[str] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

