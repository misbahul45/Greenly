import logging
import time
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.eco import router as eco_router
from app.api.health import router as health_router
from app.api.recommendation import router as recommendation_router
from app.api.search import router as search_router
from app.workers.event_consumer import catalog_event_consumer


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml-engine")

app = FastAPI(title="Greenly ML Engine", version="0.1.0")


@app.middleware("http")
async def request_logger_middleware(request: Request, call_next):
    started_at = time.perf_counter()
    request_id = request.headers.get("x-request-id") or request.headers.get("x-correlation-id") or str(uuid4())
    request.state.request_id = request_id

    logger.info(
        "[HTTP IN] service=ml-engine requestId=%s method=%s path=%s query=%s ip=%s userAgent=%s",
        request_id,
        request.method,
        request.url.path,
        request.url.query,
        request.client.host if request.client else None,
        request.headers.get("user-agent"),
    )

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = int((time.perf_counter() - started_at) * 1000)
        logger.exception(
            "[HTTP ERROR] service=ml-engine requestId=%s method=%s path=%s durationMs=%d",
            request_id,
            request.method,
            request.url.path,
            duration_ms,
        )
        raise

    duration_ms = int((time.perf_counter() - started_at) * 1000)
    response.headers["x-request-id"] = request_id
    log_method = logger.error if response.status_code >= 500 else logger.warning if response.status_code >= 400 else logger.info
    log_method(
        "[HTTP OUT] service=ml-engine requestId=%s method=%s path=%s status=%d durationMs=%d",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    request_id = getattr(request.state, "request_id", None)
    logger.warning(
        "[HTTP_EXCEPTION] service=ml-engine requestId=%s method=%s path=%s status=%d detail=%s",
        request_id,
        request.method,
        request.url.path,
        exc.status_code,
        exc.detail,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "statusCode": exc.status_code,
            "path": request.url.path,
            "message": exc.detail if exc.status_code < 500 else "Internal Server Error",
            "data": None,
            "requestId": request_id,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", None)
    logger.warning(
        "[VALIDATION_ERROR] service=ml-engine requestId=%s method=%s path=%s errors=%s",
        request_id,
        request.method,
        request.url.path,
        exc.errors(),
    )
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "statusCode": 422,
            "path": request.url.path,
            "message": "Validation failed",
            "errors": exc.errors(),
            "requestId": request_id,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)
    logger.exception(
        "[UNHANDLED_ERROR] service=ml-engine requestId=%s method=%s path=%s errorType=%s message=%s",
        request_id,
        request.method,
        request.url.path,
        type(exc).__name__,
        str(exc),
    )
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "statusCode": 500,
            "path": request.url.path,
            "message": "Internal Server Error",
            "data": None,
            "requestId": request_id,
        },
    )


@app.get("/")
async def root(request: Request):
    return {
        "status": "success",
        "statusCode": 200,
        "path": "/",
        "message": "Greenly ML Engine",
        "data": {"service": "ml-engine"},
        "requestId": getattr(request.state, "request_id", None),
    }


app.include_router(health_router)
app.include_router(search_router)
app.include_router(recommendation_router)
app.include_router(eco_router)


@app.on_event("startup")
async def startup():
    catalog_event_consumer.start()
