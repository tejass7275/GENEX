from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.models import User
from app.schemas.auth import GoogleLoginIn, TokenOut
from app.services import wallet_service
from app.services.google_oauth import verify_google_token
from app.utils.did import did_from_address

router = APIRouter()


@router.post("/google", response_model=TokenOut)
def google_login(body: GoogleLoginIn, db: Session = Depends(get_db)):
    info = verify_google_token(body.credential)
    user = db.query(User).filter(User.google_sub == info["sub"]).first()
    if user is None:
        address = wallet_service.create_wallet(info["sub"])
        user = User(
            google_sub=info["sub"],
            email=info["email"],
            wallet_address=address,
            did=did_from_address(address),
        )
        db.add(user)
        db.commit()
    return TokenOut(access_token=create_access_token(user.id), user=user)

