import hashlib
import os
from typing import Iterable
import numpy as np

from app.schemas import ProductIndexItem


class EmbeddingService:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self._model = None
        self._load_error: str | None = None
        self.dimension = 384

    @property
    def model_loaded(self) -> bool:
        return self._model is not None

    @property
    def load_error(self) -> str | None:
        return self._load_error

    def load(self) -> None:
        if self._model is not None or self._load_error is not None:
            return

        if os.getenv("ML_USE_HASH_EMBEDDINGS", "").lower() == "true":
            self._load_error = "Hash embeddings enabled by ML_USE_HASH_EMBEDDINGS"
            return

        try:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.model_name)
        except Exception as exc:
            self._load_error = str(exc)

    def embed_texts(self, texts: Iterable[str]) -> np.ndarray:
        values = list(texts)
        if not values:
            return np.empty((0, self.dimension), dtype="float32")

        self.load()

        if self._model is not None:
            vectors = self._model.encode(
                values,
                normalize_embeddings=True,
                show_progress_bar=False,
            )
            return np.asarray(vectors, dtype="float32")

        return np.vstack([self._hash_embedding(text) for text in values]).astype("float32")

    def embed_query(self, query: str) -> np.ndarray:
        return self.embed_texts([query])[0]

    def embed_products(self, products: list[ProductIndexItem]) -> np.ndarray:
        return self.embed_texts([product_to_text(product) for product in products])

    def _hash_embedding(self, text: str) -> np.ndarray:
        vector = np.zeros(self.dimension, dtype="float32")
        for token in text.lower().split():
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % self.dimension
            sign = 1.0 if digest[4] % 2 == 0 else -1.0
            vector[index] += sign
        norm = np.linalg.norm(vector)
        if norm == 0:
            return vector
        return vector / norm


def product_to_text(product: ProductIndexItem) -> str:
    return "\n".join(
        [
            f"name: {product.name}",
            f"description: {product.description or ''}",
            f"category: {product.category_id or ''}",
            f"material: {product.material_type or ''}",
            (
                "eco: "
                f"recyclable={product.recyclable}, "
                f"carbon={product.carbon_footprint}, "
                f"eco_score={product.eco_score}"
            ),
            f"price: {product.price}",
            f"rating: {product.rating_average}",
        ]
    )
