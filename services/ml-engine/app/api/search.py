import logging
import os

import httpx
from fastapi import APIRouter, Body, HTTPException, Request, Depends

from app.clients.catalog_client import CatalogClient
from app.deps import get_embedding_service, get_vector_store
from app.schemas import ProductIndexItem, SearchRequest

router = APIRouter()
logger = logging.getLogger("ml-engine.search")


async def _require_internal(request: Request) -> None:
    token = request.headers.get("x-internal-token")
    expected = os.getenv("ML_INTERNAL_TOKEN")
    if not expected or token != expected:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/products/index", dependencies=[Depends(_require_internal)])
async def index_products(request: Request, products: list[ProductIndexItem] = Body(...)):
    embedder = get_embedding_service()
    embeddings = embedder.embed_products(products)
    store = get_vector_store()
    with store.lock:
        store.rebuild(products, embeddings)
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "Products indexed",
        "data": {"indexed": len(products), "model": embedder.model_name},
    }


@router.post("/products/upsert", dependencies=[Depends(_require_internal)])
async def upsert_product(request: Request, product: ProductIndexItem):
    embedder = get_embedding_service()
    embedding = embedder.embed_products([product])[0]
    store = get_vector_store()
    with store.lock:
        store.upsert(product, embedding)
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "Product indexed",
        "data": {"indexed": 1, "product_id": product.id, "model": embedder.model_name},
    }


@router.delete("/products/{product_id}", dependencies=[Depends(_require_internal)])
async def delete_product(request: Request, product_id: str):
    store = get_vector_store()
    with store.lock:
        deleted = store.delete(product_id)
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "Product removed from index" if deleted else "Product not indexed",
        "data": {"deleted": deleted, "product_id": product_id},
    }


@router.post("/products/rebuild-index", dependencies=[Depends(_require_internal)])
async def rebuild_index(request: Request):
    catalog_client = CatalogClient()
    try:
        products = await catalog_client.fetch_products()
    except httpx.ConnectError as exc:
        logger.exception(
            "rebuild_index_catalog_connect_failed requestId=%s base_url=%s endpoint=/products errorType=%s message=%s",
            getattr(request.state, "request_id", None),
            catalog_client.base_url,
            type(exc).__name__,
            str(exc),
        )
        raise HTTPException(status_code=502, detail="Catalog service unavailable") from exc
    except httpx.TimeoutException as exc:
        logger.exception(
            "rebuild_index_catalog_timeout requestId=%s base_url=%s endpoint=/products errorType=%s message=%s",
            getattr(request.state, "request_id", None),
            catalog_client.base_url,
            type(exc).__name__,
            str(exc),
        )
        raise HTTPException(status_code=504, detail="Catalog service timed out") from exc
    except httpx.HTTPStatusError as exc:
        logger.exception(
            "rebuild_index_catalog_bad_status requestId=%s base_url=%s endpoint=/products status=%s body=%s",
            getattr(request.state, "request_id", None),
            catalog_client.base_url,
            exc.response.status_code,
            exc.response.text[:1000],
        )
        raise HTTPException(status_code=502, detail="Catalog service request failed") from exc
    except httpx.RequestError as exc:
        logger.exception(
            "rebuild_index_catalog_request_failed requestId=%s base_url=%s endpoint=/products errorType=%s message=%s",
            getattr(request.state, "request_id", None),
            catalog_client.base_url,
            type(exc).__name__,
            str(exc),
        )
        raise HTTPException(status_code=502, detail="Catalog service request failed") from exc

    embedder = get_embedding_service()
    embeddings = embedder.embed_products(products)
    store = get_vector_store()
    with store.lock:
        store.rebuild(products, embeddings)
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "Product index rebuilt",
        "data": {"indexed": len(products), "model": embedder.model_name},
    }


@router.post("/search")
async def search(request: Request, payload: SearchRequest):
    embedder = get_embedding_service()
    query_vector = embedder.embed_query(payload.query)
    store = get_vector_store()
    with store.lock:
        results = store.search(query_vector, payload.limit, payload.filters)
    message = "success" if results else "Index empty or no products matched"
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": message,
        "data": [result.model_dump() for result in results],
    }
