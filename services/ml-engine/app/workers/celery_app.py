from celery import Celery

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "greenly_ml",
    broker=settings.rabbitmq_url,
    backend=settings.redis_url,
    include=["app.workers.tasks"],
)
