"""
Move-to-Earn Router
====================
Routes for step submission, session tracking, and anti-cheat.
Reward calculations are delegated to reward_service.
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

router = APIRouter(prefix="/move", tags=["Move"])


class StepsUpdate(BaseModel):
    steps: int


# In-memory rate limiter {wallet: {action: last_timestamp}}
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


async def check_and_reset_daily_zwap(db, user: dict) -> dict:
    """Reset daily ZWAP earned at midnight UTC."""
    now = datetime.now(timezone.utc)
    last_reset = user.get("last_zwap_reset")

    if last_reset:
        last_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))
        if last_dt.date() < now.date():
            await db.users.update_one(
                {"wallet_address": user["wallet_address"]},
                {
                    "$set": {
                        "daily_zwap_earned": 0.0,
                        "last_zwap_reset": now.isoformat(),
                    }
                },
            )
            user["daily_zwap_earned"] = 0.0
    else:
        await db.users.update_one(
            {"wallet_address": user["wallet_address"]},
            {
                "$set": {
                    "daily_zwap_earned": 0.0,
                    "last_zwap_reset": now.isoformat(),
                }
            },
        )
        user["daily_zwap_earned"] = 0.0

    return user


@router.post("/steps/{wallet_address}")
async def claim_step_rewards(
    wallet_address: str,
    steps_data: StepsUpdate,
    request: Request,
):
    """Claim ZWAP rewards for steps (no Z Points from walking)."""
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

    user = await check_and_reset_daily_zwap(db, user)
    daily_zwap = float(user.get("daily_zwap_earned", 0.0) or 0.0)

    tier_config = await get_tier_multipliers(tier)
    cap_check = await enforce_daily_caps(
        wallet_address=wallet,
        tier=tier,
        earned_today=daily_zwap,
        cap_type="zwap",
    )

    if cap_check["capped"]:
        raise HTTPException(
            status_code=429,
            detail="Daily ZWAP earning limit reached. Come back tomorrow!",
        )

    try:
        reward_result = await calculate_move_reward(
            steps=steps_data.steps,
            tier=tier,
            daily_steps_so_far=user.get("daily_steps", 0),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    rewards = min(reward_result["zwap"], cap_check["remaining"])
    zwap_cap = tier_config["daily_zwap_cap"]

    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {
                "zwap_balance": rewards,
                "total_steps": steps_data.steps,
                "total_earned": rewards,
                "daily_zwap_earned": rewards,
            },
            "$set": {"daily_steps": steps_data.steps},
        },
    )

    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})

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
            "reward_zwap": round(rewards, 2),
            "tier": tier,
        },
    )

    return {
        "steps_counted": steps_data.steps,
        "rewards_earned": round(rewards, 2),
        "new_balance": round(updated_user.get("zwap_balance", 0), 2),
        "daily_zwap_remaining": round(
            zwap_cap - updated_user.get("daily_zwap_earned", 0),
            2,
        ),
        "tier": tier,
        "multiplier": tier_config["move"],
        "message": f"Earned {rewards:.2f} ZWAP for {steps_data.steps} steps!",
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