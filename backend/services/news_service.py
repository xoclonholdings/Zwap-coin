from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

DEFAULT_NEWS_LIMIT = 50


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


async def list_news(
    db,
    limit: int = DEFAULT_NEWS_LIMIT,
    since: Optional[datetime] = None,
    active_only: bool = True,
) -> List[Dict[str, Any]]:
    """
    Fetch news ticker items.

    Suggested schema (adjust as needed):
      collection: news
      fields:
        - _id
        - title (str)
        - body (str)
        - url (str, optional)
        - created_at (datetime)
        - published_at (datetime, optional)
        - is_active (bool)
        - priority (int, optional) higher = more visible
        - tags (list[str], optional)
    """
    query: Dict[str, Any] = {}
    if active_only:
        query["is_active"] = True
    if since:
        query["created_at"] = {"$gte": since}

    cursor = (
        db.news.find(query, {"_id": 0})
        .sort([("priority", -1), ("created_at", -1)])
        .limit(max(1, int(limit)))
    )

    return [doc async for doc in cursor]


async def create_news_item(
    db,
    title: str,
    body: str,
    url: Optional[str] = None,
    published_at: Optional[datetime] = None,
    priority: int = 0,
    tags: Optional[List[str]] = None,
    is_active: bool = True,
) -> Dict[str, Any]:
    """
    Admin create. No FastAPI auth here; routes guard access.
    """
    if not title or not body:
        raise ValueError("title and body are required")

    doc: Dict[str, Any] = {
        "title": title.strip(),
        "body": body.strip(),
        "url": url.strip() if url else None,
        "created_at": _utc_now(),
        "published_at": published_at,
        "priority": int(priority),
        "tags": tags or [],
        "is_active": bool(is_active),
    }

    res = await db.news.insert_one(doc)
    # Return without _id if you prefer, but keeping it is often useful:
    doc["_id"] = str(res.inserted_id)
    return doc


async def update_news_item(
    db,
    item_id,
    updates: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Update specific fields.
    - item_id may be ObjectId already or whatever your routes pass.
    - Updates are applied as $set.
    """
    if not updates:
        raise ValueError("updates cannot be empty")

    # Normalize allowed fields (prevents accidental overwrite)
    allowed = {
        "title", "body", "url", "published_at", "priority", "tags", "is_active"
    }
    safe_set = {k: v for k, v in updates.items() if k in allowed}
    if not safe_set:
        raise ValueError("no valid fields in updates")

    safe_set["updated_at"] = _utc_now()

    await db.news.update_one({"_id": item_id}, {"$set": safe_set})
    doc = await db.news.find_one({"_id": item_id}, {"_id": 0})
    return doc or {"updated": False}


async def deactivate_news_item(db, item_id) -> Dict[str, Any]:
    """
    Soft-delete / deactivate.
    """
    await db.news.update_one(
        {"_id": item_id},
        {"$set": {"is_active": False, "updated_at": _utc_now()}},
    )
    return {"_id": str(item_id), "is_active": False}


async def get_news_stats(db) -> Dict[str, Any]:
    """
    Operational stats: counts by active/inactive, newest item timestamp.
    Useful for admin dashboards.
    """
    total = await db.news.count_documents({})
    active = await db.news.count_documents({"is_active": True})
    newest = await db.news.find({}, {"_id": 0, "created_at": 1}).sort("created_at", -1).limit(1).to_list(1)
    newest_ts = newest[0]["created_at"].isoformat() if newest and newest[0].get("created_at") else None

    return {
        "total": total,
        "active": active,
        "inactive": total - active,
        "newest_created_at": newest_ts,
        "generated_at": _utc_now().isoformat(),
    }
