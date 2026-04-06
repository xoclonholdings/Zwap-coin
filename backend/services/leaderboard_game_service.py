from typing import Any, Dict, List


def game_to_field(game_id: str) -> str:
    """
    Public game IDs use the renamed arcade system only.
    Internal field mapping still points to the existing stored DB fields.
    """
    mapping = {
        "breakerz": "personal_best_zbrickles",
        "brainz": "personal_best_ztrivia",
        "stackz": "personal_best_ztetris",
        "pulze": "personal_best_zslots",
    }
    if game_id not in mapping:
        raise ValueError(f"Unsupported leaderboard game: {game_id}")
    return mapping[game_id]


async def get_top_game_leaderboard(
    db,
    game_id: str,
    limit: int,
    include_anonymized_name: bool,
    include_wallet_preview: bool,
    generate_username,
    mask_wallet,
) -> List[Dict[str, Any]]:
    sort_field = game_to_field(game_id)
    limit = max(1, min(int(limit), 100))

    cursor = (
        db.users.find(
            {sort_field: {"$gt": 0}},
            {
                "_id": 0,
                "wallet_address": 1,
                "username": 1,
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
            "game_id": game_id,
            "wallet_address": wallet,
            "value": value,
            "tier": user.get("tier", "starter"),
        }

        if include_wallet_preview:
            entry["wallet"] = mask_wallet(wallet)

        if include_anonymized_name and wallet:
            entry["username"] = user.get("username") or generate_username(wallet)

        if "region" in user:
            entry["region"] = user.get("region")

        top.append(entry)
        rank += 1

    return top


async def get_user_game_rank(
    db,
    wallet_address: str,
    game_id: str,
    include_anonymized_name: bool,
    generate_username,
    mask_wallet,
) -> Dict[str, Any]:
    sort_field = game_to_field(game_id)
    wallet = wallet_address.lower()

    user = await db.users.find_one(
        {"wallet_address": wallet},
        {
            "_id": 0,
            "wallet_address": 1,
            "username": 1,
            sort_field: 1,
            "region": 1,
            "tier": 1,
        },
    )

    if not user:
        return {
            "found": False,
            "game_id": game_id,
            "field": sort_field,
            "wallet_address": wallet,
        }

    user_value = user.get(sort_field, 0)
    region = user.get("region")
    tier = user.get("tier", "starter")

    global_above = await db.users.count_documents({sort_field: {"$gt": user_value}})
    global_rank = global_above + 1
    total_users = await db.users.count_documents({sort_field: {"$gt": 0}})

    if region:
        regional_total = await db.users.count_documents(
            {"region": region, sort_field: {"$gt": 0}}
        )
        regional_above = await db.users.count_documents(
            {"region": region, sort_field: {"$gt": user_value}}
        )
        regional_rank = regional_above + 1
        regional_is_approx = False
    else:
        regional_rank = max(1, int(global_rank * 0.25) or 1)
        regional_total = max(1, int(total_users * 0.25) or 1)
        regional_is_approx = True

    local_rank = max(1, int(global_rank * 0.10) or 1)
    local_total = max(1, int(total_users * 0.10) or 1)

    result: Dict[str, Any] = {
        "found": True,
        "game_id": game_id,
        "field": sort_field,
        "wallet_address": wallet,
        "wallet": mask_wallet(wallet),
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
        result["username"] = user.get("username") or generate_username(wallet)

    return result