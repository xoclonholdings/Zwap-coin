from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Request
from services.badge_service import evaluate_badges, persist_badge_updates

router = APIRouter(prefix="/rewards", tags=["rewards"])

DAILY_REWARD_TABLE = {
    1: 10,
    2: 15,
    3: 20,
    4: 25,
    5: 30,
    6: 35,
    7: 100,
}

CLAIM_WINDOW_HOURS = 24
RESET_WINDOW_HOURS = 48


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def get_reward_for_streak(streak: int) -> int:
    return DAILY_REWARD_TABLE.get(min(streak, 7), DAILY_REWARD_TABLE[7])


def parse_dt(value: Optional[Any]) -> Optional[datetime]:
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)
    if isinstance(value, str):
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    return None


async def get_user_or_404(db, wallet_address: str) -> Dict[str, Any]:
    user = await db.users.find_one({"wallet_address": wallet_address.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/status/{wallet_address}")
async def get_daily_reward_status(wallet_address: str, request: Request):
    db = request.app.state.db
    user = await get_user_or_404(db, wallet_address)

    now = utc_now()
    last_claim = parse_dt(user.get("last_daily_claim"))
    current_streak = user.get("daily_streak", 0)

    can_claim = True
    next_claim_at = None
    streak_will_reset = False

    if last_claim:
        elapsed = now - last_claim

        if elapsed < timedelta(hours=CLAIM_WINDOW_HOURS):
            can_claim = False
            next_claim_at = last_claim + timedelta(hours=CLAIM_WINDOW_HOURS)
        elif elapsed >= timedelta(hours=RESET_WINDOW_HOURS):
            streak_will_reset = True

    projected_streak = 1
    if last_claim:
        elapsed = now - last_claim
        if elapsed < timedelta(hours=CLAIM_WINDOW_HOURS):
            projected_streak = current_streak
        elif elapsed < timedelta(hours=RESET_WINDOW_HOURS):
            projected_streak = current_streak + 1
        else:
            projected_streak = 1

    reward_amount = get_reward_for_streak(projected_streak)

    return {
        "wallet_address": wallet_address.lower(),
        "can_claim": can_claim,
        "current_streak": current_streak,
        "projected_streak": projected_streak,
        "next_reward_zpts": reward_amount,
        "last_daily_claim": last_claim.isoformat() if last_claim else None,
        "next_claim_at": next_claim_at.isoformat() if next_claim_at else None,
        "streak_will_reset": streak_will_reset,
    }


@router.post("/daily/{wallet_address}")
async def claim_daily_reward(wallet_address: str, request: Request):
    db = request.app.state.db
    wallet = wallet_address.lower()

    user = await get_user_or_404(db, wallet)

    now = utc_now()
    last_claim = parse_dt(user.get("last_daily_claim"))
    current_streak = user.get("daily_streak", 0)
    current_zpts_balance = user.get("zpts_balance", 0)

    if last_claim:
        elapsed = now - last_claim

        if elapsed < timedelta(hours=CLAIM_WINDOW_HOURS):
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Daily reward already claimed",
                    "last_daily_claim": last_claim.isoformat(),
                    "next_claim_at": (
                        last_claim + timedelta(hours=CLAIM_WINDOW_HOURS)
                    ).isoformat(),
                    "current_streak": current_streak,
                },
            )

        if elapsed < timedelta(hours=RESET_WINDOW_HOURS):
            new_streak = current_streak + 1
        else:
            new_streak = 1
    else:
        new_streak = 1

    reward_amount = get_reward_for_streak(new_streak)
    new_zpts_balance = current_zpts_balance + reward_amount

    update_doc = {
        "$set": {
            "daily_streak": new_streak,
            "last_daily_claim": now.isoformat(),
            "updated_at": now.isoformat(),
        },
        "$inc": {
            "zpts_balance": reward_amount,
            "badge_login_days": 1,
            "badge_zpts_earned": reward_amount,
        },
    }

    result = await db.users.update_one(
        {"wallet_address": wallet},
        update_doc
    )

    if result.modified_count != 1:
        raise HTTPException(status_code=500, detail="Failed to update daily reward")

    updated_user = await db.users.find_one({"wallet_address": wallet})

    badge_updates = evaluate_badges(updated_user)

    await persist_badge_updates(db, updated_user["id"], badge_updates)

    updated_user.update(badge_updates)

    await db.reward_claims.insert_one({
        "wallet_address": wallet,
        "reward_type": "daily",
        "streak_day": new_streak,
        "reward_zpts": reward_amount,
        "claimed_at": now.isoformat(),
        "created_at": now.isoformat(),
    })

    return {
        "success": True,
        "wallet_address": wallet,
        "reward_type": "daily",
        "streak": new_streak,
        "reward_zpts": reward_amount,
        "zpts_balance": updated_user.get("zpts_balance", new_zpts_balance),
        "badge_login_days": updated_user.get("badge_login_days", 0),
        "badge_zpts_earned": updated_user.get("badge_zpts_earned", 0),
        "badge_starter_completed": updated_user.get("badge_starter_completed", False),
        "last_daily_claim": now.isoformat(),
        "message": f"Claimed Day {min(new_streak, 7)} daily reward",
    }