"""
Daily Task Service
==================
Resolves daily task state, detects full daily loop completion,
and awards the full-loop bonus safely once per day.

V1 SYSTEM ALIGNMENT:
- Identity = email (primary)
- wallet_address = optional metadata only
- All updates key off email

Daily task categories:
- Login
- Move
- Play
- Learn
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional

from services.reward_service import enforce_daily_caps, get_tier_multipliers
from services.badge_service import evaluate_badges, persist_badge_updates


LOGIN_TASK_REWARD = 10
MOVE_TASK_REWARD = 25
PLAY_TASK_REWARD = 20
LEARN_TASK_REWARD = 20
FULL_LOOP_BONUS = 25


def utc_now():
    return datetime.now(timezone.utc)


def today_key() -> str:
    return utc_now().date().isoformat()


def _safe_int(value: Any) -> int:
    try:
        return max(int(value or 0), 0)
    except Exception:
        return 0


def _get_lookup(user: dict) -> dict:
    if user.get("email"):
        return {"email": user["email"]}
    return {"id": user["id"]}


def get_daily_task_state(user: dict) -> Dict[str, Any]:
    login_complete = bool(user.get("last_daily_claim"))
    move_complete = _safe_int(user.get("daily_steps")) > 0
    play_complete = _safe_int(user.get("games_played_today")) > 0
    learn_complete = bool(user.get("daily_learn_completed"))

    completed_count = sum([
        1 if login_complete else 0,
        1 if move_complete else 0,
        1 if play_complete else 0,
        1 if learn_complete else 0,
    ])

    full_loop_complete = (
        login_complete and move_complete and play_complete and learn_complete
    )

    return {
        "login": {"key": "login", "completed": login_complete, "reward": LOGIN_TASK_REWARD},
        "move": {"key": "move", "completed": move_complete, "reward": MOVE_TASK_REWARD},
        "play": {"key": "play", "completed": play_complete, "reward": PLAY_TASK_REWARD},
        "learn": {"key": "learn", "completed": learn_complete, "reward": LEARN_TASK_REWARD},
        "completed_count": completed_count,
        "total_tasks": 4,
        "full_loop_complete": full_loop_complete,
    }


async def maybe_mark_learn_task_complete(db, email: str) -> None:
    await db.users.update_one(
        {"email": email.lower()},
        {
            "$set": {
                "daily_learn_completed": True,
                "updated_at": utc_now().isoformat(),
            }
        },
    )


async def check_and_reset_daily_task_state(db, user: dict) -> dict:
    now = utc_now()
    today = today_key()

    last_reset = user.get("last_daily_task_reset")

    should_reset = False

    if last_reset:
        try:
            last_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))
            should_reset = last_dt.date().isoformat() != today
        except Exception:
            should_reset = True
    else:
        should_reset = True

    if should_reset:
        lookup = _get_lookup(user)

        await db.users.update_one(
            lookup,
            {
                "$set": {
                    "daily_learn_completed": False,
                    "daily_full_loop_completed": False,
                    "last_daily_task_reset": now.isoformat(),
                    "updated_at": now.isoformat(),
                }
            },
        )

        user["daily_learn_completed"] = False
        user["daily_full_loop_completed"] = False
        user["last_daily_task_reset"] = now.isoformat()

    return user


async def maybe_process_full_daily_loop(
    db,
    email: Optional[str] = None,
    wallet_address: Optional[str] = None,
) -> Dict[str, Any]:

    identity = (email or wallet_address or "").lower().strip()

    if not identity:
        return {"success": False, "awarded": False, "reason": "identity_missing"}

    user = await db.users.find_one(
        {"email": identity} if email else {"wallet_address": identity}
    )

    if not user:
        return {"success": False, "awarded": False, "reason": "user_not_found"}

    user = await check_and_reset_daily_task_state(db, user)

    task_state = get_daily_task_state(user)

    if not task_state["full_loop_complete"]:
        return {
            "success": True,
            "awarded": False,
            "reason": "full_loop_not_complete",
            "task_state": task_state,
        }

    if user.get("daily_full_loop_completed"):
        return {
            "success": True,
            "awarded": False,
            "reason": "already_awarded_today",
            "task_state": task_state,
        }

    tier = user.get("tier", "zwapper")
    daily_zpts = _safe_int(user.get("daily_zpts_earned"))

    cap_check = await enforce_daily_caps(
        tier=tier,
        earned_today=daily_zpts,
        email=email,
        wallet_address=wallet_address,
    )

    lookup = _get_lookup(user)

    if cap_check["capped"]:
        await db.users.update_one(
            lookup,
            {
                "$inc": {"badge_full_loop_days": 1},
                "$set": {
                    "daily_full_loop_completed": True,
                    "updated_at": utc_now().isoformat(),
                },
            },
        )

        updated_user = await db.users.find_one(lookup)

        badge_result = evaluate_badges(updated_user)
        await persist_badge_updates(db, updated_user["id"], badge_result["updates"])

        return {
            "success": True,
            "awarded": False,
            "reason": "cap_reached_loop_counted",
            "task_state": task_state,
        }

    reward = min(FULL_LOOP_BONUS, int(cap_check["remaining"]))

    await db.users.update_one(
        lookup,
        {
            "$inc": {
                "zpts_balance": reward,
                "daily_zpts_earned": reward,
                "badge_zpts_earned": reward,
                "badge_full_loop_days": 1,
            },
            "$set": {
                "daily_full_loop_completed": True,
                "updated_at": utc_now().isoformat(),
            },
        },
    )

    updated_user = await db.users.find_one(lookup)

    badge_result = evaluate_badges(updated_user)
    await persist_badge_updates(db, updated_user["id"], badge_result["updates"])
    updated_user.update(badge_result["updates"])

    return {
        "success": True,
        "awarded": True,
        "reason": "full_loop_rewarded",
        "full_loop_bonus": reward,
        "new_zpts_balance": _safe_int(updated_user.get("zpts_balance")),
        "badge_full_loop_days": _safe_int(updated_user.get("badge_full_loop_days")),
    }