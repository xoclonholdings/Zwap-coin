# routers/admin_routes.py

from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException, Request
from pydantic import BaseModel

import services.analytics_service as analytics_service
import services.news_service as news_service
import services.reward_service as reward_service
import services.subscription_service as subscription_service
import services.swap_service as swap_service
import services.treasury_service as treasury_service

from routers.admin import admin_router
from routers.admin.common import verify_admin, get_db, get_chain

# Keep compatibility with any old imports
router = admin_router


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
    db = get_db(request)

    return await reward_service.adjust_reward(
        db=db,
        user_id=payload.user_id,
        amount=payload.amount,
        reason=payload.reason,
        is_deduction=payload.is_deduction,
    )

# ===========================
# SWAP CONFIG
# ===========================
@admin_router.get("/config/swap")
async def get_swap_config(request: Request, _: None = Depends(verify_admin)):
    db = get_db(request)
    return await swap_service.get_swap_config(db)


@admin_router.put("/config/swap/{token_symbol}")
async def update_swap_config(
    token_symbol: str,
    config: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
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
    db = get_db(request)
    return await analytics_service.get_overview(db, days=days)


@admin_router.get("/analytics/purchases")
async def purchase_analytics(
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)

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
    db = get_db(request)
    w3, zwap_contract = get_chain(request)
    return await treasury_service.get_treasury_status(db, w3, zwap_contract)


@admin_router.post("/treasury/send")
async def admin_send_zwap(
    request: Request,
    payload: dict,
    _: None = Depends(verify_admin),
):
    db = get_db(request)

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
            "gasPrice": w3.eth.gas_price,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, treasury_private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        tx_hash_hex = w3.to_hex(tx_hash)

        await db.admin_activity.insert_one({
            "type": "treasury_transfer",
            "to": to_address,
            "amount": amount,
            "tx_hash": tx_hash_hex,
            "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
        })

        return {
            "success": True,
            "tx_hash": tx_hash_hex,
            "to": to_address,
            "amount": amount,
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
    db = get_db(request)
    return await news_service.list_news(db, limit=limit)


@admin_router.post("/news")
async def admin_create_news(
    item: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await news_service.create_news(db, item)


@admin_router.delete("/news/{news_id}")
async def admin_delete_news(
    news_id: str,
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
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
    db = get_db(request)

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
    db = get_db(request)

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
    db = get_db(request)

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
    from routers.admin.common import ADMIN_API_KEY
    import routers.admin.common as admin_common

    if payload.current_key != ADMIN_API_KEY:
        raise HTTPException(status_code=400, detail="Current admin key is incorrect")

    if not payload.new_key or len(payload.new_key) < 12:
        raise HTTPException(status_code=400, detail="New key must be at least 12 characters")

    admin_common.ADMIN_API_KEY = payload.new_key

    db = get_db(request)
    existing = await db.configs.find_one({"key": "admin_account_settings"})
    current_value = existing.get("value", {}) if existing else {}

    updated_value = {
        **current_value,
        "key_last_changed": __import__("datetime").datetime.utcnow().isoformat(),
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
    db = get_db(request)
    return await subscription_service.list_subscriptions(db, skip=skip, limit=limit)