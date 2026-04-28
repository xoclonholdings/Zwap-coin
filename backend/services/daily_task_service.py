"""
Daily Task Service
==================
Resolves daily task state, detects full daily loop completion,
and awards the full-loop bonus safely once per day.

V1 identity:
- Email is the primary user identity
- Privy wallet is optional metadata

Spec-aligned daily task categories:
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


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def today_key() -> str:
    return utc_now().date().isoformat()


def normalize_email(email: Optional[str]) -> str:
    return str(email or "").lower().strip()


def _safe_int(value: Any) -> int:
    try:
        return max(int(value or 0), 0)
    except Exception:
        return 0


def _parse_datetime(value: Optional[Any]) -> Optional[datetime]:
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


def _is_today(value: Optional[Any]) -> bool:
    parsed = _parse_datetime(value)
    if not parsed:
        return False

    return parsed.date().isoformat() == today_key()


def _user_lookup(user: dict) -> Dict[str, Any]:
    email = normalize_email(user.get("email"))
    if email:
        return {"email": email}

    user_id = user.get("id")
    if user_id:
        return {"id": user_id}

    raise ValueError("User identity is missing")


def _user_persist_id(user: Dict[str, Any]):
    return user.get("id") or user.get("_id")


async def _persist_badges_safely(db, user: Dict[str, Any]) -> Dict[str, Any]:
    badge_result = evaluate_badges(user)
    updates = badge_result.get("updates", {})
    user_id = _user_persist_id(user)

    if user_id and updates:
        await persist_badge_updates(db, user_id, updates)
        user.update(updates)

    return user


async def get_user_by_email(db, email: str) -> Optional[Dict[str, Any]]:
    normalized_email = normalize_email(email)
    if not normalized_email:
        return None

    return await db.users.find_one({"email": normalized_email})


def get_daily_task_state(user: dict) -> Dict[str, Any]:
    """
    Returns the user's current task completion state for today.
    This is read-only and does not write anything.
    """
    login_complete = _is_today(user.get("last_daily_claim"))
    move_complete = _safe_int(user.get("daily_steps")) > 0
    play_complete = _safe_int(user.get("games_played_today")) > 0
    learn_complete = bool(user.get("daily_learn_completed"))

    completed_count = sum(
        [
            1 if login_complete else 0,
            1 if move_complete else 0,
            1 if play_complete else 0,
            1 if learn_complete else 0,
        ]
    )

    full_loop_complete = (
        login_complete and move_complete and play_complete and learn_complete
    )

    return {
        "login": {
            "key": "login",
            "completed": login_complete,
            "reward": LOGIN_TASK_REWARD,
        },
        "move": {
            "key": "move",
            "completed": move_complete,
            "reward": MOVE_TASK_REWARD,
        },
        "play": {
            "key": "play",
            "completed": play_complete,
            "reward": PLAY_TASK_REWARD,
        },
        "learn": {
            "key": "learn",
            "completed": learn_complete,
            "reward": LEARN_TASK_REWARD,
        },
        "completed_count": completed_count,
        "total_tasks": 4,
        "full_loop_complete": full_loop_complete,
    }


async def maybe_mark_learn_task_complete(db, email: str) -> None:
    """
    Marks today's Learn task complete.
    Called by learn routes when a qualifying Learn action succeeds.
    """
    normalized_email = normalize_email(email)
    if not normalized_email:
        return

    now_iso = utc_now().isoformat()

    await db.users.update_one(
        {"email": normalized_email},
        {
            "$set": {
                "daily_learn_completed": True,
                "lessons_completed_today": 1,
                "last_daily_task_reset": today_key(),
                "updated_at": now_iso,
            }
        },
    )


async def check_and_reset_daily_task_state(db, user: dict) -> dict:
    """
    Resets per-day daily task helper fields at UTC day boundary.
    Does not erase lifetime counters.
    """
    now = utc_now()
    now_iso = now.isoformat()
    current_day = today_key()
    last_reset = user.get("last_daily_task_reset")

    should_reset = False

    if not last_reset:
        should_reset = True
    elif isinstance(last_reset, str) and len(last_reset) == 10:
        should_reset = last_reset < current_day
    else:
        last_reset_dt = _parse_datetime(last_reset)
        should_reset = not last_reset_dt or last_reset_dt.date() < now.date()

    if should_reset:
        lookup = _user_lookup(user)

        await db.users.update_one(
            lookup,
            {
                "$set": {
                    "daily_learn_completed": False,
                    "daily_full_loop_completed": False,
                    "lessons_completed_today": 0,
                    "games_played_today": 0,
                    "daily_steps": 0,
                    "last_daily_task_reset": current_day,
                    "updated_at": now_iso,
                }
            },
        )

        user["daily_learn_completed"] = False
        user["daily_full_loop_completed"] = False
        user["lessons_completed_today"] = 0
        user["games_played_today"] = 0
        user["daily_steps"] = 0
        user["last_daily_task_reset"] = current_day
        user["updated_at"] = now_iso

    return user


async def maybe_process_full_daily_loop(db, email: str) -> Dict[str, Any]:
    normalized_email = normalize_email(email)

    if not normalized_email:
      return {
          "success": False,
          "awarded": False,
          "reason": "email_required",
      }

    user = await db.users.find_one({"email": normalized_email})
    if not user:
        return {
            "success": False,
            "awarded": False,
            "reason": "user_not_found",
        }

    user = await check_and_reset_daily_task_state(db, user)
    task_state = get_daily_task_state(user)

    if not task_state["full_loop_complete"]:
        return {
            "success": True,
            "awarded": False,
            "reason": "full_loop_not_complete",
            "task_state": task_state,
        }

    if bool(user.get("daily_full_loop_completed", False)):
        return {
            "success": True,
            "awarded": False,
            "reason": "already_awarded_today",
            "task_state": task_state,
        }

    tier = str(user.get("tier", "zwapper")).lower().strip()
    daily_zpts = _safe_int(user.get("daily_zpts_earned", 0))

    tier_config = await get_tier_multipliers(tier)
    cap_check = await enforce_daily_caps(
        email=normalized_email,
        tier=tier,
        earned_today=daily_zpts,
        cap_type="zpts",
    )

    now_iso = utc_now().isoformat()

    if cap_check.get("capped"):
        await db.users.update_one(
            {"email": normalized_email},
            {
                "$inc": {
                    "badge_full_loop_days": 1,
                },
                "$set": {
                    "daily_full_loop_completed": True,
                    "updated_at": now_iso,
                },
            },
        )

        updated_user = await db.users.find_one({"email": normalized_email})
        if updated_user:
            await _persist_badges_safely(db, updated_user)

        return {
            "success": True,
            "awarded": False,
            "reason": "daily_cap_reached_loop_counted",
            "task_state": task_state,
            "full_loop_bonus": 0,
        }

    reward = min(FULL_LOOP_BONUS, _safe_int(cap_check.get("remaining")))

    await db.users.update_one(
        {"email": normalized_email},
        {
            "$inc": {
                "zpts_balance": reward,
                "daily_zpts_earned": reward,
                "lifetime_zpts": reward,
                "badge_zpts_earned": reward,
                "badge_full_loop_days": 1,
            },
            "$set": {
                "daily_zpts_date": today_key(),
                "daily_full_loop_completed": True,
                "updated_at": now_iso,
            },
        },
    )

    await db.rewards_ledger.insert_one(
        {
            "email": normalized_email,
            "currency": "zpts",
            "amount": reward,
            "source": "daily_full_loop",
            "reward_type": "daily_task_loop",
            "created_at": now_iso,
        }
    )

    updated_user = await db.users.find_one({"email": normalized_email})
    if updated_user:
        updated_user = await _persist_badges_safely(db, updated_user)
    else:
        updated_user = {}

    daily_cap = _safe_int(tier_config.get("daily_zpts_cap"))

    return {
        "success": True,
        "awarded": reward > 0,
        "reason": "full_loop_rewarded" if reward > 0 else "daily_cap_reached_loop_counted",
        "task_state": task_state,
        "full_loop_bonus": reward,
        "new_zpts_balance": _safe_int(updated_user.get("zpts_balance", 0)),
        "daily_zpts_remaining": max(
            0,
            daily_cap - _safe_int(updated_user.get("daily_zpts_earned", 0)),
        ),
        "badge_full_loop_days": _safe_int(updated_user.get("badge_full_loop_days", 0)),
        "badge_finisher_level": _safe_int(updated_user.get("badge_finisher_level", 0)),
        "badge_finisher_mastered": bool(
            updated_user.get("badge_finisher_mastered", False)
        ),
        "badge_trophies": _safe_int(updated_user.get("badge_trophies", 0)),
        "badge_trophy_bonus_percent": _safe_int(
            updated_user.get("badge_trophy_bonus_percent", 0)
        ),
    }