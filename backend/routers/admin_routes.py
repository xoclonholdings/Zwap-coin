# backend/routers/admin_routes.py

import os
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

# 🔒 Direct service imports (no package aggregator)
import backend.services.analytics_service as analytics_service
import backend.services.config_service as config_service
import backend.services.leaderboard_service as leaderboard_service
import backend.services.marketplace_service as marketplace_service
import backend.services.news_service as news_service
import backend.services.reward_service as reward_service
import backend.services.subscription_service as subscription_service
import backend.services.swap_service as swap_service
import backend.services.treasury_service as treasury_service

# ===========================
# ROUTER
# ===========================
admin_router = APIRouter(prefix="/admin", tags=["Admin"])

# What server.py expects
router = admin_router

ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY")


# ===========================
# AUTH
# ===========================
def verify_admin(request: Request) -> None:
    key = request.headers.get("X-Admin-Key")
    if not ADMIN_API_KEY or key != ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")


def _get_db(request: Request):
    db = getattr(request.app.state, "db", None)
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return db


def _get_chain(request: Request):
    w3 = getattr(request.app.state, "w3", None)
    zwap_contract = getattr(request.app.state, "zwap_contract", None)
    return w3, zwap_contract


# ===========================
# DASHBOARD
# ===========================
@admin_router.get("/dashboard")
async def dashboard(request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)
    w3, zwap_contract = _get_chain(request)

    treasury = await treasury_service.get_status(db, w3, zwap_contract)
    analytics = await analytics_service.get_overview(db)

    leaderboard = await leaderboard_service.get_global_stats_and_top(
        db, category="earned", limit=50
    )

    news = await news_service.list_news(db, limit=25)

    return {
        "treasury": treasury,
        "analytics": analytics,
        "leaderboard": leaderboard,
        "news": news,
    }


# ===========================
# REWARD ADJUSTMENT
# ===========================
class RewardAdjustRequest(BaseModel):
    user_id: str
    amount: float
    reason: Optional[str] = None
    is_deduction: bool = False


@admin_router.post("/rewards/adjust")
async def adjust_reward(
    payload: RewardAdjustRequest,
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)

    return await reward_service.adjust_reward(
        db=db,
        user_id=payload.user_id,
        amount=payload.amount,
        reason=payload.reason,
        is_deduction=payload.is_deduction,
    )


# ===========================
# CONFIG – WALK
# ===========================
@admin_router.get("/config/walk")
async def get_walk_config(request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)
    return await config_service.get_walk_config(db)


@admin_router.put("/config/walk")
async def update_walk_config(
    config: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await config_service.update_walk_config(db, config)


# ===========================
# CONFIG – GAMES
# ===========================
@admin_router.get("/config/games")
async def get_games_config(request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)
    return await config_service.get_games_config(db)


@admin_router.put("/config/games/{game_id}")
async def update_game_config(
    game_id: str,
    config: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await config_service.update_game_config(db, game_id, config)


# ===========================
# MARKETPLACE
# ===========================
@admin_router.get("/marketplace/items")
async def list_marketplace_items(request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)
    return await marketplace_service.list_items(db)


@admin_router.post("/marketplace/items")
async def create_marketplace_item(
    item: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await marketplace_service.create_item(db, item)


@admin_router.put("/marketplace/items/{item_id}")
async def update_marketplace_item(
    item_id: str,
    item: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await marketplace_service.update_item(db, item_id, item)


@admin_router.delete("/marketplace/items/{item_id}")
async def delete_marketplace_item(
    item_id: str,
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await marketplace_service.delete_item(db, item_id)


# ===========================
# SWAP CONFIG
# ===========================
@admin_router.get("/config/swap")
async def get_swap_config(request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)
    return await swap_service.get_swap_config(db)


@admin_router.put("/config/swap/{token_symbol}")
async def update_swap_config(
    token_symbol: str,
    config: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await swap_service.update_swap_config(db, token_symbol, config)


# ===========================
# ANALYTICS
# ===========================
@admin_router.get("/analytics/overview")
async def analytics_overview(
    request: Request,
    days: int = 30,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await analytics_service.get_overview(db, days=days)


# ===========================
# TREASURY
# ===========================
@admin_router.get("/treasury")
async def treasury_status(request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)
    w3, zwap_contract = _get_chain(request)
    return await treasury_service.get_status(db, w3, zwap_contract)


# ===========================
# NEWS
# ===========================
@admin_router.get("/news")
async def admin_list_news(request: Request, limit: int = 50, _: None = Depends(verify_admin)):
    db = _get_db(request)
    return await news_service.list_news(db, limit=limit)


@admin_router.post("/news")
async def admin_create_news(item: Dict[str, Any], request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)
    return await news_service.create_news(db, item)


@admin_router.delete("/news/{news_id}")
async def admin_delete_news(news_id: str, request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)
    return await news_service.delete_news(db, news_id)


# ===========================
# SUBSCRIPTIONS
# ===========================
@admin_router.get("/subscriptions")
async def admin_list_subscriptions(
    request: Request,
    skip: int = 0,
    limit: int = 50,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await subscription_service.list_subscriptions(db, skip=skip, limit=limit)
