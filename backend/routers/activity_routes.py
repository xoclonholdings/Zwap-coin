from fastapi import APIRouter, Request, HTTPException

from services.activity_service import get_activity_dashboard

router = APIRouter(
    prefix="/activity",
    tags=["activity"],
)


@router.get("/{email}/dashboard")
async def activity_dashboard(email: str, request: Request):
    """
    Returns V1 user activity dashboard data.

    Identity:
    - email is primary
    - wallet is optional metadata only

    Endpoint:
    /api/activity/{email}/dashboard
    """

    safe_email = str(email or "").lower().strip()

    if not safe_email:
        raise HTTPException(
            status_code=400,
            detail="email is required",
        )

    db = request.app.state.db

    return await get_activity_dashboard(db, safe_email)


@router.get("/dashboard/by-email/{email}")
async def activity_dashboard_by_email(email: str, request: Request):
    safe_email = str(email or "").lower().strip()

    if not safe_email:
        raise HTTPException(
            status_code=400,
            detail="email is required",
        )

    db = request.app.state.db

    return await get_activity_dashboard(db, safe_email)