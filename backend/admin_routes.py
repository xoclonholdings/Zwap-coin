"""
ZWAP! Admin Panel Backend
========================
Comprehensive admin controls for managing users, rewards, games, marketplace, and treasury.

Security: Admin routes require admin authentication via X-Admin-Key header.
"""

from fastapi import APIRouter, HTTPException, Header, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from enum import Enum
import os

# Admin API Router
admin_router = APIRouter(prefix="/admin", tags=["Admin"])

# Admin authentication key (in production, use proper auth)
ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "zwap-admin-secret-2025")

# Dependency for admin authentication
async def verify_admin(x_admin_key: str = Header(None)):
    if x_admin_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid admin key")
    return True

# ============ ENUMS ============

class UserStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"

class RewardSource(str, Enum):
    WALKING = "walking"
    GAME = "game"
    BONUS = "bonus"
    REFERRAL = "referral"
    CONVERSION = "conversion"

class RewardStatus(str, Enum):
    PENDING = "pending"
    EARNED = "earned"
    CLAIMED = "claimed"
    EXPIRED = "expired"
    REVOKED = "revoked"

# ============ MODELS ============

class AdminUserUpdate(BaseModel):
    status: Optional[UserStatus] = None
    tier: Optional[str] = None
    fraud_flags: Optional[List[str]] = None
    notes: Optional[str] = None

class RewardAdjustment(BaseModel):
    user_id: str
    amount: float
    source: RewardSource
    reason: str
    is_deduction: bool = False

class GameConfig(BaseModel):
    game_id: str
    enabled: bool = True
    reward_rate: float = 1.0
    difficulty_multiplier: float = 1.0
    cooldown_minutes: int = 0
    daily_play_limit: int = 0

class WalkConfig(BaseModel):
    daily_step_cap: int = 10000
    steps_per_zwap: int = 1000
    steps_per_zpt: int = 100
    anti_cheat_spike_threshold: int = 5000  # Max steps in 5 minutes
    enabled: bool = True

class MarketplaceItem(BaseModel):
    name: str
    description: str
    image_url: str
    price_zwap: float
    price_zpoints: int
    category: str
    inventory: int = -1  # -1 = unlimited
    enabled: bool = True

class SwapConfig(BaseModel):
    token_symbol: str
    enabled: bool = True
    external_url: str
    min_amount: float = 0
    max_amount: float = 0  # 0 = unlimited

class TreasuryAction(BaseModel):
    action: str  # "pause_claims", "resume_claims", "set_daily_limit"
    value: Optional[Any] = None
    reason: str

class SystemConfig(BaseModel):
    claims_paused: bool = False
    daily_claim_limit: float = 1000000
    maintenance_mode: bool = False
    announcement: Optional[str] = None

# ============ ADMIN ENDPOINTS ============

# --- Dashboard Stats ---
@admin_router.get("/dashboard", dependencies=[Depends(verify_admin)])
async def get_admin_dashboard(db=None):
    """Get admin dashboard overview stats"""
    from server import db as database
    db = database
    
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # User stats
    total_users = await db.users.count_documents({})
    active_today = await db.users.count_documents({"last_active": {"$gte": today_start}})
    active_week = await db.users.count_documents({"last_active": {"$gte": week_ago}})
    plus_users = await db.users.count_documents({"tier": "plus"})
    suspended_users = await db.users.count_documents({"status": "suspended"})
    
    # Rewards stats (from ledger)
    rewards_today = await db.rewards_ledger.aggregate([
        {"$match": {"timestamp": {"$gte": today_start}, "status": "earned"}},
        {"$group": {"_id": None, "total_zwap": {"$sum": "$zwap_amount"}, "total_zpts": {"$sum": "$zpts_amount"}}}
    ]).to_list(1)
    
    claims_today = await db.rewards_ledger.aggregate([
        {"$match": {"timestamp": {"$gte": today_start}, "status": "claimed"}},
        {"$group": {"_id": None, "total": {"$sum": "$zwap_amount"}}}
    ]).to_list(1)
    
    # Game stats
    games_played_today = await db.game_sessions.count_documents({"timestamp": {"$gte": today_start}})
    
    # Get system config
    config = await db.system_config.find_one({"_id": "main"}) or {}
    
    return {
        "users": {
            "total": total_users,
            "active_today": active_today,
            "active_week": active_week,
            "plus_subscribers": plus_users,
            "suspended": suspended_users,
        },
        "rewards": {
            "issued_today_zwap": rewards_today[0]["total_zwap"] if rewards_today else 0,
            "issued_today_zpts": rewards_today[0]["total_zpts"] if rewards_today else 0,
            "claimed_today": claims_today[0]["total"] if claims_today else 0,
        },
        "activity": {
            "games_played_today": games_played_today,
        },
        "system": {
            "claims_paused": config.get("claims_paused", False),
            "maintenance_mode": config.get("maintenance_mode", False),
            "announcement": config.get("announcement"),
        },
        "timestamp": now.isoformat(),
    }


# --- User Management ---
@admin_router.get("/users", dependencies=[Depends(verify_admin)])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    tier: Optional[str] = None,
    search: Optional[str] = None,
):
    """List all users with filtering"""
    from server import db
    
    query = {}
    if status:
        query["status"] = status
    if tier:
        query["tier"] = tier
    if search:
        query["$or"] = [
            {"wallet_address": {"$regex": search, "$options": "i"}},
            {"username": {"$regex": search, "$options": "i"}},
        ]
    
    users = await db.users.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    return {"users": users, "total": total, "skip": skip, "limit": limit}


@admin_router.get("/users/{wallet_address}", dependencies=[Depends(verify_admin)])
async def get_user_details(wallet_address: str):
    """Get detailed user information"""
    from server import db
    
    user = await db.users.find_one({"wallet_address": wallet_address}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get rewards history
    rewards = await db.rewards_ledger.find(
        {"user_id": wallet_address}
    ).sort("timestamp", -1).limit(50).to_list(50)
    
    # Get game history
    games = await db.game_sessions.find(
        {"wallet_address": wallet_address}
    ).sort("timestamp", -1).limit(20).to_list(20)
    
    # Clean up _id fields
    for r in rewards:
        r.pop("_id", None)
    for g in games:
        g.pop("_id", None)
    
    return {
        "user": user,
        "rewards_history": rewards,
        "game_history": games,
    }


@admin_router.put("/users/{wallet_address}", dependencies=[Depends(verify_admin)])
async def update_user(wallet_address: str, update: AdminUserUpdate):
    """Update user status, tier, or add fraud flags"""
    from server import db
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.users.update_one(
        {"wallet_address": wallet_address},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log admin action
    await db.admin_logs.insert_one({
        "action": "user_update",
        "target": wallet_address,
        "changes": update_data,
        "timestamp": datetime.now(timezone.utc),
    })
    
    return {"success": True, "message": f"User {wallet_address} updated"}


@admin_router.post("/users/{wallet_address}/suspend", dependencies=[Depends(verify_admin)])
async def suspend_user(wallet_address: str, reason: str = ""):
    """Suspend a user account"""
    from server import db
    
    result = await db.users.update_one(
        {"wallet_address": wallet_address},
        {"$set": {"status": "suspended", "suspended_at": datetime.now(timezone.utc), "suspend_reason": reason}}
    )
    
    await db.admin_logs.insert_one({
        "action": "user_suspended",
        "target": wallet_address,
        "reason": reason,
        "timestamp": datetime.now(timezone.utc),
    })
    
    return {"success": True, "message": f"User {wallet_address} suspended"}


@admin_router.post("/users/{wallet_address}/unsuspend", dependencies=[Depends(verify_admin)])
async def unsuspend_user(wallet_address: str):
    """Unsuspend a user account"""
    from server import db
    
    await db.users.update_one(
        {"wallet_address": wallet_address},
        {"$set": {"status": "active"}, "$unset": {"suspended_at": "", "suspend_reason": ""}}
    )
    
    return {"success": True, "message": f"User {wallet_address} unsuspended"}


# --- Rewards Ledger ---
@admin_router.get("/rewards/ledger", dependencies=[Depends(verify_admin)])
async def get_rewards_ledger(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    source: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """Get rewards ledger with filtering - append-only audit trail"""
    from server import db
    
    query = {}
    if user_id:
        query["user_id"] = user_id
    if source:
        query["source"] = source
    if status:
        query["status"] = status
    if start_date:
        query["timestamp"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date:
        query.setdefault("timestamp", {})["$lte"] = datetime.fromisoformat(end_date)
    
    ledger = await db.rewards_ledger.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.rewards_ledger.count_documents(query)
    
    # Aggregates
    agg = await db.rewards_ledger.aggregate([
        {"$match": query},
        {"$group": {
            "_id": None,
            "total_zwap": {"$sum": "$zwap_amount"},
            "total_zpts": {"$sum": "$zpts_amount"},
        }}
    ]).to_list(1)
    
    return {
        "ledger": ledger,
        "total_entries": total,
        "totals": agg[0] if agg else {"total_zwap": 0, "total_zpts": 0},
        "skip": skip,
        "limit": limit,
    }


@admin_router.post("/rewards/adjust", dependencies=[Depends(verify_admin)])
async def adjust_rewards(adjustment: RewardAdjustment):
    """Manually adjust user rewards (with audit trail)"""
    from server import db
    
    user = await db.users.find_one({"wallet_address": adjustment.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    amount = -adjustment.amount if adjustment.is_deduction else adjustment.amount
    
    # Update user balance
    await db.users.update_one(
        {"wallet_address": adjustment.user_id},
        {"$inc": {"zwap_balance": amount}}
    )
    
    # Record in ledger (immutable)
    await db.rewards_ledger.insert_one({
        "user_id": adjustment.user_id,
        "zwap_amount": amount,
        "zpts_amount": 0,
        "source": "admin_adjustment",
        "status": "earned",
        "reason": adjustment.reason,
        "timestamp": datetime.now(timezone.utc),
        "is_adjustment": True,
    })
    
    await db.admin_logs.insert_one({
        "action": "reward_adjustment",
        "target": adjustment.user_id,
        "amount": amount,
        "reason": adjustment.reason,
        "timestamp": datetime.now(timezone.utc),
    })
    
    return {"success": True, "new_balance": user["zwap_balance"] + amount}


# --- Walk-to-Earn Config ---
@admin_router.get("/config/walk", dependencies=[Depends(verify_admin)])
async def get_walk_config():
    """Get walk-to-earn configuration"""
    from server import db
    
    config = await db.system_config.find_one({"_id": "walk_config"})
    if not config:
        config = WalkConfig().dict()
    else:
        config.pop("_id", None)
    
    return config


@admin_router.put("/config/walk", dependencies=[Depends(verify_admin)])
async def update_walk_config(config: WalkConfig):
    """Update walk-to-earn configuration"""
    from server import db
    
    await db.system_config.update_one(
        {"_id": "walk_config"},
        {"$set": config.dict()},
        upsert=True
    )
    
    await db.admin_logs.insert_one({
        "action": "walk_config_update",
        "changes": config.dict(),
        "timestamp": datetime.now(timezone.utc),
    })
    
    return {"success": True, "config": config.dict()}


# --- Games Config ---
@admin_router.get("/config/games", dependencies=[Depends(verify_admin)])
async def get_games_config():
    """Get all games configuration"""
    from server import db
    
    games = await db.game_configs.find({}, {"_id": 0}).to_list(100)
    
    # Default games if none exist
    if not games:
        games = [
            {"game_id": "zbrickles", "name": "zBrickles", "enabled": True, "reward_rate": 1.0, "difficulty_multiplier": 1.0, "tier_required": "starter"},
            {"game_id": "ztrivia", "name": "zTrivia", "enabled": True, "reward_rate": 1.0, "difficulty_multiplier": 1.0, "tier_required": "starter"},
            {"game_id": "ztetris", "name": "zTetris", "enabled": True, "reward_rate": 1.2, "difficulty_multiplier": 1.0, "tier_required": "plus"},
            {"game_id": "zslots", "name": "zSlots", "enabled": True, "reward_rate": 1.5, "difficulty_multiplier": 1.0, "tier_required": "plus"},
        ]
    
    return {"games": games}


@admin_router.put("/config/games/{game_id}", dependencies=[Depends(verify_admin)])
async def update_game_config(game_id: str, config: GameConfig):
    """Update a game's configuration"""
    from server import db
    
    await db.game_configs.update_one(
        {"game_id": game_id},
        {"$set": config.dict()},
        upsert=True
    )
    
    return {"success": True, "game_id": game_id}


@admin_router.post("/config/games/{game_id}/toggle", dependencies=[Depends(verify_admin)])
async def toggle_game(game_id: str, enabled: bool):
    """Enable or disable a game instantly"""
    from server import db
    
    await db.game_configs.update_one(
        {"game_id": game_id},
        {"$set": {"enabled": enabled}},
        upsert=True
    )
    
    return {"success": True, "game_id": game_id, "enabled": enabled}


# --- Marketplace Admin ---
@admin_router.get("/marketplace/items", dependencies=[Depends(verify_admin)])
async def get_marketplace_items():
    """Get all marketplace items"""
    from server import db
    
    items = await db.shop_items.find({}, {"_id": 0}).to_list(200)
    return {"items": items, "total": len(items)}


@admin_router.post("/marketplace/items", dependencies=[Depends(verify_admin)])
async def create_marketplace_item(item: MarketplaceItem):
    """Create a new marketplace item"""
    from server import db
    import uuid
    
    item_data = item.dict()
    item_data["id"] = str(uuid.uuid4())
    item_data["created_at"] = datetime.now(timezone.utc)
    
    await db.shop_items.insert_one(item_data)
    
    return {"success": True, "item_id": item_data["id"]}


@admin_router.put("/marketplace/items/{item_id}", dependencies=[Depends(verify_admin)])
async def update_marketplace_item(item_id: str, item: MarketplaceItem):
    """Update a marketplace item"""
    from server import db
    
    result = await db.shop_items.update_one(
        {"id": item_id},
        {"$set": item.dict()}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"success": True}


@admin_router.delete("/marketplace/items/{item_id}", dependencies=[Depends(verify_admin)])
async def delete_marketplace_item(item_id: str):
    """Delete a marketplace item"""
    from server import db
    
    await db.shop_items.delete_one({"id": item_id})
    return {"success": True}


@admin_router.get("/marketplace/purchases", dependencies=[Depends(verify_admin)])
async def get_purchase_logs(skip: int = 0, limit: int = 100):
    """Get purchase logs"""
    from server import db
    
    purchases = await db.purchases.find({}, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.purchases.count_documents({})
    
    return {"purchases": purchases, "total": total}


# --- Swap Config ---
@admin_router.get("/config/swap", dependencies=[Depends(verify_admin)])
async def get_swap_config():
    """Get swap configuration"""
    from server import db
    
    config = await db.swap_configs.find({}, {"_id": 0}).to_list(20)
    
    if not config:
        config = [
            {"token_symbol": "USDC", "enabled": True, "external_url": "https://jumper.exchange"},
            {"token_symbol": "USDT", "enabled": True, "external_url": "https://jumper.exchange"},
            {"token_symbol": "MATIC", "enabled": True, "external_url": "https://jumper.exchange"},
            {"token_symbol": "WETH", "enabled": True, "external_url": "https://jumper.exchange"},
        ]
    
    return {"tokens": config}


@admin_router.put("/config/swap/{token_symbol}", dependencies=[Depends(verify_admin)])
async def update_swap_config(token_symbol: str, config: SwapConfig):
    """Update swap config for a token"""
    from server import db
    
    await db.swap_configs.update_one(
        {"token_symbol": token_symbol},
        {"$set": config.dict()},
        upsert=True
    )
    
    return {"success": True}


# --- Treasury & System ---
@admin_router.get("/treasury", dependencies=[Depends(verify_admin)])
async def get_treasury_status():
    """Get treasury status (read-only)"""
    from server import db, w3, zwap_contract, ZWAP_DECIMALS
    
    # Get on-chain treasury balance if connected
    treasury_balance = None
    treasury_wallet = os.environ.get("TREASURY_WALLET")
    
    if treasury_wallet and zwap_contract and w3:
        try:
            from web3 import Web3
            balance_wei = zwap_contract.functions.balanceOf(
                Web3.to_checksum_address(treasury_wallet)
            ).call()
            treasury_balance = balance_wei / (10 ** ZWAP_DECIMALS)
        except:
            pass
    
    # Get total issued from ledger
    total_issued = await db.rewards_ledger.aggregate([
        {"$match": {"status": {"$in": ["earned", "claimed"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$zwap_amount"}}}
    ]).to_list(1)
    
    # Get total claimed
    total_claimed = await db.rewards_ledger.aggregate([
        {"$match": {"status": "claimed"}},
        {"$group": {"_id": None, "total": {"$sum": "$zwap_amount"}}}
    ]).to_list(1)
    
    # Get system config
    config = await db.system_config.find_one({"_id": "main"}) or {}
    
    return {
        "treasury_wallet": treasury_wallet,
        "treasury_balance": treasury_balance,
        "total_issued": total_issued[0]["total"] if total_issued else 0,
        "total_claimed": total_claimed[0]["total"] if total_claimed else 0,
        "circulating_in_app": (total_issued[0]["total"] if total_issued else 0) - (total_claimed[0]["total"] if total_claimed else 0),
        "claims_paused": config.get("claims_paused", False),
        "daily_claim_limit": config.get("daily_claim_limit", 1000000),
    }


@admin_router.post("/treasury/action", dependencies=[Depends(verify_admin)])
async def treasury_action(action: TreasuryAction):
    """Execute treasury control action (pause, resume, set limits)"""
    from server import db
    
    if action.action == "pause_claims":
        await db.system_config.update_one(
            {"_id": "main"},
            {"$set": {"claims_paused": True}},
            upsert=True
        )
    elif action.action == "resume_claims":
        await db.system_config.update_one(
            {"_id": "main"},
            {"$set": {"claims_paused": False}},
            upsert=True
        )
    elif action.action == "set_daily_limit":
        await db.system_config.update_one(
            {"_id": "main"},
            {"$set": {"daily_claim_limit": action.value}},
            upsert=True
        )
    else:
        raise HTTPException(status_code=400, detail="Unknown action")
    
    await db.admin_logs.insert_one({
        "action": f"treasury_{action.action}",
        "value": action.value,
        "reason": action.reason,
        "timestamp": datetime.now(timezone.utc),
    })
    
    return {"success": True, "action": action.action}


# --- System Config ---
@admin_router.get("/config/system", dependencies=[Depends(verify_admin)])
async def get_system_config():
    """Get system configuration"""
    from server import db
    
    config = await db.system_config.find_one({"_id": "main"}) or {}
    config.pop("_id", None)
    
    return config


@admin_router.put("/config/system", dependencies=[Depends(verify_admin)])
async def update_system_config(config: SystemConfig):
    """Update system configuration"""
    from server import db
    
    await db.system_config.update_one(
        {"_id": "main"},
        {"$set": config.dict()},
        upsert=True
    )
    
    return {"success": True}


# --- Admin Logs ---
@admin_router.get("/logs", dependencies=[Depends(verify_admin)])
async def get_admin_logs(skip: int = 0, limit: int = 100):
    """Get admin action logs"""
    from server import db
    
    logs = await db.admin_logs.find({}, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.admin_logs.count_documents({})
    
    return {"logs": logs, "total": total}


# --- Analytics ---
@admin_router.get("/analytics/overview", dependencies=[Depends(verify_admin)])
async def get_analytics_overview(days: int = 30):
    """Get analytics overview"""
    from server import db
    
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=days)
    
    # Daily active users over time
    dau_pipeline = [
        {"$match": {"last_active": {"$gte": start_date}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$last_active"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    dau_data = await db.users.aggregate(dau_pipeline).to_list(days)
    
    # Rewards issued over time
    rewards_pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
            "zwap": {"$sum": "$zwap_amount"},
            "zpts": {"$sum": "$zpts_amount"}
        }},
        {"$sort": {"_id": 1}}
    ]
    rewards_data = await db.rewards_ledger.aggregate(rewards_pipeline).to_list(days)
    
    # Top earners (potential whale risk)
    top_earners = await db.users.find(
        {}, {"_id": 0, "wallet_address": 1, "username": 1, "zwap_balance": 1, "total_earned": 1}
    ).sort("zwap_balance", -1).limit(10).to_list(10)
    
    # Abuse flags
    flagged_users = await db.users.count_documents({"fraud_flags": {"$exists": True, "$ne": []}})
    
    return {
        "period_days": days,
        "dau_trend": dau_data,
        "rewards_trend": rewards_data,
        "top_earners": top_earners,
        "flagged_users": flagged_users,
    }


# --- Subscriptions ---
@admin_router.get("/subscriptions", dependencies=[Depends(verify_admin)])
async def get_subscriptions(skip: int = 0, limit: int = 50):
    """Get subscription data"""
    from server import db
    
    plus_users = await db.users.find(
        {"tier": "plus"},
        {"_id": 0, "wallet_address": 1, "username": 1, "tier": 1, "subscription_started": 1}
    ).skip(skip).limit(limit).to_list(limit)
    
    total = await db.users.count_documents({"tier": "plus"})
    
    return {"subscriptions": plus_users, "total": total}
