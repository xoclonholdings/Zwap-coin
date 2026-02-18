"""
ZWAP! Reward Service Stubs
===========================
Service-layer function signatures for reward calculations.
DO NOT implement reward math here — these are contract stubs only.
Routes should call these; implementations come later.
"""

from typing import Dict


async def calculate_play_reward(
    game_type: str,
    score: int,
    level: int,
    tier: str,
) -> Dict:
    """
    Compute rewards for a completed game session.

    Inputs:
        game_type: "zbrickles" | "ztrivia" | "ztetris" | "zslots"
        score:     Final score from the game
        level:     Game difficulty level (1+)
        tier:      "starter" | "plus"

    Returns:
        { "zwap": float, "zpts": int }
    """
    raise NotImplementedError("calculate_play_reward not yet implemented")


async def calculate_move_reward(
    steps: int,
    tier: str,
    daily_steps_so_far: int,
) -> Dict:
    """
    Compute ZWAP earned from a step-tracking session.

    Inputs:
        steps:              Steps submitted in this session
        tier:               "starter" | "plus"
        daily_steps_so_far: Steps already submitted today (for cap enforcement)

    Returns:
        { "zwap": float }
    """
    raise NotImplementedError("calculate_move_reward not yet implemented")


async def convert_zpts_to_zwap(
    zpts_amount: int,
    tier: str,
) -> Dict:
    """
    Calculate ZWAP output for a zPts conversion.

    Inputs:
        zpts_amount: Number of zPts to convert
        tier:        "starter" | "plus"

    Returns:
        { "zwap": float, "rate": float }
    """
    raise NotImplementedError("convert_zpts_to_zwap not yet implemented")


async def get_tier_multipliers(tier: str) -> Dict:
    """
    Return all reward multipliers for a given tier.

    Inputs:
        tier: "starter" | "plus"

    Returns:
        { "move": float, "play": float, "cap": int }
    """
    raise NotImplementedError("get_tier_multipliers not yet implemented")


async def enforce_daily_caps(
    wallet_address: str,
    tier: str,
    earned_today: float,
) -> Dict:
    """
    Check whether a user has hit their daily earning limit.

    Inputs:
        wallet_address: User's wallet
        tier:           "starter" | "plus"
        earned_today:   ZWAP or zPts already earned today

    Returns:
        { "capped": bool, "remaining": float }
    """
    raise NotImplementedError("enforce_daily_caps not yet implemented")
