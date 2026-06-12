from fastapi import APIRouter, Query, Request

from app.core.ranking import rank_home_products
from app.deps import get_vector_store

router = APIRouter(prefix="/recommendations")


@router.get("/home")
async def home_recommendations(request: Request, user_id: str | None = None, limit: int = Query(20, ge=1, le=100)):
    store = get_vector_store()
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
    products = sorted(store.products, key=lambda item: item.eco_score or 0, reverse=True)
    results = rank_home_products(products, limit)
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "success" if results else "Index empty",
        "data": [result.model_dump() for result in results],
    }
