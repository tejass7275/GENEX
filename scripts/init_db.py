"""Create all tables. Run from the project root: python scripts/init_db.py"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND = os.path.join(ROOT, "backend")
sys.path.insert(0, BACKEND)
os.chdir(BACKEND)  # so backend/.env is found

from app.core.database import Base, engine  # noqa: E402
import app.models  # noqa: E402,F401

Base.metadata.create_all(bind=engine)
print("Tables created.")

