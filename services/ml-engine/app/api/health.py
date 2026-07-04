from fastapi import APIRouter, Request

from app.config import get_settings
from app.deps import get_embedding_service, get_vector_store, get_redis

router = APIRouter()


@router.get("/health")
async def health(request: Request):
    embedder = get_embedding_service()
    store = get_vector_store()

    redis_connected = False
    try:
        redis_client = get_redis()
        await redis_client.ping()
        redis_connected = True
    except Exception:
        redis_connected = False

    status = "ok" if redis_connected else "degraded"

    return {
        "status": status,
        "statusCode": 200,
        "path": request.url.path,
        "message": "ml-engine healthy" if redis_connected else "ml-engine degraded (redis unavailable)",
        "service": "ml-engine",
        "model_loaded": embedder.model_loaded,
        "index_loaded": store.index_loaded,
        "model_name": get_settings().model_name,
        "indexed_products": store.count,
        "model_error": embedder.load_error,
        "redis_connected": redis_connected,
        "data": {
            "service": "ml-engine",
            "model_loaded": embedder.model_loaded,
            "index_loaded": store.index_loaded,
            "model_name": get_settings().model_name,
            "indexed_products": store.count,
            "model_error": embedder.load_error,
            "redis_connected": redis_connected,
        },
    }
