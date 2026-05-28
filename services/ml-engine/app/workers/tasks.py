from app.workers.celery_app import celery_app


@celery_app.task(name="ml.rebuild_index")
def rebuild_index_task():
    return {"status": "queued"}
