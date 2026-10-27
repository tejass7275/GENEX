from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


def _normalize(url: str) -> str:
    # Some hosts (Heroku, older Neon strings) hand out postgres://
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://"):]
    return url


_url = _normalize(settings.database_url)
_args = {"check_same_thread": False} if _url.startswith("sqlite") else {}

engine = create_engine(_url, pool_pre_ping=True, connect_args=_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

