from fastapi import APIRouter, Depends, Request

import services.analytics_service as analytics_service
import services.leaderboard_service as leaderboard_service
import services.news_service as news_service
import services.treasury_service as treasury_service

from .common import verify_admin, get_db, get_chain

router = APIRouter()


@router.get("/dashboard")
async def dashboard(request: Request, _: None = Depends(verify_admin)):
    db = get_db(request)
    w3, zwap_contract = get_chain(request)

    treasury = await treasury_service.get_treasury_status(db, w3, zwap_contract)
    analytics = await analytics_service.get_overview(db)

    leaderboard = await leaderboard_service.get_global_stats_and_top(
        db,
        category="earned",
        limit=50,
    )

    news = await news_service.list_news(db, limit=25)

    return {
        "treasury": treasury,
        "analytics": analytics,
        "leaderboard": leaderboard,
        "news": news,
    }