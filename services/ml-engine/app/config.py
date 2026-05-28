from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ml_port: int = 8000
    model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    catalog_service_url: str = "http://catalog-service:8081"
    core_service_url: str = "http://core-service:3000"
    rabbitmq_url: str = "amqp://guest:guest@rabbitmq:5672/"
    redis_url: str = "redis://redis:6379/0"
    faiss_index_path: str = "/app/app/storage/indexes/products.faiss"
    product_meta_path: str = "/app/app/storage/indexes/products_meta.json"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
