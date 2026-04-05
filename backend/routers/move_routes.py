"""
Move-to-Earn Router
====================
Routes for step submission, session tracking, and anti-cheat.
Reward calculations are delegated to reward_service.

Updated economy:
- MOVE earns zPts
- daily zPts caps enforced
- Shaker = successful movement claims
- Mover = unique active movement days
"""

from collections import defaultdict
import time as _time
from datetime import datetime, timezone

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

from services.reward_service import (
    calculate_move_reward,
    get_tier_multipliers,
    enforce_daily_caps,
)
from services.activity_service import emit_activity_event
from services.badge_service import evaluate_badges, persist_badge_updates
from services.daily_task_service import maybe_process_full_daily_loop

router = APIRouter(prefix="/move", tags=["Move"])


class StepsUpdate(BaseModel):
    steps: int


_rate_limits = defaultdict(dict)

STEP_CLAIM_COOLDOWN = 300
MAX_STEPS_PER_CLAIM = 50000
MIN_STEPS_PER_CLAIM = 10


def check_rate_limit(wallet: str, action: str, cooldown_seconds: int) -> bool:
    """Returns True if rate-limited (too soon). False if OK."""
    now = _time.time()
    last = _rate_limits[wallet].get(action, 0)
    if now - last < cooldown_seconds:
        return True
    _rate_limits[wallet][action] = now
    return False


async def check_and_reset_daily_zpts(db, user: dict) -> dict:
    """Reset daily zPts earned at midnight UTC."""
    now = datetime.now(timezone.utc)
    last_reset = user.get("last_zpts_reset")

    if last_reset:
        last_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))
        if last_dt.date() < now.date():
            await db.users.update_one(
                {"wallet_address": user["wallet_address"]},
                {
                    "$set": {
                        "daily_zpts_earned": 0,
                        "last_zpts_reset": now.isoformat(),
                    }
                },
            )
            user["daily_zpts_earned"] = 0
            user["last_zpts_reset"] = now.isoformat()
    else:
        await db.users.update_one(
            {"wallet_address": user["wallet_address"]},
            {
                "$set": {
                    "daily_zpts_earned": 0,
                    "last_zpts_reset": now.isoformat(),
                }
            },
        )
        user["daily_zpts_earned"] = 0
        user["last_zpts_reset"] = now.isoformat()

    return user


@router.post("/steps/{wallet_address}")
async def claim_step_rewards(
    wallet_address: str,
    steps_data: StepsUpdate,
    request: Request,
):
    """Claim zPts rewards for steps."""
    db = request.app.state.db
    wallet = wallet_address.lower()

    if check_rate_limit(wallet, "steps", STEP_CLAIM_COOLDOWN):
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

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tier = user.get("tier", "starter")

    user = await check_and_reset_daily_zpts(db, user)
    daily_zpts = int(user.get("daily_zpts_earned", 0) or 0)

    tier_config = await get_tier_multipliers(tier)
    cap_check = await enforce_daily_caps(
        wallet_address=wallet,
        tier=tier,
        earned_today=daily_zpts,
        cap_type="zpts",
    )

    if cap_check["capped"]:
        raise HTTPException(
            status_code=429,
            detail="Daily zPts earning limit reached. Come back tomorrow!",
        )

    try:
        reward_result = await calculate_move_reward(
            steps=steps_data.steps,
            tier=tier,
            daily_steps_so_far=user.get("daily_steps", 0),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    rewards = min(int(reward_result["zpts"]), int(cap_check["remaining"]))
    zpts_cap = int(tier_config["daily_zpts_cap"])

    today_key = datetime.now(timezone.utc).date().isoformat()
    last_move_day = user.get("badge_last_move_day")
    increment_mover = last_move_day != today_key

    update_doc = {
        "$inc": {
            "zpts_balance": rewards,
            "total_steps": steps_data.steps,
            "daily_zpts_earned": rewards,
            "badge_zpts_earned": rewards,
            "badge_step_claims": 1,
        },
        "$set": {
            "daily_steps": steps_data.steps,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    }

    if increment_mover:
        update_doc["$inc"]["badge_sustained_move_days"] = 1
        update_doc["$set"]["badge_last_move_day"] = today_key

    await db.users.update_one(
        {"wallet_address": wallet},
        update_doc,
    )

    updated_user = await db.users.find_one({"wallet_address": wallet})

    badge_result = evaluate_badges(updated_user)
    await persist_badge_updates(db, updated_user["id"], badge_result["updates"])
    updated_user.update(badge_result["updates"])

    full_loop_result = await maybe_process_full_daily_loop(db, wallet)

    if full_loop_result.get("awarded") or full_loop_result.get("reason") == "daily_cap_reached_loop_counted":
        refreshed_user = await db.users.find_one({"wallet_address": wallet})
        if refreshed_user:
            updated_user = refreshed_user

    await emit_activity_event(
        db=db,
        event_type="MOVEMENT_ACTIVITY",
        message=f"{steps_data.steps} steps were just logged nearby",
        actor_user_id=str(user.get("_id")) if user.get("_id") else None,
        actor_display=user.get("display_name") or user.get("username") or "A Zwapper nearby",
        region_key=user.get("region_key"),
        local_key=user.get("local_key"),
        metadata={
            "source": "move_steps_claim",
            "steps": steps_data.steps,
            "reward_zpts": rewards,
            "tier": tier,
        },
    )

    return {
        "steps_counted": steps_data.steps,
        "rewards_earned": rewards,
        "full_loop_awarded": full_loop_result.get("awarded", False),
        "full_loop_bonus": full_loop_result.get("full_loop_bonus", 0),
        "new_balance": int(updated_user.get("zpts_balance", 0)),
        "daily_zpts_remaining": max(
            0,
            zpts_cap - int(updated_user.get("daily_zpts_earned", 0)),
        ),
        "tier": tier,
        "multiplier": tier_config["move"],
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


@router.get("/session/{wallet_address}")
async def get_move_session(wallet_address: str):
    """
    Get the active step-tracking session for a user.
    Currently: stub.
    Future: return active session with step count, start time, anti-cheat flags.
    """
    return {"active": False, "steps": 0, "wallet": wallet_address}


@router.post("/anti-cheat")
async def submit_anti_cheat_flags(wallet_address: str):
    """
    Submit client-side anti-cheat telemetry.
    Currently: stub.
    Future: flag suspicious patterns (GPS speed, step variance, device motion).
    """
    return {"received": True, "flagged": False, "wallet": wallet_address}