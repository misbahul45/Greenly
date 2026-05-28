from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.eco import router as eco_router
from app.api.health import router as health_router
from app.api.recommendation import router as recommendation_router
from app.api.search import router as search_router
from app.workers.event_consumer import catalog_event_consumer


app = FastAPI(title="Greenly ML Engine", version="0.1.0")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "statusCode": 500,
            "path": request.url.path,
            "message": str(exc),
            "data": None,
        },
    )


@app.get("/")
async def root():
    return {
        "status": "success",
        "statusCode": 200,
        "path": "/",
        "message": "Greenly ML Engine",
        "data": {"service": "ml-engine"},
    }


app.include_router(health_router)
app.include_router(search_router)
app.include_router(recommendation_router)
app.include_router(eco_router)


@app.on_event("startup")
async def startup():
    catalog_event_consumer.start()
