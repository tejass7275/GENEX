from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

HEX64 = r"^[0-9a-f]{64}$"
HEX16 = r"^[0-9a-f]{16}$"


class RegisterIn(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    content_type: str = Field(default="application/octet-stream", max_length=100)
    sha256: str = Field(pattern=HEX64)
    phash: Optional[str] = Field(default=None, pattern=HEX16)


class ContentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    filename: str
    sha256: str
    phash: Optional[str]
    status: str
    registered_at: datetime

