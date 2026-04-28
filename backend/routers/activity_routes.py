# routers/activity_routes.py

from fastapi import APIRouter, Request, HTTPException

from services.activity_service import get_activity_dashboard

router = APIRouter(
    prefix="/activity",
    tags=["activity"],
)


@router.get("/{wallet_address}/dashboard")
async def activity_dashboard(wallet_address: str, request: Request):
    """
    Returns user activity dashboard data

    Endpoint:
    /api/activity/{wallet_address}/dashboard
    """

    if not wallet_address:
        raise HTTPException(
            status_code=400,
            detail="wallet_address is required",
        )

    db = request.app.state.db

    return await get_activity_dashboard(db, wallet_address)