from typing import List, Dict
from datetime import datetime


async def get_dau(db) -> int:
    """
    Returns daily active users.
    """
    pipeline = [
        {"$match": {"last_active": {"$gte": datetime.utcnow()}}},
        {"$group": {"_id": None, "dau": {"$sum": 1}}},
    ]
    result = await db.users.aggregate(pipeline).to_list(length=1)
    return result[0]["dau"] if result else 0


async def get_top_earners(db, limit: int = 10) -> List[Dict]:
    """
    Returns top users by earned ZWAP.
    Safe for FastAPI JSON serialization.
    """
    cursor = db.users.find(
        {},
        {
            "_id": 0,
            "id": 1,
            "wallet_address": 1,
            "username": 1,
            "zwap_balance": 1,
            "tier": 1,
        },
    ).sort("zwap_balance", -1).limit(limit)

    users = []
    async for user in cursor:
        users.append({
            "id": user.get("id"),
            "wallet_address": user.get("wallet_address"),
            "username": user.get("username"),
            "zwap_balance": user.get("zwap_balance", 0),
            "tier": user.get("tier", "starter"),
        })
    return users


async def detect_abuse(db, threshold: float = 10000) -> List[Dict]:
    """
    Finds users exceeding a reward threshold for potential abuse.
    Safe for FastAPI JSON serialization.
    """
    pipeline = [
        {"$group": {"_id": "$user_id", "total_rewards": {"$sum": "$amount"}}},
        {"$match": {"total_rewards": {"$gt": threshold}}},
    ]

    results = await db.rewards.aggregate(pipeline).to_list(length=None)

    cleaned = []
    for row in results:
        cleaned.append({
            "user_id": str(row.get("_id")) if row.get("_id") is not None else None,
            "total_rewards": row.get("total_rewards", 0),
        })
    return cleaned


async def get_overview(db, days: int = 30) -> Dict:
    """
    Minimal analytics overview for admin dashboard compatibility.
    """
    dau = await get_dau(db)
    top_earners = await get_top_earners(db, limit=5)
    abuse_flags = await detect_abuse(db)

    total_users = await db.users.count_documents({})

    return {
        "dau": dau,
        "total_users": total_users,
        "top_earners": top_earners,
        "abuse_flags": abuse_flags,
        "days": days,
    }