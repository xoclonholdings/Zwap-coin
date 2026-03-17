from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid

from services.reward_service import get_daily_reward

user_router = APIRouter(tags=["User"])


class UserCreate(BaseModel):
    wallet_address: str


class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    wallet_address: str
    zwap_balance: float = 0.0
    zpts_balance: int = 0
    daily_streak: int = 0
    last_daily_claim: Optional[str] = None
    tier: str = "starter"
    subscription_id: Optional[str] = None
    subscription_status: Optional[str] = None
    total_steps: int = 0
    daily_steps: int = 0
    daily_zpts_earned: int = 0
    last_zpts_reset: Optional[str] = None
    games_played: int = 0
    total_earned: float = 0.0
    created_at: str


@user_router.post("/connect", response_model=UserResponse)
async def connect_wallet(user_data: UserCreate, request: Request):
    """Connect wallet and create/get user."""
    db = request.app.state.db
    wallet = user_data.wallet_address.lower()

    try:
        existing = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
        if existing:
            return UserResponse(**existing)

        now_iso = datetime.now(timezone.utc).isoformat()
        new_user = {
            "id": str(uuid.uuid4()),
            "wallet_address": wallet,
            "zwap_balance": 100.0,
            "zpts_balance": 0,
            "tier": "starter",
            "subscription_id": None,
            "subscription_status": None,
            "total_steps": 0,
            "daily_steps": 0,
            "daily_zpts_earned": 0,
            "daily_streak": 0,
            "last_daily_claim": None,
            "last_zpts_reset": now_iso,
            "games_played": 0,
            "total_earned": 100.0,
            "created_at": now_iso,
        }

        await db.users.insert_one(new_user)
        return UserResponse(**new_user)

    except Exception:
        now_iso = datetime.now(timezone.utc).isoformat()
        fallback_user = {
            "id": str(uuid.uuid4()),
            "wallet_address": wallet,
            "zwap_balance": 100.0,
            "zpts_balance": 0,
            "tier": "starter",
            "subscription_id": None,
            "subscription_status": None,
            "total_steps": 0,
            "daily_steps": 0,
            "daily_zpts_earned": 0,
            "daily_streak": 0,
            "last_daily_claim": None,
            "last_zpts_reset": now_iso,
            "games_played": 0,
            "total_earned": 100.0,
            "created_at": now_iso,
        }
        return UserResponse(**fallback_user)


@user_router.get("/{wallet_address}", response_model=UserResponse)
async def get_user(wallet_address: str, request: Request):
    db = request.app.state.db
    wallet = wallet_address.lower()

    user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)


@user_router.get("/rewards/status/{wallet_address}")
async def get_daily_reward_status(wallet_address: str, request: Request):
    db = request.app.state.db
    wallet = wallet_address.lower()

    user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    streak = user.get("daily_streak", 0)
    last_claim = user.get("last_daily_claim")
    now = datetime.now(timezone.utc)
    can_claim = True

    if not last_claim:
        projected_streak = 1
    else:
        last_claim_dt = datetime.fromisoformat(last_claim.replace("Z", "+00:00"))
        elapsed = now - last_claim_dt

        if elapsed < timedelta(hours=24):
            can_claim = False
            projected_streak = streak
        elif elapsed < timedelta(hours=48):
            projected_streak = streak + 1
        else:
            projected_streak = 1

    next_reward = get_daily_reward(projected_streak)

    return {
        "daily_streak": streak,
        "can_claim": can_claim,
        "next_reward_zpts": next_reward,
        "last_daily_claim": last_claim,
    }


@user_router.post("/rewards/daily/{wallet_address}")
async def claim_daily_reward(wallet_address: str, request: Request):
    db = request.app.state.db
    wallet = wallet_address.lower()

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.now(timezone.utc)
    streak = user.get("daily_streak", 0)
    last_claim = user.get("last_daily_claim")

    if last_claim:
        last_claim_dt = datetime.fromisoformat(last_claim.replace("Z", "+00:00"))
        elapsed = now - last_claim_dt

        if elapsed < timedelta(hours=24):
            raise HTTPException(status_code=400, detail="Daily reward already claimed")

        if elapsed < timedelta(hours=48):
            new_streak = streak + 1
        else:
            new_streak = 1
    else:
        new_streak = 1

    reward_amount = get_daily_reward(new_streak)

    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$set": {
                "daily_streak": new_streak,
                "last_daily_claim": now.isoformat(),
            },
            "$inc": {
                "zpts_balance": reward_amount,
            },
        },
    )

    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})

    return {
        "success": True,
        "daily_streak": updated_user.get("daily_streak", new_streak),
        "reward_zpts": reward_amount,
        "new_zpts_balance": updated_user.get("zpts_balance", 0),
        "last_daily_claim": updated_user.get("last_daily_claim"),
        "message": f"Claimed {reward_amount} zPts daily reward",
    }


# Export canonical name expected by server.py
router = user_router