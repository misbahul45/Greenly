from functools import lru_cache

from app.config import get_settings
from app.core.embedding import EmbeddingService
from app.core.vector_store import VectorStore


@lru_cache
def get_embedding_service() -> EmbeddingService:
    settings = get_settings()
    return EmbeddingService(settings.model_name, settings.huggingface_api_token)


@lru_cache
def get_vector_store() -> VectorStore:
    settings = get_settings()
    return VectorStore(settings.faiss_index_path, settings.product_meta_path)

import redis.asyncio as redis

_redis_client: redis.Redis | None = None

async def init_redis():
    global _redis_client
    if _redis_client is None:
        settings = get_settings()
        _redis_client = redis.from_url(settings.redis_url, decode_responses=True)

async def close_redis():
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None

def get_redis() -> redis.Redis:
    if _redis_client is None:
        raise RuntimeError("Redis not initialized")
    return _redis_client

