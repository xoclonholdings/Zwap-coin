from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List


ACTIVITY_TTL_MINUTES = 20


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_activity_event(
    event_type: str,
    message: str,
    scope_flags: Dict[str, bool] | None = None,
    actor_user_id: str | None = None,
    actor_display: str | None = None,
    actor_badge: str | None = None,
    target_user_id: str | None = None,
    target_display: str | None = None,
    region_key: str | None = None,
    local_key: str | None = None,
    metadata: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    now = utc_now()

    return {
        "event_type": event_type,
        "message": message,
        "scope_flags": scope_flags or {
            "local": True,
            "region": True,
            "global": True,
        },
        "actor_user_id": actor_user_id,
        "actor_display": actor_display,
        "actor_badge": actor_badge,
        "target_user_id": target_user_id,
        "target_display": target_display,
        "region_key": region_key,
        "local_key": local_key,
        "reaction_counts": {
            "heart": 0,
            "fire": 0,
            "clap": 0,
        },
        "metadata": metadata or {},
        "created_at": now,
        "expires_at": now + timedelta(minutes=ACTIVITY_TTL_MINUTES),
    }


async def create_activity_event(db, event: Dict[str, Any]) -> str:
    result = await db.activity_events.insert_one(event)
    return str(result.inserted_id)


async def get_activity_stream_for_user(
    db,
    wallet_address: str,
    limit: int = 8,
) -> Dict[str, List[Dict[str, Any]]]:
    now = utc_now()

    cursor = db.activity_events.find(
        {
            "expires_at": {"$gt": now}
        }
    ).sort("created_at", -1).limit(50)

    items = await cursor.to_list(length=50)

    local_items = []
    region_items = []
    global_items = []

    for item in items:
        item["id"] = str(item.pop("_id"))

        if item.get("scope_flags", {}).get("local") and len(local_items) < limit:
            local_items.append(item)

        if item.get("scope_flags", {}).get("region") and len(region_items) < limit:
            region_items.append(item)

        if item.get("scope_flags", {}).get("global") and len(global_items) < limit:
            global_items.append(item)

    return {
        "local": local_items,
        "region": region_items,
        "global": global_items,
    }