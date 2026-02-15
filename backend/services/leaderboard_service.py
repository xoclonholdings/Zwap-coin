import hashlib
import math
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple


# -------------------------
# Helpers (pure functions)
# -------------------------

def generate_username(wallet_address: str, salt: str = "ZWAP") -> str:
    """
    Deterministic anonymized username from wallet address.
    Keep stable for leaderboards without exposing wallet.
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


# -------------------------
# Public API
# -------------------------

async def get_global_stats_and_top(
    db,
    category: str,
    limit: int = 50,
    include_anonymized_name: bool = True,
) -> Dict[str, Any]:
    """
    Returns global stats and top users for a leaderboard category.

    Expected collections/fields (adjust mapping as your schema dictates):
      - users collection
      - users.wallet_address (string)
      - users.steps_total (int)            for category="steps"
      - users.games_played_total (int)     for category="games"
      - users.zwap_earned_total (number)   for category="earned"
      - users.zpts_balance (int)           for category="zpts"
      - users.region (string, optional)    used by regional rank helpers
    """
    sort_field = _category_to_field(category)

    # Global totals snapshot (optional but useful for dashboards)
    totals_pipeline = [
        {"$group": {
            "_id": None,
            "users": {"$sum": 1},
            "sum_value": {"$sum": {"$ifNull": [f"${sort_field}", 0]}},
            "max_value": {"$max": {"$ifNull": [f"${sort_field}", 0]}},
        }}
    ]
    totals = await db.users.aggregate(totals_pipeline).to_list(length=1)
    totals_doc = totals[0] if totals else {"users": 0, "sum_value": 0, "max_value": 0}

    # Top list
    cursor = (
        db.users.find(
            {},
            {
                "_id": 0,
                "wallet_address": 1,
                sort_field: 1,
                "region": 1,
            },
        )
        .sort(sort_field, -1)
        .limit(max(1, int(limit)))
    )

    top: List[Dict[str, Any]] = []
    rank = 1
    async for u in cursor:
        wallet = u.get("wallet_address")
        value = u.get(sort_field, 0)
        entry = {
            "rank": rank,
            "wallet_address": wallet,
            "value": value,
        }
        if include_anonymized_name and wallet:
            entry["username"] = generate_username(wallet)
        if "region" in u:
            entry["region"] = u.get("region")
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
    Returns the user's global rank + approximations for local/regional ranks.

    NOTE on "local_rank" and "regional_rank":
      Your whitepaper mentions these are simplified approximations (fraction of global rank).
      We implement:
        - global_rank: exact via count of users above
        - regional_rank: exact within region if region exists, else approximation
        - local_rank: approximation based on global_rank (configurable)
    """
    sort_field = _category_to_field(category)

    user = await db.users.find_one(
        {"wallet_address": wallet_address},
        {"_id": 0, "wallet_address": 1, sort_field: 1, "region": 1},
    )
    if not user:
        return {
            "category": category,
            "wallet_address": wallet_address,
            "found": False,
            "generated_at": _utc_now().isoformat(),
        }

    user_value = user.get(sort_field, 0)
    region = user.get("region")

    # Exact global rank: 1 + number of users strictly greater than user_value
    global_above = await db.users.count_documents({sort_field: {"$gt": user_value}})
    global_rank = global_above + 1

    # Total users for context
    total_users = await db.users.count_documents({})

    # Regional rank exact if region present
    regional_rank = None
    regional_total = None
    if region:
        regional_total = await db.users.count_documents({"region": region})
        regional_above = await db.users.count_documents(
            {"region": region, sort_field: {"$gt": user_value}}
        )
        regional_rank = regional_above + 1
    else:
        # fallback approximation: scale rank by a factor
        # (keeps behavior consistent with "simplified approximation")
        regional_rank = max(1, int(math.ceil(global_rank * 0.25)))
        regional_total = max(1, int(math.ceil(total_users * 0.25)))

    # Local rank approximation: smaller fraction
    local_rank = max(1, int(math.ceil(global_rank * 0.10)))
    local_total = max(1, int(math.ceil(total_users * 0.10)))

    result: Dict[str, Any] = {
        "found": True,
        "category": category,
        "field": sort_field,
        "generated_at": _utc_now().isoformat(),
        "wallet_address": wallet_address,
        "value": user_value,
        "global": {
            "rank": global_rank,
            "total": total_users,
        },
        "regional": {
            "rank": regional_rank,
            "total": regional_total,
            "region": region,
            "is_approx": False if region else True,
        },
        "local": {
            "rank": local_rank,
            "total": local_total,
            "is_approx": True,
        },
    }

    if include_anonymized_name:
        result["username"] = generate_username(wallet_address)

    if include_neighbors and include_neighbors > 0:
        neighbors = await _get_rank_neighbors(
            db=db,
            category=category,
            sort_field=sort_field,
            user_value=user_value,
            wallet_address=wallet_address,
            span=include_neighbors,
            include_anonymized_name=include_anonymized_name,
        )
        result["neighbors"] = neighbors

    return result


async def get_top_leaderboard(
    db,
    category: str,
    limit: int = 100,
    include_anonymized_name: bool = True,
) -> List[Dict[str, Any]]:
    """
    Convenience: just the top list.
    """
    data = await get_global_stats_and_top(
        db=db,
        category=category,
        limit=limit,
        include_anonymized_name=include_anonymized_name,
    )
    return data["top"]


# -------------------------
# Internals
# -------------------------

def _category_to_field(category: str) -> str:
    mapping = {
        "steps": "steps_total",
        "games": "games_played_total",
        "earned": "zwap_earned_total",
        "zpts": "zpts_balance",
    }
    if category not in mapping:
        raise ValueError(f"Unsupported leaderboard category: {category}")
    return mapping[category]


async def _get_rank_neighbors(
    db,
    category: str,
    sort_field: str,
    user_value: Any,
    wallet_address: str,
    span: int,
    include_anonymized_name: bool,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Returns nearby users above and below the user's value for context.
    """
    # Above: users with greater value, closest first
    above_cursor = (
        db.users.find(
            {sort_field: {"$gt": user_value}},
            {"_id": 0, "wallet_address": 1, sort_field: 1},
        )
        .sort(sort_field, 1)
        .limit(span)
    )

    # Below: users with less value, closest first
    below_cursor = (
        db.users.find(
            {sort_field: {"$lt": user_value}},
            {"_id": 0, "wallet_address": 1, sort_field: 1},
        )
        .sort(sort_field, -1)
        .limit(span)
    )

    above: List[Dict[str, Any]] = []
    async for u in above_cursor:
        w = u.get("wallet_address")
        e = {"wallet_address": w, "value": u.get(sort_field, 0)}
        if include_anonymized_name and w:
            e["username"] = generate_username(w)
        above.append(e)

    below: List[Dict[str, Any]] = []
    async for u in below_cursor:
        w = u.get("wallet_address")
        e = {"wallet_address": w, "value": u.get(sort_field, 0)}
        if include_anonymized_name and w:
            e["username"] = generate_username(w)
        below.append(e)

    # Self (optional context)
    me = {"wallet_address": wallet_address, "value": user_value}
    if include_anonymized_name:
        me["username"] = generate_username(wallet_address)

    return {"above": above, "me": [me], "below": below}
