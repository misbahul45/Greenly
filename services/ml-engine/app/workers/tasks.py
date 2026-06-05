from app.workers.celery_app import celery_app


@celery_app.task(name="ml.rebuild_index")
def rebuild_index_task():
    import asyncio

    from app.clients.catalog_client import CatalogClient
    from app.deps import get_embedding_service, get_vector_store

    async def _run():
        products = await CatalogClient().fetch_products()
        embedder = get_embedding_service()
        embeddings = embedder.embed_products(products)
        get_vector_store().rebuild(products, embeddings)
        return {
            "status": "success",
            "indexed": len(products),
            "model": embedder.model_name,
        }

    return asyncio.run(_run())
