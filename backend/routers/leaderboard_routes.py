from fastapi import APIRouter, HTTPException, Request, Query

from services.leaderboard_service import (
    get_global_stats_and_top,
    get_user_rank,
    get_top_leaderboard,
    get_leaderboard_overview,
)

leaderboard_router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@leaderboard_router.get("/overview")
async def leaderboard_overview(request: Request):
    """
    Dashboard-friendly overview across core leaderboard categories.
    Future use:
    - homepage ticker
    - admin analytics snapshot
    - leaderboard landing page
    """
    db = request.app.state.db
    return await get_leaderboard_overview(db)


@leaderboard_router.get("/stats")
async def leaderboard_stats(
    request: Request,
    category: str = Query("earned", pattern="^(steps|games|earned|zpts)$"),
    limit: int = Query(10, ge=1, le=100),
):
    """
    Returns stats + top users for a selected category.
    Backward-friendly replacement for the old /leaderboard/stats behavior.
    """
    db = request.app.state.db
    try:
        return await get_global_stats_and_top(
            db=db,
            category=category,
            limit=limit,
            include_anonymized_name=True,
            include_wallet_preview=True,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@leaderboard_router.get("/user/{wallet_address}/{category}")
async def leaderboard_user_rank(
    request: Request,
    wallet_address: str,
    category: str,
    neighbors: int = Query(0, ge=0, le=10),
):
    """
    Returns a user's rank information for a given category.
    Supports optional nearby neighbor entries for future UI use.
    """
    db = request.app.state.db
    try:
        result = await get_user_rank(
            db=db,
            wallet_address=wallet_address.lower(),
            category=category,
            include_neighbors=neighbors,
            include_anonymized_name=True,
        )
        if not result.get("found"):
            raise HTTPException(status_code=404, detail="User not found")
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@leaderboard_router.get("/{category}")
async def leaderboard_by_category(
    request: Request,
    category: str,
    limit: int = Query(10, ge=1, le=100),
):
    """
    Returns top leaderboard entries only.
    Matches the current server.py leaderboard list route shape closely.
    """
    db = request.app.state.db
    try:
        return await get_top_leaderboard(
            db=db,
            category=category,
            limit=limit,
            include_anonymized_name=True,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Export canonical name expected by server.py
router = leaderboard_router