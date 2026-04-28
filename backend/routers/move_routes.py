"""
ZWAP! V1 Move Router
====================
Routes for step submission and session status.

V1 behavior:
- Email is the primary user identity
- Privy wallet is optional metadata only
- MOVE earns zPts
- daily zPts caps are enforced
- Shaker = successful movement claims
- Mover = unique active movement days
- MOVE writes activity_logs for Activity + Zap
- Full daily loop processing runs after valid movement claims
"""

from collections import defaultdict
import time as _time
from datetime import datetime, timezone
from typing import Any, Optional
import uuid

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from services.reward_service import (
    calculate_move_reward,
    get_tier_multipliers,
    enforce_daily_caps,
)
from services.badge_service import evaluate_badges, persist_badge_updates
from services.daily_task_service import maybe_process_full_daily_loop

router = APIRouter(prefix="/move", tags=["Move"])


class StepsUpdate(BaseModel):
    steps: int


_rate_limits = defaultdict(dict)

STEP_CLAIM_COOLDOWN = 300
MAX_STEPS_PER_CLAIM = 50000
MIN_STEPS_PER_CLAIM = 10


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_now_iso() -> str:
    return utc_now().isoformat()


def today_key() -> str:
    return utc_now().date().isoformat()


def normalize_email(email: Optional[str]) -> str:
    return str(email or "").lower().strip()


def safe_int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value or fallback)
    except Exception:
        return fallback


def parse_datetime(value: Optional[Any]) -> Optional[datetime]:
    if value is None:
        return None

    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)

        return value.astimezone(timezone.utc)

    if isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if parsed.tzinfo is None:
                return parsed.replace(tzinfo=timezone.utc)

            return parsed.astimezone(timezone.utc)
        except Exception:
            return None

    return None


def get_user_persist_id(user: dict):
    return user.get("id") or user.get("_id")


def check_rate_limit(identity: str, action: str, cooldown_seconds: int) -> bool:
    key = normalize_email(identity)
    now = _time.time()
    last = _rate_limits[key].get(action, 0)

    if now - last < cooldown_seconds:
        return True

    _rate_limits[key][action] = now
    return False


async def persist_badges_safely(db, user: dict) -> dict:
    badge_result = evaluate_badges(user)
    updates = badge_result.get("updates", {})
    user_id = get_user_persist_id(user)

    if user_id and updates:
        await persist_badge_updates(db, user_id, updates)
        user.update(updates)

    return user


async def check_and_reset_daily_zpts(db, user: dict) -> dict:
    now = utc_now()
    now_iso = now.isoformat()
    current_day = today_key()

    last_reset = parse_datetime(user.get("last_zpts_reset"))
    stored_daily_key = user.get("daily_zpts_date")

    should_reset = False

    if stored_daily_key and stored_daily_key != current_day:
        should_reset = True
    elif last_reset and last_reset.date() < now.date():
        should_reset = True
    elif not stored_daily_key and not last_reset:
        should_reset = True

    if should_reset:
        await db.users.update_one(
            {"email": user["email"]},
            {
                "$set": {
                    "daily_zpts_earned": 0,
                    "daily_zpts_date": current_day,
                    "last_zpts_reset": now_iso,
                    "updated_at": now_iso,
                }
            },
        )

        user["daily_zpts_earned"] = 0
        user["daily_zpts_date"] = current_day
        user["last_zpts_reset"] = now_iso
        user["updated_at"] = now_iso

    return user


@router.post("/steps/{email}")
async def claim_step_rewards(
    email: str,
    steps_data: StepsUpdate,
    request: Request,
):
    db = request.app.state.db
    safe_email = normalize_email(email)

    if not safe_email:
        raise HTTPException(status_code=400, detail="Email is required")

    if check_rate_limit(safe_email, "steps", STEP_CLAIM_COOLDOWN):
        raise HTTPException(
            status_code=429,
            detail="Too many step claims. Please wait a few minutes.",
        )

    if steps_data.steps < MIN_STEPS_PER_CLAIM:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum {MIN_STEPS_PER_CLAIM} steps required",
        )

    if steps_data.steps > MAX_STEPS_PER_CLAIM:
        raise HTTPException(
            status_code=400,
            detail=f"Step count exceeds maximum ({MAX_STEPS_PER_CLAIM})",
        )

    user = await db.users.find_one({"email": safe_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tier = str(user.get("tier", "zwapper")).lower().strip()
    user = await check_and_reset_daily_zpts(db, user)

    daily_zpts = safe_int(user.get("daily_zpts_earned"), 0)

    tier_config = await get_tier_multipliers(tier)
    cap_check = await enforce_daily_caps(
        email=safe_email,
        tier=tier,
        earned_today=daily_zpts,
        cap_type="zpts",
    )

    if cap_check.get("capped"):
        raise HTTPException(
            status_code=429,
            detail="Daily zPts earning limit reached. Come back tomorrow!",
        )

    try:
        reward_result = await calculate_move_reward(
            steps=steps_data.steps,
            tier=tier,
            daily_steps_so_far=safe_int(user.get("daily_steps"), 0),
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    requested_reward = safe_int(reward_result.get("zpts"), 0)
    rewards = min(requested_reward, safe_int(cap_check.get("remaining"), 0))
    zpts_cap = safe_int(tier_config.get("daily_zpts_cap"), 0)

    current_day = today_key()
    now_iso = utc_now_iso()

    last_move_day = user.get("badge_last_move_day")
    increment_mover = last_move_day != current_day

    updated_daily_steps = safe_int(user.get("daily_steps"), 0) + steps_data.steps

    update_doc = {
        "$inc": {
            "zpts_balance": rewards,
            "lifetime_zpts": rewards,
            "total_steps": steps_data.steps,
            "daily_zpts_earned": rewards,
            "badge_zpts_earned": rewards,
            "badge_step_claims": 1,
        },
        "$set": {
            "daily_steps": updated_daily_steps,
            "daily_zpts_date": current_day,
            "last_zpts_reset": now_iso,
            "updated_at": now_iso,
        },
    }

    if increment_mover:
        update_doc["$inc"]["badge_sustained_move_days"] = 1
        update_doc["$set"]["badge_last_move_day"] = current_day

    await db.users.update_one({"email": safe_email}, update_doc)

    await db.rewards_ledger.insert_one(
        {
            "id": str(uuid.uuid4()),
            "email": safe_email,
            "currency": "zpts",
            "amount": rewards,
            "uncapped_amount": requested_reward,
            "source": "move",
            "reward_type": "move_steps",
            "steps": steps_data.steps,
            "daily_cap": zpts_cap,
            "created_at": now_iso,
        }
    )

    await db.activity_logs.insert_one(
        {
            "id": str(uuid.uuid4()),
            "email": safe_email,
            "type": "move",
            "steps": steps_data.steps,
            "zpts": rewards,
            "message": f"+{rewards} zPts from movement",
            "priority": "normal",
            "completed": True,
            "created_at": now_iso,
            "metadata": {
                "daily_steps": updated_daily_steps,
                "uncapped_zpts": requested_reward,
                "daily_cap": zpts_cap,
            },
        }
    )

    updated_user = await db.users.find_one({"email": safe_email})
    if not updated_user:
        raise HTTPException(status_code=500, detail="User missing after movement update")

    updated_user = await persist_badges_safely(db, updated_user)

    full_loop_result = await maybe_process_full_daily_loop(db, email=safe_email)

    if (
        full_loop_result.get("awarded")
        or full_loop_result.get("reason") == "daily_cap_reached_loop_counted"
        or full_loop_result.get("reason") == "cap_reached_loop_counted"
    ):
        refreshed_user = await db.users.find_one({"email": safe_email})
        if refreshed_user:
            updated_user = refreshed_user

    return {
        "success": True,
        "steps_counted": steps_data.steps,
        "rewards_earned": rewards,
        "uncapped_rewards": requested_reward,
        "full_loop_awarded": full_loop_result.get("awarded", False),
        "full_loop_bonus": full_loop_result.get("full_loop_bonus", 0),
        "new_balance": safe_int(updated_user.get("zpts_balance"), 0),
        "daily_steps": safe_int(updated_user.get("daily_steps"), 0),
        "daily_zpts_earned": safe_int(updated_user.get("daily_zpts_earned"), 0),
        "daily_zpts_remaining": max(
            0,
            zpts_cap - safe_int(updated_user.get("daily_zpts_earned"), 0),
        ),
        "tier": tier,
        "multiplier": tier_config.get("move"),
        "badge_step_claims": updated_user.get("badge_step_claims", 0),
        "badge_sustained_move_days": updated_user.get("badge_sustained_move_days", 0),
        "badge_last_move_day": updated_user.get("badge_last_move_day"),
        "badge_zpts_earned": updated_user.get("badge_zpts_earned", 0),
        "badge_shaker_level": updated_user.get("badge_shaker_level", 0),
        "badge_shaker_mastered": updated_user.get("badge_shaker_mastered", False),
        "badge_mover_level": updated_user.get("badge_mover_level", 0),
        "badge_mover_mastered": updated_user.get("badge_mover_mastered", False),
        "badge_finisher_level": updated_user.get("badge_finisher_level", 0),
        "badge_finisher_mastered": updated_user.get("badge_finisher_mastered", False),
        "badge_trophies": updated_user.get("badge_trophies", 0),
        "badge_trophy_bonus_percent": updated_user.get("badge_trophy_bonus_percent", 0),
        "message": f"Earned {rewards} zPts for {steps_data.steps} steps!",
    }


@router.get("/session/{email}")
async def get_move_session(email: str):
    safe_email = normalize_email(email)

    if not safe_email:
        raise HTTPException(status_code=400, detail="Email is required")

    return {
        "active": False,
        "steps": 0,
    }


@router.post("/anti-cheat/{email}")
async def submit_anti_cheat_flags(email: str):
    safe_email = normalize_email(email)

    if not safe_email:
        raise HTTPException(status_code=400, detail="Email is required")

    return {
        "received": True,
        "flagged": False,
    }