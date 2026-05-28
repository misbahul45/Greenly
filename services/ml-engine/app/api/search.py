from fastapi import APIRouter, Body, Request

from app.clients.catalog_client import CatalogClient
from app.deps import get_embedding_service, get_vector_store
from app.schemas import ProductIndexItem, SearchRequest

router = APIRouter()


@router.post("/products/index")
async def index_products(request: Request, products: list[ProductIndexItem] = Body(...)):
    embedder = get_embedding_service()
    embeddings = embedder.embed_products(products)
    store = get_vector_store()
    store.rebuild(products, embeddings)
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "Products indexed",
        "data": {"indexed": len(products), "model": embedder.model_name},
    }


@router.post("/products/upsert")
async def upsert_product(request: Request, product: ProductIndexItem):
    embedder = get_embedding_service()
    embedding = embedder.embed_products([product])[0]
    store = get_vector_store()
    store.upsert(product, embedding)
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "Product indexed",
        "data": {"indexed": 1, "product_id": product.id, "model": embedder.model_name},
    }


@router.delete("/products/{product_id}")
async def delete_product(request: Request, product_id: str):
    store = get_vector_store()
    deleted = store.delete(product_id)
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "Product removed from index" if deleted else "Product not indexed",
        "data": {"deleted": deleted, "product_id": product_id},
    }


@router.post("/products/rebuild-index")
async def rebuild_index(request: Request):
    products = await CatalogClient().fetch_products()
    embedder = get_embedding_service()
    embeddings = embedder.embed_products(products)
    store = get_vector_store()
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
    results = store.search(query_vector, payload.limit, payload.filters)
    message = "success" if results else "Index empty or no products matched"
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": message,
        "data": [result.model_dump() for result in results],
    }
