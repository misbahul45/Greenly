import logging

from fastapi import APIRouter, Request

from app.deps import get_redis
from app.schemas import TelemetryEvent

router = APIRouter(prefix="/events")
logger = logging.getLogger("ml-engine.events")


@router.post("")
async def log_telemetry_event(request: Request, event: TelemetryEvent):
    request_id = getattr(request.state, "request_id", None)
    
    # Store recent views in Redis
    if event.event_type == "view" and event.user_id and event.product_id:
        try:
            redis = get_redis()
            key = f"recent_views:{event.user_id}"
            await redis.lrem(key, 0, event.product_id)  # Remove old occurrences
            await redis.lpush(key, event.product_id)
            await redis.ltrim(key, 0, 9)  # Keep only the last 10 products
            await redis.expire(key, 604800)  # 7 days TTL
        except Exception as e:
            logger.error("Failed to cache recent view in Redis: %s", e)

    # In a production environment, this would log to a data warehouse or message broker like Kafka/RabbitMQ
    # For now, we log it so we can start collecting feedback loop data

    logger.info(
        "telemetry_event requestId=%s userId=%s type=%s productId=%s source=%s metadata=%s",
        getattr(request.state, "request_id", None),
        event.user_id,
        event.event_type,
        event.product_id,
        event.source,
        event.metadata,
    )
    
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "Event logged successfully",
        "data": {"logged": True},
        "requestId": request_id,
    }
