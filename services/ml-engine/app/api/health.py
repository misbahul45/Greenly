from fastapi import APIRouter, Request

from app.config import get_settings
from app.deps import get_embedding_service, get_vector_store

router = APIRouter()


@router.get("/health")
async def health(request: Request):
    embedder = get_embedding_service()
    store = get_vector_store()
    return {
        "status": "ok",
        "service": "ml-engine",
        "model_loaded": embedder.model_loaded,
        "index_loaded": store.index_loaded,
        "model_name": get_settings().model_name,
        "indexed_products": store.count,
        "model_error": embedder.load_error,
    }
