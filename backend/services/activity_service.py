# backend/services/activity_service.py

from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any


def utc_now():
    return datetime.now(timezone.utc)


def safe_int(value, fallback=0):
    try:
        return int(value or 0)
    except (TypeError, ValueError):
        return fallback


def calculate_calories_from_steps(steps: int) -> int:
    return round(max(0, steps) * 0.04)


async def get_activity_dashboard(db, wallet_address: str) -> Dict[str, Any]:
    user = await db.users.find_one({"wallet_address": wallet_address})

    if not user:
        return {
            "totalSteps": 0,
            "stepGoal": 0,
            "stepChangePercent": 0,
            "avgSteps": 0,
            "calories": 0,
            "activeTime": "0m",
            "zptsEarned": 0,
            "avgStepsChangePercent": 0,
            "caloriesChangePercent": 0,
            "activeTimeChangePercent": 0,
            "zptsChangePercent": 0,
            "weeklySteps": [],
            "consistency": [],
            "streakDays": 0,
            "personalBests": [],
        }

    daily_steps = safe_int(
        user.get("daily_steps")
        or user.get("todaySteps")
        or user.get("stepsToday")
        or user.get("steps")
    )

    total_steps = safe_int(user.get("total_steps") or daily_steps)
    step_goal = safe_int(user.get("daily_step_goal") or user.get("stepGoal"), 10000)

    zpts_balance = safe_int(user.get("zpts_balance") or user.get("zptsBalance"))
    daily_zpts = safe_int(user.get("daily_zpts_earned") or user.get("zptsToday"))

    streak_days = safe_int(user.get("daily_streak") or user.get("streakDays"))

    calories = calculate_calories_from_steps(daily_steps)

    weekly_steps = await build_weekly_steps(db, wallet_address)
    consistency = await build_consistency(db, wallet_address)

    avg_steps = calculate_average_steps(weekly_steps)

    return {
        "totalSteps": total_steps,
        "stepGoal": step_goal,
        "stepChangePercent": 0,
        "avgSteps": avg_steps,
        "calories": calories,
        "activeTime": user.get("active_time") or "0m",
        "zptsEarned": daily_zpts or zpts_balance,
        "avgStepsChangePercent": 0,
        "caloriesChangePercent": 0,
        "activeTimeChangePercent": 0,
        "zptsChangePercent": 0,
        "weeklySteps": weekly_steps,
        "consistency": consistency,
        "streakDays": streak_days,
        "personalBests": build_personal_bests(user),
    }


async def build_weekly_steps(db, wallet_address: str) -> List[Dict[str, Any]]:
    """
    Uses activity_logs if available.
    Falls back to empty list if the collection does not exist or has no rows.
    """
    since = utc_now() - timedelta(days=7)

    cursor = db.activity_logs.find(
        {
            "wallet_address": wallet_address,
            "created_at": {"$gte": since.isoformat()},
        },
        {"_id": 0, "created_at": 1, "steps": 1},
    ).sort("created_at", 1)

    rows = []
    async for item in cursor:
        created_at = item.get("created_at")
        day = "?"
        try:
            day = datetime.fromisoformat(created_at).strftime("%a")[0]
        except Exception:
            pass

        rows.append({
            "day": day,
            "steps": safe_int(item.get("steps")),
        })

    return rows


async def build_consistency(db, wallet_address: str) -> List[Dict[str, Any]]:
    """
    Uses activity_logs if available.
    A day is complete if steps > 0 or completed === true.
    """
    since = utc_now() - timedelta(days=7)

    cursor = db.activity_logs.find(
        {
            "wallet_address": wallet_address,
            "created_at": {"$gte": since.isoformat()},
        },
        {"_id": 0, "created_at": 1, "steps": 1, "completed": 1},
    ).sort("created_at", 1)

    rows = []
    async for item in cursor:
        created_at = item.get("created_at")
        day = "?"
        try:
            day = datetime.fromisoformat(created_at).strftime("%a")[0]
        except Exception:
            pass

        complete = bool(item.get("completed")) or safe_int(item.get("steps")) > 0

        rows.append({
            "day": day,
            "complete": complete,
        })

    return rows


def calculate_average_steps(weekly_steps: List[Dict[str, Any]]) -> int:
    if not weekly_steps:
        return 0

    total = sum(safe_int(item.get("steps")) for item in weekly_steps)
    return round(total / max(1, len(weekly_steps)))


def build_personal_bests(user: Dict[str, Any]) -> List[Dict[str, Any]]:
    bests = []

    best_steps = safe_int(user.get("best_steps"))
    if best_steps > 0:
        bests.append({
            "type": "steps",
            "label": "Most Steps",
            "value": best_steps,
            "date": user.get("best_steps_date"),
        })

    best_calories = safe_int(user.get("best_calories"))
    if best_calories > 0:
        bests.append({
            "type": "calories",
            "label": "Most Calories",
            "value": best_calories,
            "date": user.get("best_calories_date"),
        })

    best_active_time = user.get("best_active_time")
    if best_active_time:
        bests.append({
            "type": "time",
            "label": "Longest Active",
            "value": best_active_time,
            "date": user.get("best_active_time_date"),
        })

    return bests