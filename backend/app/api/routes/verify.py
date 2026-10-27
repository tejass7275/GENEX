from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.content import HEX64
from app.schemas.verify import VerifyIn, VerifyOut
from app.services import verification_service as vs

router = APIRouter()


@router.post("/verify", response_model=VerifyOut)
def verify(body: VerifyIn, request: Request, db: Session = Depends(get_db)):
    """Used by the web portal: exact SHA-256 match first, then pHash similarity."""
    content, match, distance = vs.lookup(db, body.sha256, body.phash)
    return vs.build_result(content, match, distance, str(request.base_url))


@router.get("/api/verify", response_model=VerifyOut)
def verify_by_hash(
    request: Request,
    sha: str = Query(..., alias="hash", pattern=HEX64),
    db: Session = Depends(get_db),
):
    """Public REST API: GET /api/verify?hash={sha256} (exact match only)."""
    content, match, distance = vs.lookup(db, sha.lower(), None)
    return vs.build_result(content, match, distance, str(request.base_url))

