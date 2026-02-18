"""
Move-to-Earn Router
====================
Routes for step submission, session tracking, and anti-cheat.
Reward calculations are delegated to reward_service (stubs for now).
"""

from fastapi import APIRouter

# Import reward service stubs — these raise NotImplementedError until implemented.
# Routes currently use inline logic from server.py; these imports prepare for migration.
from services.reward_service import (  # noqa: F401
    calculate_move_reward,
    get_tier_multipliers,
    enforce_daily_caps,
)

router = APIRouter(prefix="/move", tags=["Move"])


@router.get("/session/{wallet_address}")
async def get_move_session(wallet_address: str):
    """
    Get the active step-tracking session for a user.
    Currently: stub.
    Future: return active session with step count, start time, anti-cheat flags.
    """
    return {"active": False, "steps": 0, "wallet": wallet_address}


@router.post("/anti-cheat")
async def submit_anti_cheat_flags(wallet_address: str):
    """
    Submit client-side anti-cheat telemetry.
    Currently: stub.
    Future: flag suspicious patterns (GPS speed, step variance, device motion).
    """
    return {"received": True, "flagged": False, "wallet": wallet_address}
