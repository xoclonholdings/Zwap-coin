from datetime import datetime
from typing import Dict, Optional

from fastapi import Depends, HTTPException, Request
from pydantic import BaseModel

import services.reward_service as reward_service
import services.subscription_service as subscription_service

from routers.admin import admin_router
from routers.admin.common import verify_admin, get_db
import routers.admin.common as admin_common

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
    if payload.current_key != admin_common.ADMIN_API_KEY:
        raise HTTPException(status_code=400, detail="Current admin key is incorrect")

    if not payload.new_key or len(payload.new_key) < 12:
        raise HTTPException(status_code=400, detail="New key must be at least 12 characters")

    admin_common.ADMIN_API_KEY = payload.new_key

    db = get_db(request)
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
    db = get_db(request)
    return await subscription_service.list_subscriptions(db, skip=skip, limit=limit)