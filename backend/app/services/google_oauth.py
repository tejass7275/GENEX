from fastapi import HTTPException
from google.auth.transport import requests as g_requests
from google.oauth2 import id_token

from app.core.config import settings


def verify_google_token(credential: str) -> dict:
    try:
        info = id_token.verify_oauth2_token(
            credential, g_requests.Request(), settings.google_client_id, clock_skew_in_seconds=10
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Google sign-in could not be verified.")
    if not info.get("email_verified"):
        raise HTTPException(status_code=401, detail="Your Google email is not verified.")
    return info

