"""
Play (Games) Router
====================
Routes for trivia, game results, and future game types.
Reward calculations are delegated to reward_service (stubs for now).
"""

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

# Import reward service stubs — these raise NotImplementedError until implemented.
# Routes currently use inline logic from server.py; these imports prepare for migration.
from services.reward_service import (  # noqa: F401
    calculate_play_reward,
    get_tier_multipliers,
    enforce_daily_caps,
)

router = APIRouter(prefix="/games", tags=["Play"])


class TriviaAnswerRequest(BaseModel):
    question_id: str
    answer: str
    time_taken: float


class GameResultRequest(BaseModel):
    game_type: str  # zbrickles | ztrivia | ztetris | zslots
    score: int
    level: int = 1
    blocks_destroyed: int = 0


MAX_GAME_SCORES = {
    "zbrickles": 5000,
    "ztrivia": 50,
    "ztetris": 10000,
    "zslots": 8000,
}

DAILY_ZWAP_CAPS = {
    "starter": 500.0,
    "plus": 1500.0,
}

TIERS = {
    "starter": {
        "name": "Starter",
        "zwap_multiplier": 1.0,
        "daily_zpts_cap": 75,
        "games": ["zbrickles", "ztrivia"],
    },
    "plus": {
        "name": "Plus",
        "zwap_multiplier": 1.5,
        "daily_zpts_cap": 150,
        "games": ["zbrickles", "ztrivia", "ztetris", "zslots"],
    },
}


def get_user_tier_config(tier: str) -> dict:
    return TIERS.get(tier, TIERS["starter"])


def calculate_game_rewards(
    game_type: str,
    score: int,
    level: int,
    blocks: int = 0,
    multiplier: float = 1.0,
) -> dict:
    """Calculate ZWAP and Z Points rewards for games with progressive difficulty."""
    difficulty_multiplier = 1 + (level - 1) * 0.1

    if game_type == "zbrickles":
        base_zwap = min(blocks * 0.5 + (score / 100), 50)
        base_zpts = min(blocks + (score // 50), 10)

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


async def check_and_reset_daily_zpts(db, user: dict) -> dict:
    """Check if daily Z Points should be reset."""
    now = datetime.now(timezone.utc)
    last_reset = user.get("last_zpts_reset")

    if last_reset:
        last_reset_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))
        if last_reset_dt.date() < now.date():
            await db.users.update_one(
                {"wallet_address": user["wallet_address"]},
                {"$set": {"daily_zpts_earned": 0, "last_zpts_reset": now.isoformat()}},
            )
            user["daily_zpts_earned"] = 0
    else:
        await db.users.update_one(
            {"wallet_address": user["wallet_address"]},
            {"$set": {"daily_zpts_earned": 0, "last_zpts_reset": now.isoformat()}},
        )
        user["daily_zpts_earned"] = 0

    return user


async def check_and_reset_daily_zwap(db, user: dict) -> dict:
    """Reset daily ZWAP earned at midnight UTC."""
    now = datetime.now(timezone.utc)
    last_reset = user.get("last_zwap_reset")

    if last_reset:
        last_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))
        if last_dt.date() < now.date():
            await db.users.update_one(
                {"wallet_address": user["wallet_address"]},
                {"$set": {"daily_zwap_earned": 0.0, "last_zwap_reset": now.isoformat()}},
            )
            user["daily_zwap_earned"] = 0.0
    else:
        await db.users.update_one(
            {"wallet_address": user["wallet_address"]},
            {"$set": {"daily_zwap_earned": 0.0, "last_zwap_reset": now.isoformat()}},
        )
        user["daily_zwap_earned"] = 0.0

    return user


@router.get("/trivia/questions")
async def get_trivia_questions(count: int = 5, difficulty: str = "medium"):
    """
    Returns trivia questions.
    Currently: stub — frontend or future learn routes can source these.
    """
    return {"questions": [], "count": count, "difficulty": difficulty}


@router.post("/trivia/answer")
async def check_trivia_answer(payload: TriviaAnswerRequest):
    """
    Validates a trivia answer.
    Currently: stub — future server-side validation.
    """
    return {"correct": False, "explanation": None}


@router.post("/result/{wallet_address}")
async def submit_game_result(
    wallet_address: str,
    game_data: GameResultRequest,
    request: Request,
):
    """Submit game result and claim rewards (ZWAP + Z Points)."""
    db = request.app.state.db
    wallet = wallet_address.lower()

    max_score = MAX_GAME_SCORES.get(game_data.game_type, 5000)
    if game_data.score > max_score:
        logging.warning(
            f"Anti-cheat flag: {wallet} submitted {game_data.game_type} score {game_data.score} (max {max_score})"
        )
        raise HTTPException(status_code=400, detail="Invalid score")

    if game_data.score < 0 or game_data.level < 1:
        raise HTTPException(status_code=400, detail="Invalid game data")

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tier = user.get("tier", "starter")
    tier_config = get_user_tier_config(tier)

    if game_data.game_type not in tier_config["games"]:
        raise HTTPException(
            status_code=403,
            detail=f"Game not available in {tier_config['name']} tier",
        )

    user = await check_and_reset_daily_zpts(db, user)
    daily_zpts = user.get("daily_zpts_earned", 0)
    zpts_cap = tier_config["daily_zpts_cap"]

    user = await check_and_reset_daily_zwap(db, user)
    daily_zwap = user.get("daily_zwap_earned", 0.0)
    zwap_cap = DAILY_ZWAP_CAPS.get(tier, 500.0)

    rewards = calculate_game_rewards(
        game_data.game_type,
        game_data.score,
        game_data.level,
        game_data.blocks_destroyed,
        tier_config["zwap_multiplier"],
    )

    zpts_to_add = max(0, min(rewards["zpts"], zpts_cap - daily_zpts))
    zwap_to_add = max(0.0, min(rewards["zwap"], zwap_cap - daily_zwap))

    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {
                "zwap_balance": zwap_to_add,
                "zpts_balance": zpts_to_add,
                "games_played": 1,
                "total_earned": zwap_to_add,
                "daily_zpts_earned": zpts_to_add,
                "daily_zwap_earned": zwap_to_add,
            }
        },
    )

    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})

    return {
        "game": game_data.game_type,
        "score": game_data.score,
        "level": game_data.level,
        "zwap_earned": round(zwap_to_add, 2),
        "zpts_earned": zpts_to_add,
        "zpts_capped": zpts_to_add < rewards["zpts"],
        "zwap_capped": zwap_to_add < rewards["zwap"],
        "daily_zpts_remaining": zpts_cap - updated_user.get("daily_zpts_earned", 0),
        "daily_zwap_remaining": round(
            zwap_cap - updated_user.get("daily_zwap_earned", 0),
            2,
        ),
        "new_zwap_balance": round(updated_user.get("zwap_balance", 0), 2),
        "new_zpts_balance": updated_user.get("zpts_balance", 0),
        "message": f"Earned {zwap_to_add:.2f} ZWAP + {zpts_to_add} zPts!",
    }