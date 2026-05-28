from fastapi import APIRouter, Request

from app.core.eco_score import calculate_eco_score
from app.schemas import EcoScoreRequest

router = APIRouter(prefix="/eco")


@router.post("/score")
async def eco_score(request: Request, payload: EcoScoreRequest):
    result = calculate_eco_score(payload)
    return {
        "status": "success",
        "statusCode": 200,
        "path": request.url.path,
        "message": "success",
        "data": result.model_dump(),
    }
