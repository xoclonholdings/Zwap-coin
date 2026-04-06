"""
Play (Games) Router
====================
Routes for trivia, game results, and future game types.
Reward calculations are delegated to reward_service.

Spec-aligned behavior:
- PLAY earns zPts only
- Leaderboard score is competitive and not hard-capped here
- Rewards are normalized, diminished, and capped economically
- Movement dependency reduces PLAY farming
- Achievement bonuses support standout performance
- Public API uses canonical game IDs only
- Legacy IDs resolve internally only
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from services.reward_service import (
    calculate_play_reward,
    get_tier_multipliers,
    enforce_daily_caps,
)
from services.badge_service import evaluate_badges, persist_badge_updates
from services.daily_task_service import maybe_process_full_daily_loop

router = APIRouter(prefix="/games", tags=["Play"])


class TriviaAnswerRequest(BaseModel):
    question_id: str
    answer: str
    time_taken: float


class GameResultRequest(BaseModel):
    # Canonical public IDs only:
    # brainz | breakerz | pulze | stackz | triplez | werdz
    game_type: str
    score: int
    level: int = 1
    blocks_destroyed: int = 0
    session_duration_seconds: int = 0
    completed: bool = True


TIERS = {
    "starter": {
        "name": "Zwapper",
        "games": ["brainz", "breakerz", "pulze", "stackz"],
    },
    "plus": {
        "name": "Zitizen",
        "games": ["brainz", "breakerz", "pulze", "stackz", "triplez", "werdz"],
    },
}

LEGACY_GAME_ID_MAP = {
    "ztrivia": "brainz",
    "zbrickles": "breakerz",
    "zslots": "pulze",
    "ztetris": "stackz",
}


def normalize_tier_key(tier: str) -> str:
    safe = str(tier or "").lower()
    if safe in ("plus", "zitizen"):
        return "plus"
    return "starter"


def normalize_game_id(game_type: str) -> str:
    safe = str(game_type or "").lower()
    return LEGACY_GAME_ID_MAP.get(safe, safe)


def get_user_tier_config(tier: str) -> dict:
    return TIERS.get(normalize_tier_key(tier), TIERS["starter"])


async def check_and_reset_daily_zpts(db, user: dict) -> dict:
    """Check if daily zPts should be reset."""
    now = datetime.now(timezone.utc)
    last_reset = user.get("last_zpts_reset")

    if last_reset:
        last_reset_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))
        if last_reset_dt.date() < now.date():
            await db.users.update_one(
                {"wallet_address": user["wallet_address"]},
                {
                    "$set": {
                        "daily_zpts_earned": 0,
                        "last_zpts_reset": now.isoformat(),
                        "games_played_today": 0,
                    }
                },
            )
            user["daily_zpts_earned"] = 0
            user["games_played_today"] = 0
            user["last_zpts_reset"] = now.isoformat()
    else:
        await db.users.update_one(
            {"wallet_address": user["wallet_address"]},
            {
                "$set": {
                    "daily_zpts_earned": 0,
                    "last_zpts_reset": now.isoformat(),
                    "games_played_today": 0,
                }
            },
        )
        user["daily_zpts_earned"] = 0
        user["games_played_today"] = 0
        user["last_zpts_reset"] = now.isoformat()

    return user


def get_session_diminishing_multiplier(games_played_today: int) -> float:
    next_session_number = int(games_played_today or 0) + 1

    if next_session_number <= 3:
        return 1.0
    if next_session_number <= 6:
        return 0.5
    return 0.1


def get_move_dependency_multiplier(today_steps: int) -> float:
    safe_steps = int(today_steps or 0)

    if safe_steps < 1000:
        return 0.2
    if safe_steps < 2000:
        return 0.5
    return 1.0


def get_personal_best_field(game_type: str) -> str:
    canonical = normalize_game_id(game_type)
    mapping = {
        "brainz": "personal_best_ztrivia",
        "breakerz": "personal_best_zbrickles",
        "pulze": "personal_best_zslots",
        "stackz": "personal_best_ztetris",
        "triplez": "personal_best_triplez",
        "werdz": "personal_best_werdz",
    }
    return mapping[canonical]


def get_daily_best_field(game_type: str) -> str:
    canonical = normalize_game_id(game_type)
    mapping = {
        "brainz": "daily_best_ztrivia",
        "breakerz": "daily_best_zbrickles",
        "pulze": "daily_best_zslots",
        "stackz": "daily_best_ztetris",
        "triplez": "daily_best_triplez",
        "werdz": "daily_best_werdz",
    }
    return mapping[canonical]


def get_daily_best_count_field(game_type: str) -> str:
    canonical = normalize_game_id(game_type)
    mapping = {
        "brainz": "daily_best_count_ztrivia",
        "breakerz": "daily_best_count_zbrickles",
        "pulze": "daily_best_count_zslots",
        "stackz": "daily_best_count_ztetris",
        "triplez": "daily_best_count_triplez",
        "werdz": "daily_best_count_werdz",
    }
    return mapping[canonical]


def get_personal_best_rewarded_day_field(game_type: str) -> str:
    canonical = normalize_game_id(game_type)
    mapping = {
        "brainz": "personal_best_rewarded_day_ztrivia",
        "breakerz": "personal_best_rewarded_day_zbrickles",
        "pulze": "personal_best_rewarded_day_zslots",
        "stackz": "personal_best_rewarded_day_ztetris",
        "triplez": "personal_best_rewarded_day_triplez",
        "werdz": "personal_best_rewarded_day_werdz",
    }
    return mapping[canonical]


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
    """Submit game result and claim zPts rewards."""
    db = request.app.state.db
    wallet = wallet_address.lower()
    canonical_game_type = normalize_game_id(game_data.game_type)

    if game_data.score < 0 or game_data.level < 1:
        raise HTTPException(status_code=400, detail="Invalid game data")

    if game_data.session_duration_seconds < 0:
        raise HTTPException(status_code=400, detail="Invalid session duration")

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tier = normalize_tier_key(user.get("tier", "starter"))
    tier_ui_config = get_user_tier_config(tier)

    if canonical_game_type not in tier_ui_config["games"]:
        raise HTTPException(
            status_code=403,
            detail=f"Game not available in {tier_ui_config['name']} tier",
        )

    user = await check_and_reset_daily_zpts(db, user)
    daily_zpts = int(user.get("daily_zpts_earned", 0) or 0)
    games_played_today = int(user.get("games_played_today", 0) or 0)
    today_steps = int(user.get("daily_steps", 0) or 0)

    tier_reward_config = await get_tier_multipliers(tier)
    zpts_cap = int(tier_reward_config["daily_zpts_cap"])

    cap_check = await enforce_daily_caps(
        wallet_address=wallet,
        tier=tier,
        earned_today=daily_zpts,
        cap_type="zpts",
    )

    if cap_check["capped"]:
        raise HTTPException(
            status_code=429,
            detail="Daily zPts earning limit reached. Come back tomorrow!",
        )

    try:
        rewards = await calculate_play_reward(
            game_type=canonical_game_type,
            score=game_data.score,
            level=game_data.level,
            tier=tier,
            blocks_destroyed=game_data.blocks_destroyed,
        )
    except ValueError as e:
        logging.warning(
            f"Game reward validation failed for {wallet} / {canonical_game_type}: {str(e)}"
        )
        raise HTTPException(status_code=400, detail=str(e))

    base_zpts = int(rewards["zpts"])

    session_multiplier = get_session_diminishing_multiplier(games_played_today)
    move_multiplier = get_move_dependency_multiplier(today_steps)

    adjusted_base_zpts = int(round(base_zpts * session_multiplier * move_multiplier))
    adjusted_base_zpts = max(adjusted_base_zpts, 0)

    today_key = datetime.now(timezone.utc).date().isoformat()

    personal_best_field = get_personal_best_field(canonical_game_type)
    daily_best_field = get_daily_best_field(canonical_game_type)
    daily_best_count_field = get_daily_best_count_field(canonical_game_type)
    personal_best_rewarded_day_field = get_personal_best_rewarded_day_field(
        canonical_game_type
    )

    previous_personal_best = int(user.get(personal_best_field, 0) or 0)
    previous_daily_best = int(user.get(daily_best_field, 0) or 0)
    previous_daily_best_count = int(user.get(daily_best_count_field, 0) or 0)
    previous_personal_best_rewarded_day = user.get(personal_best_rewarded_day_field)

    personal_best_achieved = game_data.score > previous_personal_best
    personal_best_bonus = 0
    if personal_best_achieved and previous_personal_best_rewarded_day != today_key:
        personal_best_bonus = 10

    daily_best_achieved = game_data.score > previous_daily_best
    daily_best_bonus = 0
    if daily_best_achieved and previous_daily_best_count < 3:
        daily_best_bonus = 5

    total_requested_zpts = adjusted_base_zpts + personal_best_bonus + daily_best_bonus
    zpts_to_add = max(0, min(total_requested_zpts, int(cap_check["remaining"])))

    achievement_bonus_requested = personal_best_bonus + daily_best_bonus
    achievement_bonus_awarded = max(0, zpts_to_add - adjusted_base_zpts)
    if achievement_bonus_awarded > achievement_bonus_requested:
        achievement_bonus_awarded = achievement_bonus_requested

    set_updates = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if personal_best_achieved:
        set_updates[personal_best_field] = game_data.score
        if personal_best_bonus > 0:
            set_updates[personal_best_rewarded_day_field] = today_key

    if daily_best_achieved:
        set_updates[daily_best_field] = game_data.score
        if daily_best_bonus > 0:
            set_updates[daily_best_count_field] = previous_daily_best_count + 1

    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {
                "zpts_balance": zpts_to_add,
                "games_played": 1,
                "games_played_today": 1,
                "daily_zpts_earned": zpts_to_add,
                "badge_zpts_earned": zpts_to_add,
            },
            "$set": set_updates,
        },
    )

    updated_user = await db.users.find_one({"wallet_address": wallet})

    badge_result = evaluate_badges(updated_user)
    await persist_badge_updates(db, updated_user["id"], badge_result["updates"])
    updated_user.update(badge_result["updates"])

    full_loop_result = await maybe_process_full_daily_loop(db, wallet)

    if (
        full_loop_result.get("awarded")
        or full_loop_result.get("reason") == "daily_cap_reached_loop_counted"
    ):
        refreshed_user = await db.users.find_one({"wallet_address": wallet})
        if refreshed_user:
            updated_user = refreshed_user

    return {
        "game": canonical_game_type,
        "score": game_data.score,
        "level": game_data.level,
        "zpts_earned": zpts_to_add,
        "base_zpts": adjusted_base_zpts,
        "achievement_bonus_zpts": achievement_bonus_awarded,
        "personal_best_achieved": personal_best_achieved,
        "daily_best_achieved": daily_best_achieved,
        "session_diminishing_multiplier": session_multiplier,
        "move_dependency_multiplier": move_multiplier,
        "zpts_capped": zpts_to_add < total_requested_zpts,
        "full_loop_awarded": full_loop_result.get("awarded", False),
        "full_loop_bonus": full_loop_result.get("full_loop_bonus", 0),
        "daily_zpts_remaining": max(
            0,
            zpts_cap - int(updated_user.get("daily_zpts_earned", 0)),
        ),
        "new_zpts_balance": int(updated_user.get("zpts_balance", 0)),
        "badge_zpts_earned": updated_user.get("badge_zpts_earned", 0),
        "badge_earner_level": updated_user.get("badge_earner_level", 0),
        "badge_earner_mastered": updated_user.get("badge_earner_mastered", False),
        "badge_finisher_level": updated_user.get("badge_finisher_level", 0),
        "badge_finisher_mastered": updated_user.get("badge_finisher_mastered", False),
        "badge_trophies": updated_user.get("badge_trophies", 0),
        "badge_trophy_bonus_percent": updated_user.get(
            "badge_trophy_bonus_percent", 0
        ),
        "message": f"Earned {zpts_to_add} zPts!",
    }