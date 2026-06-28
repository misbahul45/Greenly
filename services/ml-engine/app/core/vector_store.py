import json
import logging
import os
import threading
from pathlib import Path

import numpy as np

from app.schemas import ProductIndexItem, SearchFilters, SearchResult

logger = logging.getLogger(__name__)

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
        self._lock = threading.RLock()
        self.load()

    @property
    def index_loaded(self) -> bool:
        return self.count > 0

    @property
    def count(self) -> int:
        return len(self.products)

    @property
    def lock(self) -> threading.RLock:
        return self._lock

    def load(self) -> None:
        if self.meta_path.exists():
            try:
                raw = json.loads(self.meta_path.read_text())
                self.products = [ProductIndexItem(**item) for item in raw.get("products", [])]
                embeddings = raw.get("embeddings")
                if embeddings:
                    self.embeddings = np.asarray(embeddings, dtype="float32")
                    self.dimension = int(raw.get("dimension", self.embeddings.shape[1]))
            except Exception:
                logger.exception("[vector_store] failed to load meta from %s", self.meta_path)
                self.products = []
                self.embeddings = None

        if faiss is not None and self.index_path.exists():
            try:
                loaded = faiss.read_index(str(self.index_path))
                meta_dim = self.embeddings.shape[1] if self.embeddings is not None else self.dimension
                if loaded.d != meta_dim:
                    logger.warning(
                        "[vector_store] FAISS index dimension %d != meta dimension %d — rebuilding FAISS from meta",
                        loaded.d, meta_dim,
                    )
                    self.index = faiss.IndexFlatIP(meta_dim)
                    self.dimension = meta_dim
                    if self.embeddings is not None and len(self.embeddings):
                        self.index.add(self.embeddings)
                else:
                    self.index = loaded
                    self.dimension = loaded.d
            except Exception:
                logger.exception("[vector_store] failed to load FAISS index from %s", self.index_path)
                self.index = faiss.IndexFlatIP(self.dimension)
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
        embeddings.append(np.asarray(embedding, dtype="float32"))
        matrix = np.vstack(embeddings).astype("float32") if embeddings else np.empty((0, self.dimension), dtype="float32")
        self.rebuild(products, matrix)

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
        os.makedirs(self.meta_path.parent, exist_ok=True)
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

        has_filters = filters is not None or exclude_product_id is not None
        
        if has_filters:
            # Pre-filtering: calculate scores only for valid products
            valid_indices = []
            for i, p in enumerate(self.products):
                if exclude_product_id and p.id == exclude_product_id:
                    continue
                if _passes_filters(p, filters):
                    valid_indices.append(i)
                    
            if not valid_indices:
                return []
                
            # Compute dot product manually for valid indices
            valid_embeddings = self.embeddings[valid_indices]
            scores = valid_embeddings @ query_vector.astype("float32")
            
            # Sort top K
            search_limit = min(limit, len(valid_indices))
            top_local_indices = np.argsort(scores)[::-1][:search_limit]
            
            results: list[SearchResult] = []
            for local_idx in top_local_indices:
                global_idx = valid_indices[local_idx]
                product = self.products[global_idx]
                results.append(_to_search_result(product, float(scores[local_idx])))
            return results
            
        else:
            # No filters: use fast FAISS index if available
            search_limit = min(limit, len(self.products))
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
                results.append(_to_search_result(product, float(score)))
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
    if product.eco_score is not None and product.eco_score >= 80:
        reason = "Cocok karena merupakan produk ramah lingkungan (Skor " + str(int(product.eco_score)) + ")"
    elif product.eco_label:
        reason = f"Produk dengan kategori {product.eco_label}"
    elif product.rating_average is not None and product.rating_average >= 4.5:
        reason = "Produk populer dengan rating tinggi"
    elif product.has_promo:
        reason = f"Sedang promo {product.promotion_label or ''}"

    return SearchResult(
        id=product.id,
        product_id=product.id,
        score=score,
        name=product.name,
        slug=product.slug,
        price=product.price,
        original_price=product.original_price,
        final_price=product.final_price,
        currency=product.currency,
        image_url=image_url,
        image_urls=product.image_urls,
        
        # Eco
        eco_score=product.eco_score,
        eco_label=product.eco_label,
        material_type=product.material_type,
        material_label=product.material_label,
        recyclable=product.recyclable,
        carbon_footprint=product.carbon_footprint,
        carbon_label=product.carbon_label,
        eco_badges=product.eco_badges,
        eco_reasons=product.eco_reasons,
        
        # Promo
        has_promo=product.has_promo,
        promotion_code=product.promotion_code,
        promotion_label=product.promotion_label,
        discount_percent=product.discount_percent,
        discount_amount=product.discount_amount,
        saving_label=product.saving_label,
        
        rating_average=product.rating_average,
        review_count=product.review_count,
        favorite_count=product.favorite_count,
        reason=reason,
    )
