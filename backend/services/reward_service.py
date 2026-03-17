"""
ZWAP! Reward Service
====================
Central reward calculation logic for MOVE, PLAY, conversions, tier multipliers,
daily cap helpers, daily reset helpers, and anti-cheat/rate-limit helpers.
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
        "daily_zpts_cap": 75,
        "daily_zwap_cap": 500.0,
        "monthly_zwap_cap": 146250,
        "games": ["zbrickles", "ztrivia"],
        "features": ["zWALK", "ads"],
    },
    "plus": {
        "name": "Plus",
        "price": 9.99,
        "move": 1.5,
        "play": 1.5,
        "zwap_multiplier": 1.5,
        "daily_zpts_cap": 150,
        "daily_zwap_cap": 1500.0,
        "monthly_zwap_cap": 219375,
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
    return TIERS.get(tier, TIERS["starter"])


def get_user_tier_config(tier: str) -> Dict:
    return _get_tier_config(tier)


def get_daily_reward(streak: int) -> int:
    if streak > 7:
        streak = 7
    return DAILY_REWARD_TABLE.get(streak, 10)


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
                    "last_zpts_reset": now.isoformat(),
                }
            },
        )
        user["last_zpts_reset"] = now.isoformat()

    return user


async def check_and_reset_daily_zwap(db, user: dict) -> dict:
    """
    Reset daily ZWAP earned tracking at UTC day boundary.
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
    Compute rewards for a completed game session.
    Returns: { "zwap": float, "zpts": int }
    """
    if score < 0 or level < 1:
        raise ValueError("Invalid game data")

    max_score = MAX_GAME_SCORES.get(game_type, 5000)
    if score > max_score:
        raise ValueError("Invalid score")

    tier_config = _get_tier_config(tier)
    multiplier = tier_config["play"]
    difficulty_multiplier = 1 + (level - 1) * 0.1

    if game_type == "zbrickles":
        base_zwap = min(blocks_destroyed * 0.5 + (score / 100), 50)
        base_zpts = min(blocks_destroyed + (score // 50), 10)
    elif game_type == "ztrivia":
        base_zwap = min(score * 0.5, 30)
        base_zpts = min(score * 2, 8)
    elif game_type == "ztetris":
        base_zwap = min((score / 100) + (level * 2), 75)
        base_zpts = min((score // 100) + level, 12)
    elif game_type == "zslots":
        base_zwap = min(score * 0.3, 40)
        base_zpts = min(score // 10, 8)
    else:
        base_zwap = 0
        base_zpts = 0

    return {
        "zwap": round(base_zwap * difficulty_multiplier * multiplier, 2),
        "zpts": int(base_zpts * difficulty_multiplier),
    }


async def calculate_move_reward(
    steps: int,
    tier: str,
    daily_steps_so_far: int = 0,
) -> Dict:
    """
    Compute ZWAP earned from a step-tracking session.
    Returns: { "zwap": float }
    """
    if steps < MIN_STEPS_PER_CLAIM:
        raise ValueError(f"Minimum {MIN_STEPS_PER_CLAIM} steps required")
    if steps > MAX_STEPS_PER_CLAIM:
        raise ValueError(f"Step count exceeds maximum ({MAX_STEPS_PER_CLAIM})")

    tier_config = _get_tier_config(tier)
    multiplier = tier_config["move"]

    if steps < 1000:
        base = steps * 0.01
    elif steps < 5000:
        base = 10 + (steps - 1000) * 0.02
    elif steps < 10000:
        base = 90 + (steps - 5000) * 0.03
    else:
        base = 240 + (steps - 10000) * 0.05

    return {
        "zwap": round(base * multiplier, 2),
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
    Return all reward multipliers for a given tier.
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
    cap_type: str = "zwap",
) -> Dict:
    """
    Check whether a user has hit their daily earning limit.
    Returns: { "capped": bool, "remaining": float }
    """
    tier_config = _get_tier_config(tier)

    if cap_type == "zpts":
        cap = float(tier_config["daily_zpts_cap"])
    else:
        cap = float(tier_config["daily_zwap_cap"])

    remaining = max(0.0, cap - float(earned_today or 0))

    return {
        "capped": remaining <= 0,
        "remaining": round(remaining, 2),
    }