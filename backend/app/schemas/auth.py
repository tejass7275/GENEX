from pydantic import BaseModel, ConfigDict
from app.models import User

class GoogleLoginIn(BaseModel):
    credential: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    wallet_address: str
    did: str


class TokenOut(BaseModel):
    access_token: str
    user: UserOut

