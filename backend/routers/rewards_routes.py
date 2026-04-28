from datetime import datetime, timezone, timedelta
from typing import Any, Dict, Optional
import uuid

from fastapi import APIRouter, HTTPException, Request

from services.badge_service import evaluate_badges, persist_badge_updates
from services.daily_task_service import maybe_process_full_daily_loop

router = APIRouter(prefix="/rewards", tags=["Rewards"])

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


def utc_now_iso() -> str:
    return utc_now().isoformat()


def normalize_email(email: Optional[str]) -> str:
    return str(email or "").lower().strip()


def safe_int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value or fallback)
    except Exception:
        return fallback


def get_reward_for_streak(streak: int) -> int:
    safe_streak = max(1, int(streak or 1))
    return DAILY_REWARD_TABLE.get(min(safe_streak, 7), DAILY_REWARD_TABLE[7])


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


async def get_user_or_404(db, email: str) -> Dict[str, Any]:
    safe_email = normalize_email(email)

    if not safe_email:
        raise HTTPException(status_code=400, detail="Email is required")

    user = await db.users.find_one({"email": safe_email})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


async def persist_badges_safely(db, user: Dict[str, Any]) -> Dict[str, Any]:
    badge_result = evaluate_badges(user)
    updates = badge_result.get("updates", {})

    if user.get("id") and updates:
        await persist_badge_updates(db, user["id"], updates)
        user.update(updates)

    return user


@router.get("/status/{email}")
async def get_daily_reward_status(email: str, request: Request):
    db = request.app.state.db
    safe_email = normalize_email(email)

    user = await get_user_or_404(db, safe_email)

    now = utc_now()
    last_claim = parse_dt(user.get("last_daily_claim"))
    current_streak = safe_int(user.get("daily_streak"), 0)

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
        "email": safe_email,
        "can_claim": can_claim,
        "current_streak": current_streak,
        "projected_streak": projected_streak,
        "next_reward_zpts": reward_amount,
        "last_daily_claim": last_claim.isoformat() if last_claim else None,
        "next_claim_at": next_claim_at.isoformat() if next_claim_at else None,
        "streak_will_reset": streak_will_reset,
    }


@router.post("/daily/{email}")
async def claim_daily_reward(email: str, request: Request):
    db = request.app.state.db
    safe_email = normalize_email(email)

    user = await get_user_or_404(db, safe_email)

    now = utc_now()
    now_iso = now.isoformat()
    last_claim = parse_dt(user.get("last_daily_claim"))
    current_streak = safe_int(user.get("daily_streak"), 0)

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

    update_doc = {
        "$set": {
            "daily_streak": new_streak,
            "last_daily_claim": now_iso,
            "daily_zpts_date": now.date().isoformat(),
            "updated_at": now_iso,
        },
        "$inc": {
            "zpts_balance": reward_amount,
            "lifetime_zpts": reward_amount,
            "daily_zpts_earned": reward_amount,
            "badge_login_days": 1,
            "badge_zpts_earned": reward_amount,
        },
    }

    result = await db.users.update_one({"email": safe_email}, update_doc)

    if result.modified_count != 1:
        raise HTTPException(status_code=500, detail="Failed to update daily reward")

    await db.reward_claims.insert_one(
        {
            "id": str(uuid.uuid4()),
            "email": safe_email,
            "reward_type": "daily",
            "streak_day": new_streak,
            "reward_zpts": reward_amount,
            "claimed_at": now_iso,
            "created_at": now_iso,
        }
    )

    await db.rewards_ledger.insert_one(
        {
            "id": str(uuid.uuid4()),
            "email": safe_email,
            "currency": "zpts",
            "amount": reward_amount,
            "source": "daily_login",
            "reward_type": "daily",
            "streak_day": new_streak,
            "created_at": now_iso,
        }
    )

    await db.activity_logs.insert_one(
        {
            "id": str(uuid.uuid4()),
            "email": safe_email,
            "type": "login",
            "zpts": reward_amount,
            "message": f"+{reward_amount} zPts from daily login",
            "priority": "normal",
            "completed": True,
            "created_at": now_iso,
            "metadata": {
                "streak_day": new_streak,
                "reward_type": "daily",
            },
        }
    )

    updated_user = await db.users.find_one({"email": safe_email})

    if not updated_user:
        raise HTTPException(status_code=500, detail="User missing after reward update")

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
        "email": safe_email,
        "reward_type": "daily",
        "streak": new_streak,
        "reward_zpts": reward_amount,
        "full_loop_awarded": full_loop_result.get("awarded", False),
        "full_loop_bonus": full_loop_result.get("full_loop_bonus", 0),
        "zpts_balance": safe_int(updated_user.get("zpts_balance"), 0),
        "daily_zpts_earned": safe_int(updated_user.get("daily_zpts_earned"), 0),
        "badge_login_days": updated_user.get("badge_login_days", 0),
        "badge_zpts_earned": updated_user.get("badge_zpts_earned", 0),
        "badge_starter_level": updated_user.get("badge_starter_level", 0),
        "badge_starter_mastered": updated_user.get("badge_starter_mastered", False),
        "badge_finisher_level": updated_user.get("badge_finisher_level", 0),
        "badge_finisher_mastered": updated_user.get("badge_finisher_mastered", False),
        "badge_trophies": updated_user.get("badge_trophies", 0),
        "badge_trophy_bonus_percent": updated_user.get("badge_trophy_bonus_percent", 0),
        "last_daily_claim": now_iso,
        "message": f"Claimed Day {min(new_streak, 7)} daily reward",
    }