from fastapi import APIRouter, Query, Request
from .activity_service import get_activity_stream_for_user

router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("/stream/{wallet_address}")
async def get_activity_stream(
    request: Request,
    wallet_address: str,
    limit: int = Query(default=8, ge=1, le=20),
):
    db = request.app.state.db

    return await get_activity_stream_for_user(
        db=db,
        wallet_address=wallet_address,
        limit=limit,
    )