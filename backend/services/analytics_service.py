from typing import List, Dict

async def get_dau(db) -> int:
    """
    Returns daily active users.
    """
    pipeline = [
        {"$match": {"last_active": {"$gte": datetime.utcnow().date()}}},
        {"$group": {"_id": None, "dau": {"$sum": 1}}}
    ]
    result = await db.users.aggregate(pipeline).to_list(length=1)
    return result[0]["dau"] if result else 0

async def get_top_earners(db, limit: int = 10) -> List[Dict]:
    """
    Returns top users by earned ZWAP.
    """
    cursor = db.users.find().sort("zwap_balance", -1).limit(limit)
    return [user async for user in cursor]

async def detect_abuse(db, threshold: float = 10000) -> List[Dict]:
    """
    Finds users exceeding a reward threshold for potential abuse.
    """
    pipeline = [
        {"$group": {"_id": "$user_id", "total_rewards": {"$sum": "$amount"}}},
        {"$match": {"total_rewards": {"$gt": threshold}}}
    ]
    return await db.rewards.aggregate(pipeline).to_list(length=None)
