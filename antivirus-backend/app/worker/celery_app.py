"""
app/worker/celery_app.py
─────────────────────────
Celery application instance configured with Redis broker and result backend.

The Celery app is imported by:
  - app/worker/tasks.py  (task definitions)
  - API endpoints         (apply_async calls)
  - celery CLI            (celery -A app.worker.celery_app.celery worker)
"""

from __future__ import annotations

from celery import Celery

from app.core.config import get_settings

_settings = get_settings()

celery = Celery(
    "antivirus_worker",
    broker=_settings.redis_url,
    backend=_settings.redis_url,
    include=["app.worker.tasks"],
)

celery.conf.update(
    # Serialisation
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    # Timezones
    timezone="UTC",
    enable_utc=True,
    # Result expiry — keep results for 1 hour
    result_expires=3600,
    # Task queues
    task_queues={
        "default": {"exchange": "default", "routing_key": "default"},
        "deep_scan": {"exchange": "deep_scan", "routing_key": "deep_scan"},
    },
    task_default_queue="default",
    task_default_exchange="default",
    task_default_routing_key="default",
    # Retry settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,  # one task at a time per worker thread
    # Soft time limit: task gets SIGALRM after 5 min; hard kill after 6 min
    task_soft_time_limit=300,
    task_time_limit=360,
)
