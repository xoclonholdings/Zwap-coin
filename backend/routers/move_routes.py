"""
Move-to-Earn Router
====================
Routes for step submission, session tracking, and anti-cheat.
Reward calculations are delegated to reward_service (stubs for now).
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

# Import reward service stubs — these raise NotImplementedError until implemented.
# Routes currently use inline logic from server.py; these imports prepare for migration.
from services.reward_service import (  # noqa: F401
    calculate_move_reward,
    get_tier_multipliers,
    enforce_daily_caps,
)

router = APIRouter(prefix="/move", tags=["Move"])


class StepsUpdate(BaseModel):
    steps: int


@router.post("/steps/{wallet_address}")
async def claim_step_rewards(
    wallet_address: str,
    steps_data: StepsUpdate,
    request: Request,
):
    db = request.app.state.db
    wallet = wallet_address.lower()

    # Keep current production guardrails aligned with existing server.py logic
    min_steps_per_claim = 10
    max_steps_per_claim = 50000
    daily_zwap_caps = {
        "starter": 500.0,
        "plus": 1500.0,
    }

    if steps_data.steps < min_steps_per_claim:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum {min_steps_per_claim} steps required",
        )

    if steps_data.steps > max_steps_per_claim:
        raise HTTPException(
            status_code=400,
            detail=f"Step count exceeds maximum ({max_steps_per_claim})",
        )

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tier = user.get("tier", "starter")
    multiplier = 1.5 if tier == "plus" else 1.0

    # Daily reset logic migrated from server.py behavior
    daily_zwap = float(user.get("daily_zwap_earned", 0.0) or 0.0)
    last_reset = user.get("last_zwap_reset")

    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)

    if last_reset:
        last_reset_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))
        if last_reset_dt.date() < now.date():
            await db.users.update_one(
                {"wallet_address": wallet},
                {
                    "$set": {
                        "daily_zwap_earned": 0.0,
                        "last_zwap_reset": now.isoformat(),
                    }
                },
            )
            daily_zwap = 0.0
    else:
        await db.users.update_one(
            {"wallet_address": wallet},
            {
                "$set": {
                    "daily_zwap_earned": 0.0,
                    "last_zwap_reset": now.isoformat(),
                }
            },
        )
        daily_zwap = 0.0

    zwap_cap = daily_zwap_caps.get(tier, 500.0)

    if daily_zwap >= zwap_cap:
        raise HTTPException(
            status_code=429,
            detail="Daily ZWAP earning limit reached. Come back tomorrow!",
        )

    # Base reward copied from existing server.py logic
    if steps_data.steps < 1000:
        base = steps_data.steps * 0.01
    elif steps_data.steps < 5000:
        base = 10 + (steps_data.steps - 1000) * 0.02
    elif steps_data.steps < 10000:
        base = 90 + (steps_data.steps - 5000) * 0.03
    else:
        base = 240 + (steps_data.steps - 10000) * 0.05

    rewards = min(base * multiplier, zwap_cap - daily_zwap)

    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {
                "zwap_balance": rewards,
                "total_steps": steps_data.steps,
                "total_earned": rewards,
                "daily_zwap_earned": rewards,
            },
            "$set": {
                "daily_steps": steps_data.steps,
            },
        },
    )

    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})

    return {
        "steps_counted": steps_data.steps,
        "rewards_earned": round(rewards, 2),
        "new_balance": updated_user.get("zwap_balance", 0),
        "daily_zwap_remaining": round(
            zwap_cap - updated_user.get("daily_zwap_earned", 0),
            2,
        ),
        "tier": tier,
        "multiplier": multiplier,
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