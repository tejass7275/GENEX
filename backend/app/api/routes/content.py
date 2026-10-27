import base64
import hashlib
import os
import re
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Response, UploadFile
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models import Content, User
from app.schemas.content import ContentOut, RegisterIn
from app.services import timestamp_service
from app.utils.hashing import phash_to_signed_int
from app.workers import ai_worker

router = APIRouter()


@router.post("/register", response_model=ContentOut, status_code=201)
def register(body: RegisterIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if db.query(Content).filter(Content.sha256 == body.sha256).first():
        raise HTTPException(status_code=409, detail="This file is already registered.")

    content = Content(
        owner_id=user.id,
        filename=body.filename,
        content_type=body.content_type,
        sha256=body.sha256,
        phash=body.phash,
        phash_int=phash_to_signed_int(body.phash) if body.phash else None,
        rfc_tst=timestamp_service.request_timestamp(body.sha256),
        status="pending_ai",
    )
    db.add(content)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="This file is already registered.")
    return content


@router.get("/mine", response_model=List[ContentOut])
def mine(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return (
        db.query(Content)
        .filter(Content.owner_id == user.id)
        .order_by(Content.registered_at.desc())
        .all()
    )


@router.post("/{content_id}/media", status_code=202)
def upload_media(
    content_id: str,
    background: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Receives the file once for AI screening. It is hash-checked against the registered
    SHA-256, sent to the detector and deleted. It is never stored."""
    c = db.get(Content, content_id)
    if c is None or c.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Content not found.")
    if c.status not in ("pending_ai", "failed"):
        raise HTTPException(status_code=409, detail="This content was already screened.")

    os.makedirs(settings.media_tmp_dir, exist_ok=True)
    ext = re.sub(r"[^A-Za-z0-9.]", "", os.path.splitext(file.filename or "")[1])[:10]
    path = os.path.join(settings.media_tmp_dir, f"{c.id}{ext}")

    limit = settings.max_media_mb * 1024 * 1024
    digest, size, too_big = hashlib.sha256(), 0, False
    with open(path, "wb") as out:
        while True:
            chunk = file.file.read(1 << 20)
            if not chunk:
                break
            size += len(chunk)
            if size > limit:
                too_big = True
                break
            digest.update(chunk)
            out.write(chunk)

    if too_big or digest.hexdigest() != c.sha256:
        os.remove(path)
        if too_big:
            raise HTTPException(status_code=413, detail=f"File is larger than {settings.max_media_mb} MB.")
        raise HTTPException(status_code=400, detail="This file does not match the registered fingerprint.")

    c.status = "pending_ai"
    c.error = None
    db.commit()
    background.add_task(ai_worker.process_content, c.id, path)
    return {"status": "screening_started"}


@router.get("/{content_id}/timestamp")
def download_timestamp(content_id: str, db: Session = Depends(get_db)):
    c = db.get(Content, content_id)
    if c is None or not c.rfc_tst:
        raise HTTPException(status_code=404, detail="No timestamp token for this content.")
    return Response(
        content=base64.b64decode(c.rfc_tst),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{c.sha256[:16]}.tst"'},
    )

