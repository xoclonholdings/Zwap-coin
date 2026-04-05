"""
Leaderboard Reward Service
==========================

Handles FINAL leaderboard reward payouts.

Key Rules:
- Rewards are paid ONLY at end of leaderboard window
- No real-time rank payouts
- One payout per user per window per scope
- Uses existing leaderboard_service data
- Awards zPts ONLY
"""

from datetime import datetime, timezone
from typing import Dict, List, Any

from services.reward_service import enforce_daily_caps
from services.badge_service import evaluate_badges, persist_badge_updates
from services.leaderboard_service import get_top_leaderboard


# -------------------------
# Reward Tables (Spec-aligned)
# -------------------------

LOCAL_REWARDS = {1: 15, 2: 10, 3: 10}
REGIONAL_REWARDS = {1: 25, 2: 20, 3: 20}
GLOBAL_REWARDS = {1: 50, 2: 40, 3: 40}


# -------------------------
# Window Helper
# -------------------------

def generate_window_id(scope: str) -> str:
    """
    Generates a unique window ID (daily).
    Example: global_2026-04-05
    """
    today = datetime.now(timezone.utc).date().isoformat()
    return f"{scope}_{today}"


# -------------------------
# Core Processor
# -------------------------

async def process_leaderboard_rewards(
    db,
    category: str = "zpts",
) -> Dict[str, Any]:
    """
    Processes leaderboard rewards for:
    - global
    - regional
    - local

    Returns summary of payouts.
    """

    results = {
        "global": [],
        "regional": [],
        "local": [],
    }

    # -------------------------
    # GLOBAL
    # -------------------------

    global_top = await get_top_leaderboard(db, category=category, limit=3)
    global_window = generate_window_id("global")

    for entry in global_top:
        reward = GLOBAL_REWARDS.get(entry["rank"])
        if reward:
            payout = await _process_single_reward(
                db=db,
                wallet=entry["wallet_address"],
                reward=reward,
                scope="global",
                window_id=global_window,
            )
            if payout:
                results["global"].append(payout)

    # -------------------------
    # REGIONAL
    # -------------------------

    regions = await db.users.distinct("region")

    for region in regions:
        regional_top = await db.users.find(
            {"region": region},
            {"wallet_address": 1, "zpts_balance": 1},
        ).sort("zpts_balance", -1).limit(3).to_list(3)

        regional_window = generate_window_id(f"regional_{region}")

        for i, user in enumerate(regional_top):
            rank = i + 1
            reward = REGIONAL_REWARDS.get(rank)

            if reward:
                payout = await _process_single_reward(
                    db=db,
                    wallet=user["wallet_address"],
                    reward=reward,
                    scope=f"regional_{region}",
                    window_id=regional_window,
                )
                if payout:
                    results["regional"].append(payout)

    # -------------------------
    # LOCAL (approximate clusters)
    # -------------------------

    # Local is intentionally lightweight (no geo precision yet)
    users = await db.users.find({}, {"wallet_address": 1, "zpts_balance": 1}).to_list(1000)
    users_sorted = sorted(users, key=lambda x: x.get("zpts_balance", 0), reverse=True)

    local_top = users_sorted[:3]
    local_window = generate_window_id("local")

    for i, user in enumerate(local_top):
        rank = i + 1
        reward = LOCAL_REWARDS.get(rank)

        if reward:
            payout = await _process_single_reward(
                db=db,
                wallet=user["wallet_address"],
                reward=reward,
                scope="local",
                window_id=local_window,
            )
            if payout:
                results["local"].append(payout)

    return {
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "results": results,
    }


# -------------------------
# Single Reward Handler
# -------------------------

async def _process_single_reward(
    db,
    wallet: str,
    reward: int,
    scope: str,
    window_id: str,
) -> Dict[str, Any] | None:
    """
    Handles:
    - duplicate prevention
    - cap enforcement
    - badge updates
    """

    wallet = wallet.lower()

    # Prevent duplicate payout
    existing = await db.leaderboard_rewards.find_one({
        "wallet_address": wallet,
        "window_id": window_id,
    })

    if existing:
        return None

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        return None

    # Cap enforcement
    cap_check = await enforce_daily_caps(
        wallet_address=wallet,
        tier=user.get("tier", "starter"),
        earned_today=user.get("daily_zpts_earned", 0),
        cap_type="zpts",
    )

    if cap_check["capped"]:
        return None

    zpts_to_add = min(reward, cap_check["remaining"])

    # Apply reward
    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {
                "zpts_balance": zpts_to_add,
                "daily_zpts_earned": zpts_to_add,
                "badge_zpts_earned": zpts_to_add,
            }
        },
    )

    # Track payout
    await db.leaderboard_rewards.insert_one({
        "wallet_address": wallet,
        "scope": scope,
        "window_id": window_id,
        "reward": zpts_to_add,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    updated_user = await db.users.find_one({"wallet_address": wallet})

    # Badge evaluation
    badge_result = evaluate_badges(updated_user)
    await persist_badge_updates(db, updated_user["id"], badge_result["updates"])

    return {
        "wallet": wallet,
        "scope": scope,
        "reward": zpts_to_add,
    }