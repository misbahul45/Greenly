import logging

from fastapi import APIRouter, Request

from app.schemas import TelemetryEvent

router = APIRouter(prefix="/events")
logger = logging.getLogger("ml-engine.events")


@router.post("")
async def log_telemetry_event(request: Request, event: TelemetryEvent):
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
    }
