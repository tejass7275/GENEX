from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.workers.anchor_job import run_anchor_batch

scheduler = BackgroundScheduler()


def start() -> None:
    scheduler.add_job(
        run_anchor_batch,
        "interval",
        minutes=settings.anchor_interval_minutes,
        id="anchor_batch",
        max_instances=1,
        coalesce=True,
    )
    scheduler.start()


def stop() -> None:
    scheduler.shutdown(wait=False)

