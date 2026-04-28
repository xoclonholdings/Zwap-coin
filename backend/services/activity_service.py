from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_email(email: str) -> str:
    return str(email or "").lower().strip()


def safe_int(value, fallback=0):
    try:
        return int(value or fallback)
    except (TypeError, ValueError):
        return fallback


def calculate_calories_from_steps(steps: int) -> int:
    return round(max(0, steps) * 0.04)


def parse_dt(value: Optional[Any]) -> Optional[datetime]:
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
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed.astimezone(timezone.utc)
        except Exception:
            return None

    return None


async def get_activity_dashboard(db, email: str) -> Dict[str, Any]:
    safe_email = normalize_email(email)

    user = await db.users.find_one({"email": safe_email})

    if not user:
        return empty_activity_dashboard()

    daily_steps = safe_int(user.get("daily_steps"))
    total_steps = safe_int(user.get("total_steps") or daily_steps)
    step_goal = safe_int(user.get("daily_step_goal") or user.get("stepGoal"), 10000)

    zpts_balance = safe_int(user.get("zpts_balance"))
    daily_zpts = safe_int(user.get("daily_zpts_earned"))

    streak_days = safe_int(user.get("daily_streak"))
    calories = calculate_calories_from_steps(daily_steps)

    weekly_steps = await build_weekly_steps(db, safe_email, daily_steps)
    consistency = await build_consistency(db, safe_email, user)
    latest_signal = await get_latest_activity_signal(db, safe_email)

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
        "latestActivitySignal": latest_signal,
        "completedTaskCount": safe_int(user.get("completed_task_count")),
        "totalTaskCount": safe_int(user.get("total_task_count"), 4),
        "fullLoopCompleted": bool(user.get("full_loop_completed", False)),
        "dailySteps": daily_steps,
        "gamesPlayedToday": safe_int(user.get("games_played_today")),
        "lessonsCompletedToday": safe_int(user.get("lessons_completed_today")),
    }


def empty_activity_dashboard() -> Dict[str, Any]:
    return {
        "totalSteps": 0,
        "stepGoal": 10000,
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
        "latestActivitySignal": None,
        "completedTaskCount": 0,
        "totalTaskCount": 4,
        "fullLoopCompleted": False,
        "dailySteps": 0,
        "gamesPlayedToday": 0,
        "lessonsCompletedToday": 0,
    }


async def build_weekly_steps(
    db,
    email: str,
    fallback_today_steps: int = 0,
) -> List[Dict[str, Any]]:
    since = utc_now() - timedelta(days=6)

    cursor = db.activity_logs.find(
        {
            "email": email,
            "created_at": {"$gte": since.isoformat()},
            "type": "move",
        },
        {"_id": 0, "created_at": 1, "steps": 1},
    ).sort("created_at", 1)

    totals_by_day: Dict[str, int] = {}

    async for item in cursor:
        created_at = parse_dt(item.get("created_at"))
        if not created_at:
            continue

        day_key = created_at.date().isoformat()
        totals_by_day[day_key] = totals_by_day.get(day_key, 0) + safe_int(
            item.get("steps")
        )

    rows = []
    today = utc_now().date()

    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        day_key = day.isoformat()
        steps = totals_by_day.get(day_key, 0)

        if offset == 0 and steps == 0 and fallback_today_steps > 0:
            steps = fallback_today_steps

        rows.append(
            {
                "day": day.strftime("%a")[0],
                "steps": steps,
            }
        )

    return rows


async def build_consistency(
    db,
    email: str,
    user: Dict[str, Any],
) -> List[Dict[str, Any]]:
    since = utc_now() - timedelta(days=6)

    cursor = db.activity_logs.find(
        {
            "email": email,
            "created_at": {"$gte": since.isoformat()},
        },
        {"_id": 0, "created_at": 1, "steps": 1, "completed": 1, "type": 1},
    ).sort("created_at", 1)

    completed_by_day: Dict[str, bool] = {}

    async for item in cursor:
        created_at = parse_dt(item.get("created_at"))
        if not created_at:
            continue

        day_key = created_at.date().isoformat()
        completed = (
            bool(item.get("completed"))
            or safe_int(item.get("steps")) > 0
            or item.get("type") in {"login", "play", "learn", "shop_purchase"}
        )

        completed_by_day[day_key] = completed_by_day.get(day_key, False) or completed

    rows = []
    today = utc_now().date()

    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        day_key = day.isoformat()

        complete = completed_by_day.get(day_key, False)

        if offset == 0:
            complete = complete or safe_int(user.get("daily_steps")) > 0
            complete = complete or safe_int(user.get("games_played_today")) > 0
            complete = complete or bool(user.get("last_daily_claim"))
            complete = complete or bool(user.get("daily_learn_completed"))

        rows.append(
            {
                "day": day.strftime("%a")[0],
                "complete": complete,
            }
        )

    return rows


async def get_latest_activity_signal(db, email: str) -> Optional[Dict[str, Any]]:
    event = await db.activity_logs.find_one(
        {"email": email},
        {"_id": 0},
        sort=[("created_at", -1)],
    )

    if not event:
        return None

    return {
        "type": event.get("type", ""),
        "message": event.get("message", ""),
        "priority": event.get("priority", "normal"),
        "zpts": event.get("zpts", 0),
        "zwap": event.get("zwap", 0),
        "steps": event.get("steps", 0),
        "game": event.get("game"),
        "item_id": event.get("item_id"),
        "item_name": event.get("item_name"),
        "created_at": event.get("created_at"),
    }


def calculate_average_steps(weekly_steps: List[Dict[str, Any]]) -> int:
    if not weekly_steps:
        return 0

    total = sum(safe_int(item.get("steps")) for item in weekly_steps)
    return round(total / max(1, len(weekly_steps)))


def build_personal_bests(user: Dict[str, Any]) -> List[Dict[str, Any]]:
    bests = []

    best_steps = safe_int(user.get("best_steps"))
    if best_steps > 0:
        bests.append(
            {
                "type": "steps",
                "label": "Most Steps",
                "value": best_steps,
                "date": user.get("best_steps_date"),
            }
        )

    best_calories = safe_int(user.get("best_calories"))
    if best_calories > 0:
        bests.append(
            {
                "type": "calories",
                "label": "Most Calories",
                "value": best_calories,
                "date": user.get("best_calories_date"),
            }
        )

    best_active_time = user.get("best_active_time")
    if best_active_time:
        bests.append(
            {
                "type": "time",
                "label": "Longest Active",
                "value": best_active_time,
                "date": user.get("best_active_time_date"),
            }
        )

    return bests