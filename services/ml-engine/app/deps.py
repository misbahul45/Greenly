from functools import lru_cache

from app.config import get_settings
from app.core.embedding import EmbeddingService
from app.core.vector_store import VectorStore


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService(get_settings().model_name)


@lru_cache
def get_vector_store() -> VectorStore:
    settings = get_settings()
    return VectorStore(settings.faiss_index_path, settings.product_meta_path)
