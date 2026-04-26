from typing import List, Dict
from datetime import datetime, timedelta, timezone


def utc_now():
    return datetime.now(timezone.utc)


async def get_dau(db) -> int:
    """
    Daily Active Users (last 24h based on updated_at)
    """
    since = utc_now() - timedelta(hours=24)

    return await db.users.count_documents({
        "updated_at": {"$gte": since.isoformat()}
    })


async def get_top_users_by_zpts(db, limit: int = 10) -> List[Dict]:
    """
    Top users by zPts balance (V1 uses zPts as primary progression signal)
    """
    cursor = db.users.find(
        {},
        {
            "_id": 0,
            "wallet_address": 1,
            "username": 1,
            "zpts_balance": 1,
            "tier": 1,
        },
    ).sort("zpts_balance", -1).limit(limit)

    results = []
    async for user in cursor:
        results.append({
            "wallet_address": user.get("wallet_address"),
            "username": user.get("username"),
            "zpts_balance": int(user.get("zpts_balance", 0)),
            "tier": user.get("tier", "starter"),
        })

    return results


async def get_top_users_by_zwap(db, limit: int = 10) -> List[Dict]:
    """
    Optional: top users by ZWAP balance (secondary signal)
    """
    cursor = db.users.find(
        {},
        {
            "_id": 0,
            "wallet_address": 1,
            "username": 1,
            "zwap_balance": 1,
            "tier": 1,
        },
    ).sort("zwap_balance", -1).limit(limit)

    results = []
    async for user in cursor:
        results.append({
            "wallet_address": user.get("wallet_address"),
            "username": user.get("username"),
            "zwap_balance": float(user.get("zwap_balance", 0)),
            "tier": user.get("tier", "starter"),
        })

    return results


async def get_overview(db) -> Dict:
    """
    Minimal V1 analytics snapshot
    """
    dau = await get_dau(db)
    total_users = await db.users.count_documents({})

    top_zpts = await get_top_users_by_zpts(db, limit=5)
    top_zwap = await get_top_users_by_zwap(db, limit=5)

    return {
        "dau": dau,
        "total_users": total_users,
        "top_zpts_users": top_zpts,
        "top_zwap_users": top_zwap,
        "generated_at": utc_now().isoformat(),
    }