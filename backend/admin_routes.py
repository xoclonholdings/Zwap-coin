"""
ZWAP! V1 Admin Routes
=====================

Strict V1 admin controls for:
- Dashboard stats
- User management
- Rewards ledger
- MOVE config
- PLAY config
- SHOP categories/items
- ZWAP Window / Swap config
- Treasury and system config
- Logs, analytics, subscriptions, and admin settings

Security:
Admin routes require X-Admin-Key.
The key is validated against:
1. ADMIN_API_KEY environment variable
2. database-stored admin_key_hash
"""

from fastapi import APIRouter, HTTPException, Header, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import hashlib
import os
import re


admin_router = APIRouter(prefix="/admin", tags=["Admin"])


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def model_to_dict(model: BaseModel) -> Dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump(exclude_unset=True)
    return model.dict(exclude_unset=True)


def normalize_id(value: Optional[str]) -> str:
    if value is None:
        return ""

    normalized = str(value).strip().lower()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    normalized = re.sub(r"-+", "-", normalized)
    normalized = normalized.strip("-")
    return normalized


def remove_none_values(data: Dict[str, Any]) -> Dict[str, Any]:
    return {key: value for key, value in data.items() if value is not None}


async def verify_admin(x_admin_key: str = Header(None)):
    from server import db

    if not x_admin_key:
        raise HTTPException(status_code=401, detail="Admin key required")

    env_admin_key = os.environ.get("ADMIN_API_KEY", "")
    if env_admin_key and x_admin_key == env_admin_key:
        return True

    key_hash = hashlib.sha256(x_admin_key.encode("utf-8")).hexdigest()
    stored_key = await db.admin_settings.find_one({"key": "admin_key_hash"})

    if stored_key and stored_key.get("value") == key_hash:
        return True

    raise HTTPException(status_code=403, detail="Invalid admin key")


async def log_admin_action(
    action: str,
    section: str,
    details: Optional[Dict[str, Any]] = None,
    admin_key: Optional[str] = None,
):
    from server import db

    admin_key_hash = None
    if admin_key:
        admin_key_hash = hashlib.sha256(admin_key.encode("utf-8")).hexdigest()

    await db.admin_logs.insert_one(
        {
            "action": action,
            "section": section,
            "details": details or {},
            "admin_key_hash": admin_key_hash,
            "created_at": now_utc(),
        }
    )


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class ShopCategoryAdmin(BaseModel):
    id: str
    label: str
    description: str = ""
    sort_order: int = 0
    active: bool = True


class ShopItemAdmin(BaseModel):
    id: Optional[str] = None
    name: str
    description: str = ""
    payment_method: str = "zpts"
    price_zpts: Optional[int] = None
    price_zwap: Optional[float] = None
    price_stripe: Optional[float] = None
    image_url: Optional[str] = None
    category: str = "general"
    subcategory: Optional[str] = None
    item_type: Optional[str] = "custom"
    rotation: Optional[str] = "Custom"
    phase: Optional[str] = "Phase A"
    in_stock: bool = True
    active: bool = False
    plus_only: bool = False
    max_quantity: Optional[int] = None
    fulfillment_type: str = "none"
    download_url: Optional[str] = None
    external_url: Optional[str] = None
    fulfillment_notes: Optional[str] = None


class UserUpdate(BaseModel):
    tier: Optional[str] = None
    zpts_balance: Optional[int] = None
    zwap_balance: Optional[float] = None
    active: Optional[bool] = None
    admin_notes: Optional[str] = None


class RewardAdjustment(BaseModel):
    wallet_address: str
    amount: float
    currency: str = Field(default="zpts")
    reason: str


class WalkConfigUpdate(BaseModel):
    min_steps_per_claim: Optional[int] = None
    max_steps_per_claim: Optional[int] = None
    claim_cooldown_seconds: Optional[int] = None
    zwapper_daily_cap: Optional[int] = None
    zitizen_daily_cap: Optional[int] = None
    active: Optional[bool] = None


class GameConfigUpdate(BaseModel):
    game_id: str
    name: str
    active: bool = True
    sort_order: int = 0
    min_reward_zpts: int = 0
    max_reward_zpts: int = 150
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SwapConfigUpdate(BaseModel):
    active: Optional[bool] = None
    phase_locked: Optional[bool] = None
    min_conversion_zpts: Optional[int] = None
    conversion_rate_zpts_per_zwap: Optional[int] = None
    zwapper_daily_conversion_cap: Optional[float] = None
    zitizen_daily_conversion_cap: Optional[float] = None


class SystemConfigUpdate(BaseModel):
    key: str
    value: Any
    description: Optional[str] = None


class SubscriptionPlanUpdate(BaseModel):
    plan_id: str
    name: str
    stripe_price_id: Optional[str] = None
    monthly_price: Optional[float] = None
    active: bool = True
    benefits: Dict[str, Any] = Field(default_factory=dict)


class AdminKeyUpdate(BaseModel):
    new_admin_key: str


# ---------------------------------------------------------------------------
# Shop validation
# ---------------------------------------------------------------------------

def validate_shop_item_payload(
    payload: ShopItemAdmin,
    forced_id: Optional[str] = None,
) -> Dict[str, Any]:
    item = model_to_dict(payload)

    name = str(item.get("name", "")).strip()
    if not name:
        raise HTTPException(status_code=400, detail="Shop item name is required")

    incoming_id = item.get("id") or name
    normalized_item_id = normalize_id(forced_id or incoming_id)

    if not normalized_item_id:
        raise HTTPException(
            status_code=400,
            detail="Shop item id is required or must be buildable from name",
        )

    if forced_id:
        payload_id = normalize_id(item.get("id")) if item.get("id") else normalized_item_id
        if payload_id != normalized_item_id:
            raise HTTPException(status_code=400, detail="Payload id must match URL item id")

    payment_method = str(item.get("payment_method", "zpts")).strip().lower()
    if payment_method not in {"zpts", "zwap", "stripe"}:
        raise HTTPException(
            status_code=400,
            detail="payment_method must be one of: zpts, zwap, stripe",
        )

    price_zpts = item.get("price_zpts")
    price_zwap = item.get("price_zwap")
    price_stripe = item.get("price_stripe")

    if payment_method == "zpts" and (price_zpts is None or int(price_zpts) <= 0):
        raise HTTPException(
            status_code=400,
            detail="price_zpts must be positive when payment_method is zpts",
        )

    if payment_method == "zwap" and (price_zwap is None or float(price_zwap) <= 0):
        raise HTTPException(
            status_code=400,
            detail="price_zwap must be positive when payment_method is zwap",
        )

    if payment_method == "stripe" and (price_stripe is None or float(price_stripe) <= 0):
        raise HTTPException(
            status_code=400,
            detail="price_stripe must be positive when payment_method is stripe",
        )

    category = normalize_id(item.get("category") or "general") or "general"
    subcategory = normalize_id(item.get("subcategory")) if item.get("subcategory") else None

    normalized = {
        **item,
        "id": normalized_item_id,
        "name": name,
        "payment_method": payment_method,
        "category": category,
        "subcategory": subcategory,
        "price_zpts": int(price_zpts) if price_zpts is not None else None,
        "price_zwap": float(price_zwap) if price_zwap is not None else None,
        "price_stripe": float(price_stripe) if price_stripe is not None else None,
    }

    if normalized.get("max_quantity") is not None:
        normalized["max_quantity"] = int(normalized["max_quantity"])
        if normalized["max_quantity"] <= 0:
            raise HTTPException(
                status_code=400,
                detail="max_quantity must be positive when provided",
            )

    return remove_none_values(normalized)


def validate_shop_category_payload(payload: ShopCategoryAdmin) -> Dict[str, Any]:
    category = model_to_dict(payload)
    normalized_id = normalize_id(category.get("id"))

    if not normalized_id:
        raise HTTPException(status_code=400, detail="Category id is required")

    label = str(category.get("label", "")).strip()
    if not label:
        raise HTTPException(status_code=400, detail="Category label is required")

    return {
        "id": normalized_id,
        "label": label,
        "description": category.get("description", ""),
        "sort_order": int(category.get("sort_order", 0)),
        "active": bool(category.get("active", True)),
    }


# ---------------------------------------------------------------------------
# Dashboard Stats
# ---------------------------------------------------------------------------

@admin_router.get("/dashboard/stats", dependencies=[Depends(verify_admin)])
async def get_dashboard_stats():
    from server import db

    today = now_utc().replace(hour=0, minute=0, second=0, microsecond=0)

    total_users = await db.users.count_documents({})
    active_users_today = await db.users.count_documents({"last_active_at": {"$gte": today}})
    shop_items = await db.shop_items.count_documents({})
    active_shop_items = await db.shop_items.count_documents({"active": True, "in_stock": True})

    zpts_pipeline = [
        {"$group": {"_id": None, "total": {"$sum": {"$ifNull": ["$zpts_balance", 0]}}}}
    ]
    zwap_pipeline = [
        {"$group": {"_id": None, "total": {"$sum": {"$ifNull": ["$zwap_balance", 0]}}}}
    ]

    zpts_result = await db.users.aggregate(zpts_pipeline).to_list(length=1)
    zwap_result = await db.users.aggregate(zwap_pipeline).to_list(length=1)

    return {
        "success": True,
        "total_users": total_users,
        "active_users_today": active_users_today,
        "shop_items": shop_items,
        "active_shop_items": active_shop_items,
        "total_zpts_balance": zpts_result[0]["total"] if zpts_result else 0,
        "total_zwap_balance": zwap_result[0]["total"] if zwap_result else 0,
        "updated_at": now_utc(),
    }


@admin_router.get("/stats", dependencies=[Depends(verify_admin)])
async def get_stats_alias():
    return await get_dashboard_stats()


# ---------------------------------------------------------------------------
# User Management
# ---------------------------------------------------------------------------

@admin_router.get("/users", dependencies=[Depends(verify_admin)])
async def list_users(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    search: Optional[str] = None,
):
    from server import db

    query: Dict[str, Any] = {}

    if search:
        search_regex = {"$regex": re.escape(search), "$options": "i"}
        query["$or"] = [
            {"wallet_address": search_regex},
            {"email": search_regex},
            {"username": search_regex},
            {"display_name": search_regex},
        ]

    users = (
        await db.users.find(query, {"_id": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    total = await db.users.count_documents(query)

    return {
        "success": True,
        "total": total,
        "users": users,
    }


@admin_router.get("/users/{wallet_address}", dependencies=[Depends(verify_admin)])
async def get_user(wallet_address: str):
    from server import db

    user = await db.users.find_one({"wallet_address": wallet_address}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "user": user}


@admin_router.put("/users/{wallet_address}", dependencies=[Depends(verify_admin)])
async def update_user(
    wallet_address: str,
    payload: UserUpdate,
    x_admin_key: str = Header(None),
):
    from server import db

    update_data = remove_none_values(model_to_dict(payload))
    if not update_data:
        raise HTTPException(status_code=400, detail="No user fields provided")

    update_data["updated_at"] = now_utc()

    result = await db.users.update_one(
        {"wallet_address": wallet_address},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    await log_admin_action(
        action="update_user",
        section="users",
        details={
            "wallet_address": wallet_address,
            "fields": list(update_data.keys()),
        },
        admin_key=x_admin_key,
    )

    user = await db.users.find_one({"wallet_address": wallet_address}, {"_id": 0})
    return {"success": True, "user": user}


# ---------------------------------------------------------------------------
# Rewards Ledger
# ---------------------------------------------------------------------------

@admin_router.get("/rewards/ledger", dependencies=[Depends(verify_admin)])
async def get_rewards_ledger(
    wallet_address: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
):
    from server import db

    query = {}
    if wallet_address:
        query["wallet_address"] = wallet_address

    rewards = (
        await db.rewards_ledger.find(query, {"_id": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    total = await db.rewards_ledger.count_documents(query)

    return {
        "success": True,
        "total": total,
        "rewards": rewards,
    }


@admin_router.post("/rewards/adjust", dependencies=[Depends(verify_admin)])
async def adjust_reward_balance(
    payload: RewardAdjustment,
    x_admin_key: str = Header(None),
):
    from server import db

    currency = payload.currency.strip().lower()
    if currency not in {"zpts", "zwap"}:
        raise HTTPException(status_code=400, detail="currency must be zpts or zwap")

    user = await db.users.find_one({"wallet_address": payload.wallet_address})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    balance_field = "zpts_balance" if currency == "zpts" else "zwap_balance"

    await db.users.update_one(
        {"wallet_address": payload.wallet_address},
        {
            "$inc": {balance_field: payload.amount},
            "$set": {"updated_at": now_utc()},
        },
    )

    created_at = now_utc()
    ledger_entry = {
        "wallet_address": payload.wallet_address,
        "currency": currency,
        "amount": payload.amount,
        "reason": payload.reason,
        "source": "admin_adjustment",
        "created_at": created_at,
    }

    await db.rewards_ledger.insert_one(dict(ledger_entry))

    await log_admin_action(
        action="adjust_reward_balance",
        section="rewards",
        details={
            "wallet_address": payload.wallet_address,
            "currency": currency,
            "amount": payload.amount,
            "reason": payload.reason,
            "source": "admin_adjustment",
        },
        admin_key=x_admin_key,
    )

    updated_user = await db.users.find_one(
        {"wallet_address": payload.wallet_address},
        {"_id": 0},
    )

    return {
        "success": True,
        "user": updated_user,
        "ledger_entry": ledger_entry,
    }


# ---------------------------------------------------------------------------
# Walk Config
# ---------------------------------------------------------------------------

@admin_router.get("/walk/config", dependencies=[Depends(verify_admin)])
async def get_walk_config():
    from server import db

    config = await db.system_config.find_one({"key": "walk_config"}, {"_id": 0})
    return {
        "success": True,
        "config": config.get("value", {}) if config else {},
    }


@admin_router.put("/walk/config", dependencies=[Depends(verify_admin)])
async def update_walk_config(
    payload: WalkConfigUpdate,
    x_admin_key: str = Header(None),
):
    from server import db

    update_data = remove_none_values(model_to_dict(payload))
    if not update_data:
        raise HTTPException(status_code=400, detail="No MOVE config fields provided")

    await db.system_config.update_one(
        {"key": "walk_config"},
        {
            "$set": {
                "key": "walk_config",
                "value": update_data,
                "updated_at": now_utc(),
            },
            "$setOnInsert": {"created_at": now_utc()},
        },
        upsert=True,
    )

    await log_admin_action(
        action="update_walk_config",
        section="walk_config",
        details=update_data,
        admin_key=x_admin_key,
    )

    return {"success": True, "config": update_data}


# ---------------------------------------------------------------------------
# Games Config
# ---------------------------------------------------------------------------

@admin_router.get("/games/config", dependencies=[Depends(verify_admin)])
async def get_games_config():
    from server import db

    games = (
        await db.games_config.find({}, {"_id": 0})
        .sort("sort_order", 1)
        .to_list(length=500)
    )

    return {"success": True, "games": games}


@admin_router.post("/games/config", dependencies=[Depends(verify_admin)])
async def upsert_game_config(
    payload: GameConfigUpdate,
    x_admin_key: str = Header(None),
):
    from server import db

    game = model_to_dict(payload)
    game["game_id"] = normalize_id(game["game_id"])
    game["updated_at"] = now_utc()

    if not game["game_id"]:
        raise HTTPException(status_code=400, detail="game_id is required")

    await db.games_config.update_one(
        {"game_id": game["game_id"]},
        {
            "$set": game,
            "$setOnInsert": {"created_at": now_utc()},
        },
        upsert=True,
    )

    await log_admin_action(
        action="upsert_game_config",
        section="games_config",
        details={"game_id": game["game_id"]},
        admin_key=x_admin_key,
    )

    saved = await db.games_config.find_one({"game_id": game["game_id"]}, {"_id": 0})
    return {"success": True, "game": saved}


# ---------------------------------------------------------------------------
# Swap Config
# ---------------------------------------------------------------------------

@admin_router.get("/swap/config", dependencies=[Depends(verify_admin)])
async def get_swap_config():
    from server import db

    config = await db.system_config.find_one({"key": "swap_config"}, {"_id": 0})
    return {"success": True, "config": config.get("value", {}) if config else {}}


@admin_router.put("/swap/config", dependencies=[Depends(verify_admin)])
async def update_swap_config(
    payload: SwapConfigUpdate,
    x_admin_key: str = Header(None),
):
    from server import db

    update_data = remove_none_values(model_to_dict(payload))
    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No ZWAP Window / Swap config fields provided",
        )

    await db.system_config.update_one(
        {"key": "swap_config"},
        {
            "$set": {
                "key": "swap_config",
                "value": update_data,
                "updated_at": now_utc(),
            },
            "$setOnInsert": {"created_at": now_utc()},
        },
        upsert=True,
    )

    await log_admin_action(
        action="update_swap_config",
        section="swap_config",
        details=update_data,
        admin_key=x_admin_key,
    )

    return {"success": True, "config": update_data}


# ---------------------------------------------------------------------------
# Shop Admin
# ---------------------------------------------------------------------------

@admin_router.get("/shop/categories", dependencies=[Depends(verify_admin)])
async def get_shop_categories():
    from server import db

    categories = (
        await db.shop_categories.find({}, {"_id": 0})
        .sort("sort_order", 1)
        .to_list(length=500)
    )

    return {
        "success": True,
        "categories": categories,
    }


@admin_router.post("/shop/categories", dependencies=[Depends(verify_admin)])
async def upsert_shop_category(
    payload: ShopCategoryAdmin,
    x_admin_key: str = Header(None),
):
    from server import db

    category = validate_shop_category_payload(payload)
    category["updated_at"] = now_utc()

    await db.shop_categories.update_one(
        {"id": category["id"]},
        {
            "$set": category,
            "$setOnInsert": {"created_at": now_utc()},
        },
        upsert=True,
    )

    saved = await db.shop_categories.find_one({"id": category["id"]}, {"_id": 0})

    await log_admin_action(
        action="upsert_shop_category",
        section="shop",
        details={"category_id": category["id"]},
        admin_key=x_admin_key,
    )

    return {
        "success": True,
        "category": saved,
    }


@admin_router.get("/shop/items", dependencies=[Depends(verify_admin)])
async def get_shop_items():
    from server import db

    items = (
        await db.shop_items.find({}, {"_id": 0})
        .sort([("category", 1), ("name", 1)])
        .to_list(length=1000)
    )

    return {
        "success": True,
        "items": items,
    }


@admin_router.post("/shop/items", dependencies=[Depends(verify_admin)])
async def create_shop_item(
    payload: ShopItemAdmin,
    x_admin_key: str = Header(None),
):
    from server import db

    item = validate_shop_item_payload(payload)
    item["updated_at"] = now_utc()

    await db.shop_items.update_one(
        {"id": item["id"]},
        {
            "$set": item,
            "$setOnInsert": {"created_at": now_utc()},
        },
        upsert=True,
    )

    saved = await db.shop_items.find_one({"id": item["id"]}, {"_id": 0})

    await log_admin_action(
        action="upsert_shop_item",
        section="shop",
        details={"item_id": item["id"], "name": item["name"]},
        admin_key=x_admin_key,
    )

    return {
        "success": True,
        "item": saved,
    }


@admin_router.put("/shop/items/{item_id}", dependencies=[Depends(verify_admin)])
async def update_shop_item(
    item_id: str,
    payload: ShopItemAdmin,
    x_admin_key: str = Header(None),
):
    from server import db

    normalized_item_id = normalize_id(item_id)
    if not normalized_item_id:
        raise HTTPException(status_code=400, detail="Invalid item id")

    existing = await db.shop_items.find_one({"id": normalized_item_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Shop item not found")

    item = validate_shop_item_payload(payload, forced_id=normalized_item_id)
    item["id"] = normalized_item_id
    item["updated_at"] = now_utc()

    await db.shop_items.update_one(
        {"id": normalized_item_id},
        {"$set": item},
    )

    saved = await db.shop_items.find_one({"id": normalized_item_id}, {"_id": 0})

    await log_admin_action(
        action="update_shop_item",
        section="shop",
        details={"item_id": normalized_item_id, "name": item["name"]},
        admin_key=x_admin_key,
    )

    return {
        "success": True,
        "item": saved,
    }


@admin_router.delete("/shop/items/{item_id}", dependencies=[Depends(verify_admin)])
async def delete_shop_item(
    item_id: str,
    x_admin_key: str = Header(None),
):
    from server import db

    normalized_item_id = normalize_id(item_id)
    if not normalized_item_id:
        raise HTTPException(status_code=400, detail="Invalid item id")

    result = await db.shop_items.delete_one({"id": normalized_item_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shop item not found")

    await log_admin_action(
        action="delete_shop_item",
        section="shop",
        details={"item_id": normalized_item_id},
        admin_key=x_admin_key,
    )

    return {
        "success": True,
        "item_id": normalized_item_id,
    }


# ---------------------------------------------------------------------------
# Treasury & System
# ---------------------------------------------------------------------------

@admin_router.get("/treasury", dependencies=[Depends(verify_admin)])
async def get_treasury_status():
    from server import db

    config = await db.system_config.find_one({"key": "treasury"}, {"_id": 0})
    recent_ledger = (
        await db.rewards_ledger.find({}, {"_id": 0})
        .sort("created_at", -1)
        .limit(50)
        .to_list(length=50)
    )

    return {
        "success": True,
        "treasury": config.get("value", {}) if config else {},
        "recent_ledger": recent_ledger,
    }


@admin_router.get("/system/health", dependencies=[Depends(verify_admin)])
async def get_system_health():
    from server import db

    try:
        await db.command("ping")
        mongo_ok = True
    except Exception:
        mongo_ok = False

    return {
        "success": True,
        "database": "ok" if mongo_ok else "error",
        "timestamp": now_utc(),
    }


# ---------------------------------------------------------------------------
# System Config
# ---------------------------------------------------------------------------

@admin_router.get("/system/config", dependencies=[Depends(verify_admin)])
async def get_system_config():
    from server import db

    config = (
        await db.system_config.find({}, {"_id": 0})
        .sort("key", 1)
        .to_list(length=1000)
    )

    return {
        "success": True,
        "config": config,
    }


@admin_router.post("/system/config", dependencies=[Depends(verify_admin)])
async def upsert_system_config(
    payload: SystemConfigUpdate,
    x_admin_key: str = Header(None),
):
    from server import db

    key = normalize_id(payload.key)
    if not key:
        raise HTTPException(status_code=400, detail="Config key is required")

    doc = {
        "key": key,
        "value": payload.value,
        "description": payload.description,
        "updated_at": now_utc(),
    }

    await db.system_config.update_one(
        {"key": key},
        {
            "$set": doc,
            "$setOnInsert": {"created_at": now_utc()},
        },
        upsert=True,
    )

    await log_admin_action(
        action="upsert_system_config",
        section="system_config",
        details={"key": key},
        admin_key=x_admin_key,
    )

    saved = await db.system_config.find_one({"key": key}, {"_id": 0})
    return {
        "success": True,
        "config": saved,
    }


# ---------------------------------------------------------------------------
# Admin Logs
# ---------------------------------------------------------------------------

@admin_router.get("/logs", dependencies=[Depends(verify_admin)])
async def get_admin_logs(
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    section: Optional[str] = None,
):
    from server import db

    query = {}
    if section:
        query["section"] = section

    logs = (
        await db.admin_logs.find(query, {"_id": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    total = await db.admin_logs.count_documents(query)

    return {
        "success": True,
        "total": total,
        "logs": logs,
    }


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------

@admin_router.get("/analytics/overview", dependencies=[Depends(verify_admin)])
async def get_analytics_overview(days: int = Query(30, ge=1, le=365)):
    from server import db

    start_date = now_utc() - timedelta(days=days)

    users_created = await db.users.count_documents({"created_at": {"$gte": start_date}})
    rewards_issued = await db.rewards_ledger.count_documents({"created_at": {"$gte": start_date}})
    shop_purchases = await db.shop_purchases.count_documents({"created_at": {"$gte": start_date}})

    reward_pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        {
            "$group": {
                "_id": "$currency",
                "total_amount": {"$sum": "$amount"},
                "count": {"$sum": 1},
            }
        },
    ]

    reward_totals = await db.rewards_ledger.aggregate(reward_pipeline).to_list(length=20)

    return {
        "success": True,
        "days": days,
        "users_created": users_created,
        "rewards_issued": rewards_issued,
        "shop_purchases": shop_purchases,
        "reward_totals": reward_totals,
        "updated_at": now_utc(),
    }


# ---------------------------------------------------------------------------
# Subscriptions
# ---------------------------------------------------------------------------

@admin_router.get("/subscriptions/plans", dependencies=[Depends(verify_admin)])
async def get_subscription_plans():
    from server import db

    plans = (
        await db.subscription_plans.find({}, {"_id": 0})
        .sort("monthly_price", 1)
        .to_list(length=100)
    )

    return {
        "success": True,
        "plans": plans,
    }


@admin_router.post("/subscriptions/plans", dependencies=[Depends(verify_admin)])
async def upsert_subscription_plan(
    payload: SubscriptionPlanUpdate,
    x_admin_key: str = Header(None),
):
    from server import db

    plan = model_to_dict(payload)
    plan["plan_id"] = normalize_id(plan["plan_id"])

    if not plan["plan_id"]:
        raise HTTPException(status_code=400, detail="plan_id is required")

    plan["updated_at"] = now_utc()

    await db.subscription_plans.update_one(
        {"plan_id": plan["plan_id"]},
        {
            "$set": plan,
            "$setOnInsert": {"created_at": now_utc()},
        },
        upsert=True,
    )

    await log_admin_action(
        action="upsert_subscription_plan",
        section="subscriptions",
        details={"plan_id": plan["plan_id"]},
        admin_key=x_admin_key,
    )

    saved = await db.subscription_plans.find_one({"plan_id": plan["plan_id"]}, {"_id": 0})
    return {
        "success": True,
        "plan": saved,
    }


@admin_router.get("/subscriptions/users", dependencies=[Depends(verify_admin)])
async def get_subscription_users(
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
):
    from server import db

    query = {
        "$or": [
            {"tier": "zitizen"},
            {"subscription_status": {"$exists": True}},
            {"stripe_customer_id": {"$exists": True}},
        ]
    }

    users = (
        await db.users.find(query, {"_id": 0})
        .sort("updated_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    total = await db.users.count_documents(query)

    return {
        "success": True,
        "total": total,
        "users": users,
    }


# ---------------------------------------------------------------------------
# Admin Account Settings
# ---------------------------------------------------------------------------

@admin_router.post("/settings/admin-key", dependencies=[Depends(verify_admin)])
async def update_admin_key(
    payload: AdminKeyUpdate,
    x_admin_key: str = Header(None),
):
    from server import db

    new_key = payload.new_admin_key.strip()
    if len(new_key) < 12:
        raise HTTPException(
            status_code=400,
            detail="Admin key must be at least 12 characters",
        )

    key_hash = hashlib.sha256(new_key.encode("utf-8")).hexdigest()

    await db.admin_settings.update_one(
        {"key": "admin_key_hash"},
        {
            "$set": {
                "key": "admin_key_hash",
                "value": key_hash,
                "updated_at": now_utc(),
            },
            "$setOnInsert": {"created_at": now_utc()},
        },
        upsert=True,
    )

    await log_admin_action(
        action="update_admin_key",
        section="admin_settings",
        details={"updated": True},
        admin_key=x_admin_key,
    )

    return {
        "success": True,
        "message": "Admin key updated",
    }


@admin_router.get("/settings", dependencies=[Depends(verify_admin)])
async def get_admin_settings():
    from server import db

    settings = (
        await db.admin_settings.find({}, {"_id": 0, "value": 0})
        .sort("key", 1)
        .to_list(length=500)
    )

    return {
        "success": True,
        "settings": settings,
    }