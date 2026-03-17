import hashlib
import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


# -------------------------
# Helpers (pure functions)
# -------------------------

def generate_username(wallet_address: str, salt: str = "ZWAP") -> str:
    """
    Deterministic anonymized username from wallet address.
    Keeps leaderboard display stable without exposing full wallet.
    """
    raw = f"{salt}:{wallet_address.lower()}".encode("utf-8")
    h = hashlib.sha256(raw).hexdigest()
    return f"zwapper_{h[:8]}"


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _safe_int(x: Any, default: int = 0) -> int:
    try:
        return int(x)
    except Exception:
        return default


def _safe_float(x: Any, default: float = 0.0) -> float:
    try:
        return float(x)
    except Exception:
        return default


def _mask_wallet(wallet_address: Optional[str]) -> str:
    if not wallet_address:
        return "unknown"
    wallet = str(wallet_address)
    if len(wallet) < 10:
        return wallet
    return f"{wallet[:6]}...{wallet[-4:]}"


def _category_to_field(category: str) -> str:
    """
    Match current live user schema in server.py / MongoDB.
    """
    mapping = {
        "steps": "total_steps",
        "games": "games_played",
        "earned": "total_earned",
        "zpts": "zpts_balance",
    }
    if category not in mapping:
        raise ValueError(f"Unsupported leaderboard category: {category}")
    return mapping[category]


# -------------------------
# Public API
# -------------------------

async def get_global_stats_and_top(
    db,
    category: str,
    limit: int = 50,
    include_anonymized_name: bool = True,
    include_wallet_preview: bool = True,
) -> Dict[str, Any]:
    """
    Returns:
    - totals for the selected category
    - top users for the selected category
    - global summary values useful for dashboards/ticker UI
    """
    sort_field = _category_to_field(category)
    limit = max(1, min(int(limit), 100))

    totals_pipeline = [
        {
            "$group": {
                "_id": None,
                "users": {"$sum": 1},
                "sum_value": {"$sum": {"$ifNull": [f"${sort_field}", 0]}},
                "max_value": {"$max": {"$ifNull": [f"${sort_field}", 0]}},
            }
        }
    ]
    totals = await db.users.aggregate(totals_pipeline).to_list(length=1)
    totals_doc = totals[0] if totals else {"users": 0, "sum_value": 0, "max_value": 0}

    cursor = (
        db.users.find(
            {},
            {
                "_id": 0,
                "wallet_address": 1,
                sort_field: 1,
                "tier": 1,
                "region": 1,
            },
        )
        .sort(sort_field, -1)
        .limit(limit)
    )

    top: List[Dict[str, Any]] = []
    rank = 1

    async for user in cursor:
        wallet = user.get("wallet_address")
        value = user.get(sort_field, 0)

        entry: Dict[str, Any] = {
            "rank": rank,
            "wallet_address": wallet,
            "value": value,
            "tier": user.get("tier", "starter"),
        }

        if include_wallet_preview:
            entry["wallet"] = _mask_wallet(wallet)

        if include_anonymized_name and wallet:
            entry["username"] = generate_username(wallet)

        if "region" in user:
            entry["region"] = user.get("region")

        top.append(entry)
        rank += 1

    return {
        "category": category,
        "field": sort_field,
        "generated_at": _utc_now().isoformat(),
        "totals": {
            "users": _safe_int(totals_doc.get("users")),
            "sum_value": totals_doc.get("sum_value", 0),
            "max_value": totals_doc.get("max_value", 0),
        },
        "top": top,
    }


async def get_user_rank(
    db,
    wallet_address: str,
    category: str,
    include_neighbors: int = 0,
    include_anonymized_name: bool = True,
) -> Dict[str, Any]:
    """
    Returns user rank data for one leaderboard category.

    Ranking behavior:
    - global rank: exact
    - regional rank: exact if region exists, otherwise approximation
    - local rank: approximation
    """
    sort_field = _category_to_field(category)
    wallet = wallet_address.lower()

    user = await db.users.find_one(
        {"wallet_address": wallet},
        {"_id": 0, "wallet_address": 1, sort_field: 1, "region": 1, "tier": 1},
    )

    if not user:
        return {
            "found": False,
            "category": category,
            "wallet_address": wallet,
            "generated_at": _utc_now().isoformat(),
        }

    user_value = user.get(sort_field, 0)
    region = user.get("region")
    tier = user.get("tier", "starter")

    global_above = await db.users.count_documents({sort_field: {"$gt": user_value}})
    global_rank = global_above + 1
    total_users = await db.users.count_documents({})

    if region:
        regional_total = await db.users.count_documents({"region": region})
        regional_above = await db.users.count_documents(
            {"region": region, sort_field: {"$gt": user_value}}
        )
        regional_rank = regional_above + 1
        regional_is_approx = False
    else:
        regional_rank = max(1, int(math.ceil(global_rank * 0.25)))
        regional_total = max(1, int(math.ceil(total_users * 0.25)))
        regional_is_approx = True

    local_rank = max(1, int(math.ceil(global_rank * 0.10)))
    local_total = max(1, int(math.ceil(total_users * 0.10)))

    result: Dict[str, Any] = {
        "found": True,
        "category": category,
        "field": sort_field,
        "generated_at": _utc_now().isoformat(),
        "wallet_address": wallet,
        "wallet": _mask_wallet(wallet),
        "tier": tier,
        "value": user_value,
        "global_rank": global_rank,
        "regional_rank": regional_rank,
        "local_rank": local_rank,
        "total_users": total_users,
        "global": {
            "rank": global_rank,
            "total": total_users,
        },
        "regional": {
            "rank": regional_rank,
            "total": regional_total,
            "region": region,
            "is_approx": regional_is_approx,
        },
        "local": {
            "rank": local_rank,
            "total": local_total,
            "is_approx": True,
        },
    }

    if include_anonymized_name:
        result["username"] = generate_username(wallet)

    if include_neighbors and include_neighbors > 0:
        result["neighbors"] = await _get_rank_neighbors(
            db=db,
            sort_field=sort_field,
            user_value=user_value,
            wallet_address=wallet,
            span=include_neighbors,
            include_anonymized_name=include_anonymized_name,
        )

    return result


async def get_top_leaderboard(
    db,
    category: str,
    limit: int = 100,
    include_anonymized_name: bool = True,
) -> List[Dict[str, Any]]:
    data = await get_global_stats_and_top(
        db=db,
        category=category,
        limit=limit,
        include_anonymized_name=include_anonymized_name,
        include_wallet_preview=True,
    )
    return data["top"]


async def get_leaderboard_overview(db) -> Dict[str, Any]:
    """
    Future-friendly dashboard summary across all main leaderboard categories.
    """
    total_users = await db.users.count_documents({})

    top_earner = await db.users.find_one(
        {},
        {"_id": 0, "wallet_address": 1, "total_earned": 1, "tier": 1},
        sort=[("total_earned", -1)],
    )
    top_gamer = await db.users.find_one(
        {},
        {"_id": 0, "wallet_address": 1, "games_played": 1, "tier": 1},
        sort=[("games_played", -1)],
    )
    top_stepper = await db.users.find_one(
        {},
        {"_id": 0, "wallet_address": 1, "total_steps": 1, "tier": 1},
        sort=[("total_steps", -1)],
    )

    earned_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_earned"}}}]
    steps_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_steps"}}}]
    zpts_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$zpts_balance"}}}]

    earned_result = await db.users.aggregate(earned_pipeline).to_list(length=1)
    steps_result = await db.users.aggregate(steps_pipeline).to_list(length=1)
    zpts_result = await db.users.aggregate(zpts_pipeline).to_list(length=1)

    total_zwap_distributed = earned_result[0]["total"] if earned_result else 0
    total_steps_walked = steps_result[0]["total"] if steps_result else 0
    total_zpts_held = zpts_result[0]["total"] if zpts_result else 0

    def format_top(user: Optional[Dict[str, Any]], field: str) -> Dict[str, Any]:
        if not user:
            return {
                "username": "N/A",
                "wallet": "N/A",
                "value": 0,
                "tier": "starter",
            }
        wallet = user.get("wallet_address")
        return {
            "username": generate_username(wallet) if wallet else "N/A",
            "wallet": _mask_wallet(wallet),
            "value": user.get(field, 0),
            "tier": user.get("tier", "starter"),
        }

    return {
        "generated_at": _utc_now().isoformat(),
        "total_users": total_users,
        "total_zwap_distributed": round(_safe_float(total_zwap_distributed), 2),
        "total_steps_walked": _safe_int(total_steps_walked),
        "total_zpts_held": _safe_int(total_zpts_held),
        "top_earner": format_top(top_earner, "total_earned"),
        "top_gamer": format_top(top_gamer, "games_played"),
        "top_stepper": format_top(top_stepper, "total_steps"),
    }


# -------------------------
# Internals
# -------------------------

async def _get_rank_neighbors(
    db,
    sort_field: str,
    user_value: Any,
    wallet_address: str,
    span: int,
    include_anonymized_name: bool,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Returns nearby users above and below the user's value for context.
    """
    span = max(1, min(int(span), 10))

    above_cursor = (
        db.users.find(
            {sort_field: {"$gt": user_value}},
            {"_id": 0, "wallet_address": 1, sort_field: 1, "tier": 1},
        )
        .sort(sort_field, 1)
        .limit(span)
    )

    below_cursor = (
        db.users.find(
            {sort_field: {"$lt": user_value}},
            {"_id": 0, "wallet_address": 1, sort_field: 1, "tier": 1},
        )
        .sort(sort_field, -1)
        .limit(span)
    )

    above: List[Dict[str, Any]] = []
    async for user in above_cursor:
        wallet = user.get("wallet_address")
        entry = {
            "wallet_address": wallet,
            "wallet": _mask_wallet(wallet),
            "value": user.get(sort_field, 0),
            "tier": user.get("tier", "starter"),
        }
        if include_anonymized_name and wallet:
            entry["username"] = generate_username(wallet)
        above.append(entry)

    below: List[Dict[str, Any]] = []
    async for user in below_cursor:
        wallet = user.get("wallet_address")
        entry = {
            "wallet_address": wallet,
            "wallet": _mask_wallet(wallet),
            "value": user.get(sort_field, 0),
            "tier": user.get("tier", "starter"),
        }
        if include_anonymized_name and wallet:
            entry["username"] = generate_username(wallet)
        below.append(entry)

    me = {
        "wallet_address": wallet_address,
        "wallet": _mask_wallet(wallet_address),
        "value": user_value,
    }
    if include_anonymized_name:
        me["username"] = generate_username(wallet_address)

    return {
        "above": above,
        "me": [me],
        "below": below,
    }