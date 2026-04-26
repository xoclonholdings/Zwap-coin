from datetime import datetime, timezone
from typing import Optional
import hashlib
import uuid

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict

user_router = APIRouter(prefix="/users", tags=["User"])


class UserCreate(BaseModel):
    wallet_address: str


class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    wallet_address: str
    username: str
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
    games_played_today: int = 0
    total_earned: float = 0.0
    created_at: str


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def generate_username(wallet_address: str = "") -> str:
    safe_wallet = str(wallet_address or "").lower().strip()

    if not safe_wallet:
        return f"Zwapper-{str(uuid.uuid4())[:6].upper()}"

    digest = hashlib.sha256(safe_wallet.encode("utf-8")).hexdigest()
    return f"Zwapper-{digest[:6].upper()}"


async def persist_missing_username(db, user: dict) -> dict:
    if not user.get("username"):
        generated = generate_username(user.get("wallet_address", ""))

        await db.users.update_one(
            {"wallet_address": user["wallet_address"]},
            {"$set": {"username": generated}},
        )

        user["username"] = generated

    return user


def build_new_user(wallet: str) -> dict:
    now_iso = utc_now_iso()

    return {
        "id": str(uuid.uuid4()),
        "wallet_address": wallet,
        "username": generate_username(wallet),

        # balances
        "zwap_balance": 0.0,
        "zpts_balance": 0,
        "total_earned": 0.0,

        # tier / subscription
        "tier": "starter",
        "subscription_id": None,
        "subscription_status": None,

        # movement
        "total_steps": 0,
        "daily_steps": 0,
        "daily_zpts_earned": 0,
        "last_zpts_reset": now_iso,

        # play
        "games_played": 0,
        "games_played_today": 0,

        # streak
        "daily_streak": 0,
        "last_daily_claim": None,

        # badge source counters
        "badge_login_days": 0,
        "badge_full_loop_days": 0,
        "badge_step_claims": 0,
        "badge_sustained_move_days": 0,
        "badge_assists_sent": 0,
        "badge_deep_engagement": 0,
        "badge_zpts_earned": 0,
        "badge_referrals": 0,
        "badge_learn_completions": 0,

        # badge round progress
        "badge_starter_progress": 0,
        "badge_finisher_progress": 0,
        "badge_shaker_progress": 0,
        "badge_mover_progress": 0,
        "badge_contributor_progress": 0,
        "badge_builder_progress": 0,
        "badge_earner_progress": 0,
        "badge_supporter_progress": 0,
        "badge_learner_progress": 0,

        # badge levels
        "badge_starter_level": 0,
        "badge_finisher_level": 0,
        "badge_shaker_level": 0,
        "badge_mover_level": 0,
        "badge_contributor_level": 0,
        "badge_builder_level": 0,
        "badge_earner_level": 0,
        "badge_supporter_level": 0,
        "badge_learner_level": 0,

        # badge mastery
        "badge_starter_mastered": False,
        "badge_finisher_mastered": False,
        "badge_shaker_mastered": False,
        "badge_mover_mastered": False,
        "badge_contributor_mastered": False,
        "badge_builder_mastered": False,
        "badge_earner_mastered": False,
        "badge_supporter_mastered": False,
        "badge_learner_mastered": False,

        # trophy state
        "badge_trophies": 0,
        "badge_trophy_bonus_percent": 0,
        "badge_current_round": 1,

        # garden unlock support
        "garden_unlocked": False,
        "garden_health_percent": 100,
        "garden_growth_stage": "seed",

        # metadata
        "created_at": now_iso,
        "updated_at": now_iso,
    }


@user_router.post("/connect", response_model=UserResponse)
async def connect_wallet(user_data: UserCreate, request: Request):
    db = request.app.state.db
    wallet = user_data.wallet_address.lower().strip()

    if not wallet:
        raise HTTPException(status_code=400, detail="Wallet address is required")

    existing = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})

    if existing:
        existing = await persist_missing_username(db, existing)
        return UserResponse(**existing)

    new_user = build_new_user(wallet)

    await db.users.insert_one(new_user)
    return UserResponse(**new_user)


@user_router.get("/{wallet_address}", response_model=UserResponse)
async def get_user(wallet_address: str, request: Request):
    db = request.app.state.db
    wallet = wallet_address.lower().strip()

    user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user = await persist_missing_username(db, user)
    return UserResponse(**user)


router = user_router