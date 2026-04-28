from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Request

from services.badge_service import evaluate_badges, persist_badge_updates
from services.daily_task_service import maybe_process_full_daily_loop

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

ZWAPPER_DAILY_ZPTS_CAP = 300
ZITIZEN_DAILY_ZPTS_CAP = 600


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_today_key() -> str:
    return utc_now().date().isoformat()


def get_reward_for_streak(streak: int) -> int:
    return DAILY_REWARD_TABLE.get(min(streak, 7), DAILY_REWARD_TABLE[7])


def get_daily_cap_for_user(user: Dict[str, Any]) -> int:
    tier = str(user.get("tier", "zwapper")).lower().strip()

    if tier in {"zitizen", "plus"}:
        return ZITIZEN_DAILY_ZPTS_CAP

    return ZWAPPER_DAILY_ZPTS_CAP


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
    wallet = wallet_address.lower().strip()

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def get_user_persist_id(user: Dict[str, Any]):
    return user.get("id") or user.get("_id")


def calculate_capped_reward(
    user: Dict[str, Any],
    requested_reward: int,
) -> Dict[str, int]:
    today_key = utc_today_key()
    stored_key = user.get("daily_zpts_date")
    current_daily_earned = int(user.get("daily_zpts_earned", 0) or 0)

    if stored_key != today_key:
        current_daily_earned = 0

    daily_cap = get_daily_cap_for_user(user)
    remaining = max(0, daily_cap - current_daily_earned)
    awarded = min(max(0, int(requested_reward or 0)), remaining)

    return {
        "requested": int(requested_reward or 0),
        "awarded": awarded,
        "daily_cap": daily_cap,
        "daily_zpts_earned_before": current_daily_earned,
        "daily_zpts_earned_after": current_daily_earned + awarded,
    }


@router.get("/status/{wallet_address}")
async def get_daily_reward_status(wallet_address: str, request: Request):
    db = request.app.state.db
    wallet = wallet_address.lower().strip()
    user = await get_user_or_404(db, wallet)

    now = utc_now()
    last_claim = parse_dt(user.get("last_daily_claim"))
    current_streak = int(user.get("daily_streak", 0) or 0)

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
    cap_result = calculate_capped_reward(user, reward_amount)

    return {
        "wallet_address": wallet,
        "can_claim": can_claim,
        "current_streak": current_streak,
        "projected_streak": projected_streak,
        "next_reward_zpts": cap_result["awarded"],
        "uncapped_reward_zpts": reward_amount,
        "daily_cap": cap_result["daily_cap"],
        "daily_zpts_remaining": max(
            0,
            cap_result["daily_cap"] - cap_result["daily_zpts_earned_before"],
        ),
        "last_daily_claim": last_claim.isoformat() if last_claim else None,
        "next_claim_at": next_claim_at.isoformat() if next_claim_at else None,
        "streak_will_reset": streak_will_reset,
    }


@router.post("/daily/{wallet_address}")
async def claim_daily_reward(wallet_address: str, request: Request):
    db = request.app.state.db
    wallet = wallet_address.lower().strip()

    user = await get_user_or_404(db, wallet)

    now = utc_now()
    now_iso = now.isoformat()
    today_key = now.date().isoformat()

    last_claim = parse_dt(user.get("last_daily_claim"))
    current_streak = int(user.get("daily_streak", 0) or 0)

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

    uncapped_reward_amount = get_reward_for_streak(new_streak)
    cap_result = calculate_capped_reward(user, uncapped_reward_amount)
    reward_amount = cap_result["awarded"]

    update_doc = {
        "$set": {
            "daily_streak": new_streak,
            "last_daily_claim": now_iso,
            "daily_zpts_date": today_key,
            "daily_zpts_earned": cap_result["daily_zpts_earned_after"],
            "updated_at": now_iso,
        },
        "$inc": {
            "badge_login_days": 1,
        },
    }

    if reward_amount > 0:
        update_doc["$inc"]["zpts_balance"] = reward_amount
        update_doc["$inc"]["lifetime_zpts"] = reward_amount
        update_doc["$inc"]["badge_zpts_earned"] = reward_amount

    result = await db.users.update_one({"wallet_address": wallet}, update_doc)

    if result.modified_count != 1:
        raise HTTPException(status_code=500, detail="Failed to update daily reward")

    updated_user = await db.users.find_one({"wallet_address": wallet})

    badge_result = evaluate_badges(updated_user)
    user_persist_id = get_user_persist_id(updated_user)

    if user_persist_id and badge_result.get("updates"):
        await persist_badge_updates(db, user_persist_id, badge_result["updates"])
        updated_user.update(badge_result["updates"])

    full_loop_result = await maybe_process_full_daily_loop(db, wallet)

    if (
        full_loop_result.get("awarded")
        or full_loop_result.get("reason") == "daily_cap_reached_loop_counted"
    ):
        refreshed_user = await db.users.find_one({"wallet_address": wallet})
        if refreshed_user:
            updated_user = refreshed_user

    reward_claim = {
        "wallet_address": wallet,
        "reward_type": "daily",
        "streak_day": new_streak,
        "reward_zpts": reward_amount,
        "uncapped_reward_zpts": uncapped_reward_amount,
        "daily_cap": cap_result["daily_cap"],
        "daily_zpts_earned_after": cap_result["daily_zpts_earned_after"],
        "claimed_at": now_iso,
        "created_at": now_iso,
    }

    await db.reward_claims.insert_one(dict(reward_claim))

    await db.rewards_ledger.insert_one(
        {
            "wallet_address": wallet,
            "currency": "zpts",
            "amount": reward_amount,
            "uncapped_amount": uncapped_reward_amount,
            "source": "daily_reward",
            "reward_type": "daily",
            "streak_day": new_streak,
            "daily_cap": cap_result["daily_cap"],
            "created_at": now_iso,
        }
    )

    return {
        "success": True,
        "wallet_address": wallet,
        "reward_type": "daily",
        "streak": new_streak,
        "reward_zpts": reward_amount,
        "uncapped_reward_zpts": uncapped_reward_amount,
        "daily_cap": cap_result["daily_cap"],
        "daily_zpts_earned": updated_user.get(
            "daily_zpts_earned",
            cap_result["daily_zpts_earned_after"],
        ),
        "daily_cap_reached": reward_amount < uncapped_reward_amount,
        "full_loop_awarded": full_loop_result.get("awarded", False),
        "full_loop_bonus": full_loop_result.get("full_loop_bonus", 0),
        "zpts_balance": updated_user.get("zpts_balance", 0),
        "badge_login_days": updated_user.get("badge_login_days", 0),
        "badge_zpts_earned": updated_user.get("badge_zpts_earned", 0),
        "badge_starter_level": updated_user.get("badge_starter_level", 0),
        "badge_starter_mastered": updated_user.get("badge_starter_mastered", False),
        "badge_finisher_level": updated_user.get("badge_finisher_level", 0),
        "badge_finisher_mastered": updated_user.get("badge_finisher_mastered", False),
        "badge_trophies": updated_user.get("badge_trophies", 0),
        "badge_trophy_bonus_percent": updated_user.get(
            "badge_trophy_bonus_percent",
            0,
        ),
        "last_daily_claim": now_iso,
        "message": f"Claimed Day {min(new_streak, 7)} daily reward",
    }