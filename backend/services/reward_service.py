"""
ZWAP! Reward Service
====================
Central reward calculation logic for MOVE, PLAY, conversions, tier multipliers,
and daily cap helpers.
"""

from typing import Dict


TIERS = {
    "starter": {
        "move": 1.0,
        "play": 1.0,
        "daily_zpts_cap": 75,
        "daily_zwap_cap": 500.0,
        "games": ["zbrickles", "ztrivia"],
    },
    "plus": {
        "move": 1.5,
        "play": 1.5,
        "daily_zpts_cap": 150,
        "daily_zwap_cap": 1500.0,
        "games": ["zbrickles", "ztrivia", "ztetris", "zslots"],
    },
}

ZPTS_TO_ZWAP_RATE = 1000

MAX_GAME_SCORES = {
    "zbrickles": 5000,
    "ztrivia": 50,
    "ztetris": 10000,
    "zslots": 8000,
}


def _get_tier_config(tier: str) -> Dict:
    return TIERS.get(tier, TIERS["starter"])


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
    if steps < 10:
        raise ValueError("Minimum 10 steps required")
    if steps > 50000:
        raise ValueError("Step count exceeds maximum (50000)")

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
    Returns: { "move": float, "play": float, "daily_zpts_cap": int, "daily_zwap_cap": float }
    """
    tier_config = _get_tier_config(tier)
    return {
        "move": tier_config["move"],
        "play": tier_config["play"],
        "daily_zpts_cap": tier_config["daily_zpts_cap"],
        "daily_zwap_cap": tier_config["daily_zwap_cap"],
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