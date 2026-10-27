from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.content import HEX16, HEX64


class VerifyIn(BaseModel):
    sha256: str = Field(pattern=HEX64)
    phash: Optional[str] = Field(default=None, pattern=HEX16)


class Provenance(BaseModel):
    creator_did: str
    wallet_address: str
    registered_at: datetime
    rfc_timestamp_url: Optional[str] = None
    polygon_tx_hash: Optional[str] = None
    irys_url: Optional[str] = None
    merkle_verified: bool


class AIInfo(BaseModel):
    score: float
    label: str
    scored_at: datetime


class VerifyOut(BaseModel):
    match: Literal["exact", "similar", "none"]
    distance: Optional[int] = None
    provenance: Optional[Provenance] = None
    ai: Optional[AIInfo] = None

