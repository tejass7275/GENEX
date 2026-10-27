import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, content, verify
from app.core.config import settings
from app.workers import scheduler

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.start()  # hourly Merkle anchoring (run a single worker process)
    yield
    scheduler.stop()


app = FastAPI(title="Content Authentication API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(content.router, prefix="/content", tags=["content"])
app.include_router(verify.router, tags=["verify"])


@app.get("/health")
def health():
    return {"ok": True}

