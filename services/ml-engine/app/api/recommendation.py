from fastapi import APIRouter, Query, Request
import numpy as np

from app.core.ranking import rank_home_products, rank_eco_products, rank_personalized_home_products
from app.deps import get_vector_store, get_redis

router = APIRouter(prefix="/recommendations")


@router.get("/home")
async def home_recommendations(
    request: Request, 
    user_id: str | None = None,
    limit: int = Query(20, ge=1, le=100)
):
    store = get_vector_store()
    
    if user_id and store.embeddings is not None and len(store.products) > 0:
        try:
            redis = get_redis()
            recent_product_ids = await redis.lrange(f"recent_views:{user_id}", 0, 9)
        except Exception:
            recent_product_ids = []

        if recent_product_ids:
            vectors = []
            for pid in recent_product_ids:
                vec = store.get_embedding(pid)
                if vec is not None:
                    vectors.append(vec)
                    
            if vectors:
                # Mean pooling to create user preference vector
                user_vector = np.mean(vectors, axis=0)
                
                # Normalize the vector to maintain scale for cosine similarity
                norm = np.linalg.norm(user_vector)
                if norm > 0:
                    user_vector = user_vector / norm
                
                # Compute cosine similarity with all products
                scores = store.embeddings @ user_vector.astype("float32")
                
                similarities = {}
                for idx, score in enumerate(scores):
                    similarities[store.products[idx].id] = float(score)
                    
                results = rank_personalized_home_products(store.products, similarities, limit)
            return {
                "status": "success",
                "statusCode": 200,
                "path": request.url.path,
                "message": "success",
                "data": [result.model_dump() for result in results],
            }

    # Fallback to static generic ranking
    results = rank_home_products(store.products, limit)
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "success" if results else "Index empty",
        "data": [result.model_dump() for result in results],
    }


@router.get("/similar/{product_id}")
async def similar_products(request: Request, product_id: str, limit: int = Query(10, ge=1, le=100)):
    store = get_vector_store()
    product = store.get_product(product_id)
    vector = store.get_embedding(product_id)

    if product is None or vector is None:
        return {
            "status": "success",
            "statusCode": 200,
            "path": request.url.path,
            "message": "Product not indexed",
            "data": [],
        }

    results = store.search(vector, limit + 5, exclude_product_id=product_id)
    for result in results:
        candidate = store.get_product(result.product_id)
        if candidate and candidate.category_id == product.category_id:
            result.score += 0.05
            result.reason = "Mirip dan berada pada kategori yang sama"

    results = sorted(results, key=lambda item: item.score, reverse=True)[:limit]
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "success" if results else "No similar products found",
        "data": [result.model_dump() for result in results],
    }


@router.get("/eco")
async def eco_recommendations(request: Request, limit: int = Query(20, ge=1, le=100)):
    store = get_vector_store()
    results = rank_eco_products(store.products, limit)
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "success" if results else "Index empty",
        "data": [result.model_dump() for result in results],
    }

