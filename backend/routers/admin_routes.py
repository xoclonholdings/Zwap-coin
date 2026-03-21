# routers/admin_routes.py

import os
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

# Direct service imports
import services.analytics_service as analytics_service
import services.config_service as config_service
import services.leaderboard_service as leaderboard_service
import services.marketplace_service as marketplace_service
import services.news_service as news_service
import services.reward_service as reward_service
import services.subscription_service as subscription_service
import services.swap_service as swap_service
import services.treasury_service as treasury_service


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

    treasury = await treasury_service.get_treasury_status(db, w3, zwap_contract)
    analytics = await analytics_service.get_overview(db)

    print("DASHBOARD TREASURY:", treasury)
    print("DASHBOARD ANALYTICS:", analytics)

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
# USERS
# ===========================
      
    

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
# CONFIG – SYSTEM
# ===========================
@admin_router.get("/config/system")
async def get_system_config(request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)

    config = await db.configs.find_one({"key": "system_config"})

    if not config:
        default_config = {
            "maintenance_mode": False,
            "claims_paused": False,
        }

        await db.configs.update_one(
            {"key": "system_config"},
            {"$set": {"value": default_config}},
            upsert=True,
        )

        return default_config

    return config.get("value", {})


@admin_router.put("/config/system")
async def update_system_config(
    config: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)

    await db.configs.update_one(
        {"key": "system_config"},
        {"$set": {"value": config}},
        upsert=True,
    )

    return config


# ===========================
# CONFIG – WALK
# ===========================
@admin_router.get("/config/walk")
async def get_walk_config(request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)
    return await config_service.get_walk_to_earn_config(db)


@admin_router.put("/config/walk")
async def update_walk_config(
    config: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await config_service.update_walk_to_earn_config(db, config)


# ===========================
# CONFIG – GAMES
# ===========================
@admin_router.get("/config/games")
async def get_game_config(request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)
    return await config_service.get_game_config(db)


@admin_router.post("/config/games/{game_id}/toggle")
async def toggle_game_config(
    game_id: str,
    enabled: bool,
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await config_service.update_game_config(db, game_id, {"enabled": enabled})


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

    print("DELETE ITEM ID:", item_id)

    item = await db.shop_items.find_one({"_id": item_id})
    print("FOUND ITEM:", item)

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

@admin_router.get("/analytics/purchases")
async def purchase_analytics(
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)

    purchases = await db.purchases.find({}, {"_id": 0}).to_list(length=None)

    total_purchases = len(purchases)

    total_zwap_spent = sum(
        p.get("price", 0)
        for p in purchases
        if (p.get("currency") or "").lower() == "zwap" and not p.get("refunded", False)
    )

    total_zpts_spent = sum(
        p.get("price", 0)
        for p in purchases
        if (p.get("currency") or "").lower() == "zpts" and not p.get("refunded", False)
    )

    item_counts: Dict[str, int] = {}
    for purchase in purchases:
        if purchase.get("refunded", False):
            continue
        item_name = purchase.get("item_name") or "Unknown Item"
        item_counts[item_name] = item_counts.get(item_name, 0) + 1

    top_items = sorted(
        [{"item_name": name, "count": count} for name, count in item_counts.items()],
        key=lambda x: x["count"],
        reverse=True,
    )[:10]

    return {
        "total_purchases": total_purchases,
        "total_zwap_spent": total_zwap_spent,
        "total_zpts_spent": total_zpts_spent,
        "top_items": top_items,
    }

# ===========================
# TREASURY
# ===========================

@admin_router.get("/treasury")
async def treasury_status(request: Request, _: None = Depends(verify_admin)):
    db = _get_db(request)
    w3, zwap_contract = _get_chain(request)
    return await treasury_service.get_treasury_status(db, w3, zwap_contract)


@admin_router.post("/treasury/send")
async def admin_send_zwap(
    request: Request,
    payload: dict,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)

    w3 = request.app.state.w3
    zwap_contract = request.app.state.zwap_contract
    treasury_wallet = request.app.state.treasury_wallet
    treasury_private_key = request.app.state.treasury_private_key

    if not w3 or not w3.is_connected():
        raise HTTPException(status_code=500, detail="Web3 not connected")

    if not zwap_contract:
        raise HTTPException(status_code=500, detail="ZWAP contract not configured")

    to_address = payload.get("to")
    amount = payload.get("amount")

    if not to_address or not amount:
        raise HTTPException(status_code=400, detail="Missing destination or amount")

    try:
        amount_wei = w3.to_wei(amount, "ether")

        nonce = w3.eth.get_transaction_count(treasury_wallet)

        tx = zwap_contract.functions.transfer(
            to_address,
            amount_wei
        ).build_transaction({
            "from": treasury_wallet,
            "nonce": nonce,
            "gas": 200000,
            "gasPrice": w3.eth.gas_price
        })

        signed_tx = w3.eth.account.sign_transaction(tx, treasury_private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        tx_hash_hex = w3.to_hex(tx_hash)

        await db.admin_activity.insert_one({
            "type": "treasury_transfer",
            "to": to_address,
            "amount": amount,
            "tx_hash": tx_hash_hex,
            "timestamp": datetime.utcnow().isoformat()
        })

        return {
            "success": True,
            "tx_hash": tx_hash_hex,
            "to": to_address,
            "amount": amount
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===========================
# NEWS
# ===========================
@admin_router.get("/news")
async def admin_list_news(
    request: Request,
    limit: int = 50,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await news_service.list_news(db, limit=limit)


@admin_router.post("/news")
async def admin_create_news(
    item: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await news_service.create_news(db, item)


@admin_router.delete("/news/{news_id}")
async def admin_delete_news(
    news_id: str,
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)
    return await news_service.delete_news(db, news_id)

# ===========================
# ADMIN ACTIONS
# ===========================
@admin_router.get("/actions")
async def list_admin_actions(
    request: Request,
    limit: int = 100,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)

    actions = await db.admin_actions.find(
        {},
        {"_id": 0},
    ).sort("created_at", -1).limit(limit).to_list(length=limit)

    return {"actions": actions}
    
# ===========================
# ACCOUNT
# ===========================
class AdminAccountSettingsUpdate(BaseModel):
    admin_email: Optional[str] = None
    notification_enabled: Optional[bool] = True
    two_factor_enabled: Optional[bool] = False


class ChangeAdminKeyRequest(BaseModel):
    current_key: str
    new_key: str


@admin_router.get("/account/settings")
async def get_account_settings(
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)

    config = await db.configs.find_one({"key": "admin_account_settings"})

    if not config:
        default_settings = {
            "admin_email": "",
            "notification_enabled": True,
            "two_factor_enabled": False,
            "last_login": None,
            "key_last_changed": None,
        }

        await db.configs.update_one(
            {"key": "admin_account_settings"},
            {"$set": {"value": default_settings}},
            upsert=True,
        )

        return default_settings

    return config.get("value", {})


@admin_router.put("/account/settings")
async def update_account_settings(
    payload: AdminAccountSettingsUpdate,
    request: Request,
    _: None = Depends(verify_admin),
):
    db = _get_db(request)

    existing = await db.configs.find_one({"key": "admin_account_settings"})
    current_value = existing.get("value", {}) if existing else {}

    updated_value = {
        **current_value,
        "admin_email": payload.admin_email or "",
        "notification_enabled": bool(payload.notification_enabled),
        "two_factor_enabled": bool(payload.two_factor_enabled),
    }

    await db.configs.update_one(
        {"key": "admin_account_settings"},
        {"$set": {"value": updated_value}},
        upsert=True,
    )

    return updated_value


@admin_router.post("/account/change-key")
async def change_admin_key(
    payload: ChangeAdminKeyRequest,
    request: Request,
    _: None = Depends(verify_admin),
):
    global ADMIN_API_KEY

    if payload.current_key != ADMIN_API_KEY:
        raise HTTPException(status_code=400, detail="Current admin key is incorrect")

    if not payload.new_key or len(payload.new_key) < 12:
        raise HTTPException(status_code=400, detail="New key must be at least 12 characters")

    ADMIN_API_KEY = payload.new_key

    db = _get_db(request)
    existing = await db.configs.find_one({"key": "admin_account_settings"})
    current_value = existing.get("value", {}) if existing else {}

    updated_value = {
        **current_value,
        "key_last_changed": datetime.utcnow().isoformat(),
    }

    await db.configs.update_one(
        {"key": "admin_account_settings"},
        {"$set": {"value": updated_value}},
        upsert=True,
    )

    return {"success": True, "message": "Admin key changed successfully"}


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