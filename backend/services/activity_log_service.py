from datetime import datetime, timezone
from typing import Any, Dict, Optional
import uuid


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_email(email: str) -> str:
    return str(email or "").lower().strip()


def safe_int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value or fallback)
    except Exception:
        return fallback


def safe_float(value: Any, fallback: float = 0.0) -> float:
    try:
        return float(value or fallback)
    except Exception:
        return fallback


async def log_activity(
    db,
    email: str,
    activity_type: str,
    message: str = "",
    zpts: int = 0,
    zwap: float = 0.0,
    steps: int = 0,
    game: Optional[str] = None,
    item_id: Optional[str] = None,
    item_name: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    normalized_email = normalize_email(email)
    activity = str(activity_type or "").lower().strip()

    if not normalized_email or not activity:
        return {
            "success": False,
            "reason": "email_and_activity_type_required",
        }

    now_iso = utc_now_iso()

    event = {
        "id": str(uuid.uuid4()),
        "email": normalized_email,
        "type": activity,
        "message": message,
        "zpts": safe_int(zpts),
        "zwap": safe_float(zwap),
        "steps": safe_int(steps),
        "game": game,
        "item_id": item_id,
        "item_name": item_name,
        "metadata": metadata or {},
        "completed": True,
        "created_at": now_iso,
    }

    await db.activity_logs.insert_one(dict(event))

    return {
        "success": True,
        "event": event,
    }


async def get_latest_activity_signal(db, email: str) -> Optional[Dict[str, Any]]:
    normalized_email = normalize_email(email)

    if not normalized_email:
        return None

    event = await db.activity_logs.find_one(
        {"email": normalized_email},
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