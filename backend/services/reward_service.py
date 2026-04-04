"""
ZWAP! Reward Service
====================
Central reward logic for MOVE, PLAY, conversions, tier multipliers,
daily cap helpers, daily reset helpers, and anti-cheat/rate-limit helpers.

Updated economy:
- MOVE earns zPts
- PLAY earns zPts
- zPts convert to ZWAP at 1000:1
- direct gameplay/movement ZWAP emissions removed
"""

from collections import defaultdict
from datetime import datetime, timezone
import time as _time
from typing import Dict


TIERS = {
    "starter": {
        "name": "Starter",
        "price": 0,
        "move": 1.0,
        "play": 1.0,
        "zwap_multiplier": 1.0,
        "daily_zpts_cap": 300,
        "daily_zwap_cap": 3.0,
        "monthly_zwap_cap": 90.0,
        "games": ["zbrickles", "ztrivia"],
        "features": ["zWALK", "ads"],
    },
    "plus": {
        "name": "Plus",
        "price": 9.99,
        "move": 1.5,
        "play": 1.5,
        "zwap_multiplier": 1.5,
        "daily_zpts_cap": 600,
        "daily_zwap_cap": 6.0,
        "monthly_zwap_cap": 180.0,
        "games": ["zbrickles", "ztrivia", "ztetris", "zslots"],
        "features": ["zWALK", "no_ads", "zDance", "zWorkout"],
    },
}

DAILY_REWARD_TABLE = {
    1: 10,
    2: 15,
    3: 20,
    4: 25,
    5: 30,
    6: 35,
    7: 50,
}

ZPTS_TO_ZWAP_RATE = 1000

STEP_CLAIM_COOLDOWN = 300
GAME_RESULT_COOLDOWN = 20
MIN_STEPS_PER_CLAIM = 10
MAX_STEPS_PER_CLAIM = 50000

MAX_GAME_SCORES = {
    "zbrickles": 5000,
    "ztrivia": 50,
    "ztetris": 10000,
    "zslots": 8000,
}

_rate_limits = defaultdict(dict)


def _get_tier_config(tier: str) -> Dict:
    return TIERS.get(str(tier or "").lower(), TIERS["starter"])


def get_user_tier_config(tier: str) -> Dict:
    return _get_tier_config(tier)


def get_daily_reward(streak: int) -> int:
    safe_streak = max(1, min(int(streak or 1), 7))
    return DAILY_REWARD_TABLE.get(safe_streak, 10)


def check_rate_limit(wallet: str, action: str, cooldown_seconds: int) -> bool:
    """
    Returns True if rate-limited, False if allowed.
    """
    now = _time.time()
    last = _rate_limits[wallet].get(action, 0)
    if now - last < cooldown_seconds:
        return True
    _rate_limits[wallet][action] = now
    return False


async def check_and_reset_daily_zpts(db, user: dict) -> dict:
    """
    Reset daily zPts tracking at UTC day boundary.
    """
    now = datetime.now(timezone.utc)
    last_reset = user.get("last_zpts_reset")

    if last_reset:
        last_reset_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))
        if last_reset_dt.date() < now.date():
            await db.users.update_one(
                {"id": user["id"]},
                {
                    "$set": {
                        "daily_zpts_earned": 0,
                        "last_zpts_reset": now.isoformat(),
                    }
                },
            )
            user["daily_zpts_earned"] = 0
            user["last_zpts_reset"] = now.isoformat()
    else:
        await db.users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "daily_zpts_earned": 0,
                    "last_zpts_reset": now.isoformat(),
                }
            },
        )
        user["daily_zpts_earned"] = 0
        user["last_zpts_reset"] = now.isoformat()

    return user


async def check_and_reset_daily_zwap(db, user: dict) -> dict:
    """
    Reset daily converted ZWAP tracking at UTC day boundary.
    """
    now = datetime.now(timezone.utc)
    last_reset = user.get("last_zwap_reset")

    if last_reset:
        last_reset_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))
        if last_reset_dt.date() < now.date():
            await db.users.update_one(
                {"id": user["id"]},
                {
                    "$set": {
                        "daily_zwap_earned": 0.0,
                        "last_zwap_reset": now.isoformat(),
                    }
                },
            )
            user["daily_zwap_earned"] = 0.0
            user["last_zwap_reset"] = now.isoformat()
    else:
        await db.users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "daily_zwap_earned": 0.0,
                    "last_zwap_reset": now.isoformat(),
                }
            },
        )
        user["daily_zwap_earned"] = 0.0
        user["last_zwap_reset"] = now.isoformat()

    return user


async def calculate_play_reward(
    game_type: str,
    score: int,
    level: int,
    tier: str,
    blocks_destroyed: int = 0,
) -> Dict:
    """
    Compute zPts rewards for a completed game session.
    Returns: { "zpts": int }
    """
    if score < 0 or level < 1:
        raise ValueError("Invalid game data")

    max_score = MAX_GAME_SCORES.get(game_type, 5000)
    if score > max_score:
        raise ValueError("Invalid score")

    tier_config = _get_tier_config(tier)
    multiplier = float(tier_config["play"])
    difficulty_multiplier = 1 + (level - 1) * 0.1

    if game_type == "zbrickles":
        base_zpts = min(blocks_destroyed + (score // 40), 40)
    elif game_type == "ztrivia":
        base_zpts = min((score * 2) + level, 30)
    elif game_type == "ztetris":
        base_zpts = min((score // 80) + (level * 2), 50)
    elif game_type == "zslots":
        base_zpts = min((score // 12) + level, 35)
    else:
        base_zpts = 0

    total_zpts = int(round(base_zpts * difficulty_multiplier * multiplier))

    return {
        "zpts": max(total_zpts, 0),
    }


async def calculate_move_reward(
    steps: int,
    tier: str,
    daily_steps_so_far: int = 0,
) -> Dict:
    """
    Compute zPts earned from a step-tracking session.
    Returns: { "zpts": int }
    """
    if steps < MIN_STEPS_PER_CLAIM:
        raise ValueError(f"Minimum {MIN_STEPS_PER_CLAIM} steps required")
    if steps > MAX_STEPS_PER_CLAIM:
        raise ValueError(f"Step count exceeds maximum ({MAX_STEPS_PER_CLAIM})")

    tier_config = _get_tier_config(tier)
    multiplier = float(tier_config["move"])

    if steps < 1000:
        base = steps * 0.02
    elif steps < 5000:
        base = 20 + (steps - 1000) * 0.03
    elif steps < 10000:
        base = 140 + (steps - 5000) * 0.04
    else:
        base = 340 + (steps - 10000) * 0.05

    total_zpts = int(round(base * multiplier))

    return {
        "zpts": max(total_zpts, 0),
    }


async def convert_zpts_to_zwap(
    zpts_amount: int,
    tier: str,
) -> Dict:
    """
    Calculate ZWAP output for a zPts conversion.
    Returns: { "zwap": float, "rate": float }
    """
    if zpts_amount < ZPTS_TO_ZWAP_RATE:
        raise ValueError(f"Minimum {ZPTS_TO_ZWAP_RATE} zPts required")

    zwap = zpts_amount / ZPTS_TO_ZWAP_RATE

    return {
        "zwap": round(zwap, 4),
        "rate": float(ZPTS_TO_ZWAP_RATE),
    }


async def get_tier_multipliers(tier: str) -> Dict:
    """
    Return all reward multipliers and caps for a given tier.
    """
    tier_config = _get_tier_config(tier)
    return {
        "move": tier_config["move"],
        "play": tier_config["play"],
        "zwap_multiplier": tier_config["zwap_multiplier"],
        "daily_zpts_cap": tier_config["daily_zpts_cap"],
        "daily_zwap_cap": tier_config["daily_zwap_cap"],
        "monthly_zwap_cap": tier_config["monthly_zwap_cap"],
    }


async def enforce_daily_caps(
    wallet_address: str,
    tier: str,
    earned_today: float,
    cap_type: str = "zpts",
) -> Dict:
    """
    Check whether a user has hit their daily earning limit.
    Returns: { "capped": bool, "remaining": float }
    """
    tier_config = _get_tier_config(tier)

    if cap_type == "zwap":
        cap = float(tier_config["daily_zwap_cap"])
    else:
        cap = float(tier_config["daily_zpts_cap"])

    remaining = max(0.0, cap - float(earned_today or 0))

    return {
        "capped": remaining <= 0,
        "remaining": round(remaining, 2),
    }