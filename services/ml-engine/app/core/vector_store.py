import json
import os
from pathlib import Path

import numpy as np

from app.schemas import ProductIndexItem, SearchFilters, SearchResult

try:
    import faiss
except Exception:
    faiss = None


class VectorStore:
    def __init__(self, index_path: str, meta_path: str):
        self.index_path = Path(index_path)
        self.meta_path = Path(meta_path)
        self.index = None
        self.embeddings: np.ndarray | None = None
        self.products: list[ProductIndexItem] = []
        self.dimension = 384
        self.load()

    @property
    def index_loaded(self) -> bool:
        return self.count > 0

    @property
    def count(self) -> int:
        return len(self.products)

    def load(self) -> None:
        if self.meta_path.exists():
            raw = json.loads(self.meta_path.read_text())
            self.products = [ProductIndexItem(**item) for item in raw.get("products", [])]
            embeddings = raw.get("embeddings")
            if embeddings:
                self.embeddings = np.asarray(embeddings, dtype="float32")
                self.dimension = int(raw.get("dimension", self.embeddings.shape[1]))

        if faiss is not None and self.index_path.exists():
            self.index = faiss.read_index(str(self.index_path))
            self.dimension = self.index.d
        elif faiss is not None:
            self.index = faiss.IndexFlatIP(self.dimension)

    def rebuild(self, products: list[ProductIndexItem], embeddings: np.ndarray) -> None:
        self.products = products
        self.embeddings = np.asarray(embeddings, dtype="float32")
        self.dimension = self.embeddings.shape[1] if len(self.embeddings) else 384

        if faiss is not None:
            self.index = faiss.IndexFlatIP(self.dimension)
            if len(self.embeddings):
                self.index.add(self.embeddings)

        self.save()

    def upsert(self, product: ProductIndexItem, embedding: np.ndarray) -> None:
        products = [item for item in self.products if item.id != product.id]
        embeddings = []
        if self.embeddings is not None:
            embeddings = [
                self.embeddings[index]
                for index, item in enumerate(self.products)
                if item.id != product.id
            ]
        products.append(product)
        embeddings.append(embedding.astype("float32"))
        self.rebuild(products, np.vstack(embeddings).astype("float32"))

    def delete(self, product_id: str) -> bool:
        if not self.products:
            return False
        products = [item for item in self.products if item.id != product_id]
        if len(products) == len(self.products):
            return False
        embeddings = []
        if self.embeddings is not None:
            embeddings = [
                self.embeddings[index]
                for index, item in enumerate(self.products)
                if item.id != product_id
            ]
        if embeddings:
            self.rebuild(products, np.vstack(embeddings).astype("float32"))
        else:
            self.rebuild(products, np.empty((0, self.dimension), dtype="float32"))
        return True

    def save(self) -> None:
        os.makedirs(self.index_path.parent, exist_ok=True)
        if faiss is not None and self.index is not None:
            faiss.write_index(self.index, str(self.index_path))

        payload = {
            "dimension": self.dimension,
            "products": [product.model_dump() for product in self.products],
            "embeddings": self.embeddings.tolist() if self.embeddings is not None else [],
        }
        self.meta_path.write_text(json.dumps(payload, ensure_ascii=False))

    def get_product(self, product_id: str) -> ProductIndexItem | None:
        return next((product for product in self.products if product.id == product_id), None)

    def get_embedding(self, product_id: str) -> np.ndarray | None:
        for index, product in enumerate(self.products):
            if product.id == product_id and self.embeddings is not None:
                return self.embeddings[index]
        return None

    def search(
        self,
        query_vector: np.ndarray,
        limit: int = 10,
        filters: SearchFilters | None = None,
        exclude_product_id: str | None = None,
    ) -> list[SearchResult]:
        if not self.products or self.embeddings is None:
            return []

        search_limit = min(max(limit * 4, limit), len(self.products))
        if faiss is not None and self.index is not None:
            scores, indices = self.index.search(query_vector.reshape(1, -1).astype("float32"), search_limit)
            pairs = list(zip(indices[0].tolist(), scores[0].tolist()))
        else:
            scores = self.embeddings @ query_vector.astype("float32")
            top_indices = np.argsort(scores)[::-1][:search_limit]
            pairs = [(int(idx), float(scores[idx])) for idx in top_indices]

        results: list[SearchResult] = []
        for index, score in pairs:
            if index < 0 or index >= len(self.products):
                continue
            product = self.products[index]
            if exclude_product_id and product.id == exclude_product_id:
                continue
            if not _passes_filters(product, filters):
                continue
            results.append(_to_search_result(product, float(score)))
            if len(results) >= limit:
                break
        return results


def _passes_filters(product: ProductIndexItem, filters: SearchFilters | None) -> bool:
    if filters is None:
        return True
    if filters.category_id and product.category_id != filters.category_id:
        return False
    if filters.min_price is not None and (product.price is None or product.price < filters.min_price):
        return False
    if filters.max_price is not None and (product.price is None or product.price > filters.max_price):
        return False
    if filters.min_eco_score is not None and (product.eco_score is None or product.eco_score < filters.min_eco_score):
        return False
    return True


def _to_search_result(product: ProductIndexItem, score: float) -> SearchResult:
    image_url = product.image_urls[0] if product.image_urls else None
    reason = "Cocok dengan pencarian kamu"
    if product.eco_score is not None and product.eco_score >= 75:
        reason = "Cocok karena memiliki skor eco tinggi"
    elif product.rating_average is not None and product.rating_average >= 4.5:
        reason = "Produk punya rating bagus"

    return SearchResult(
        id=product.id,
        product_id=product.id,
        score=score,
        name=product.name,
        slug=product.slug,
        price=product.price,
        currency=product.currency,
        image_url=image_url,
        image_urls=product.image_urls,
        eco_score=product.eco_score,
        rating_average=product.rating_average,
        review_count=product.review_count,
        favorite_count=product.favorite_count,
        reason=reason,
    )
