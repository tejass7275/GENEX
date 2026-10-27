from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException

from app.core.config import settings


def create_access_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode({"sub": user_id, "exp": exp}, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        return payload["sub"]
    except (jwt.PyJWTError, KeyError):
        raise HTTPException(status_code=401, detail="Session expired. Sign in again.")

