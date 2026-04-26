"""
ZWAP! V1 Play Router
====================
Submits V1 game results and awards controlled zPts.

V1 game registry:
- available now: stackz, breakerz, pulze, zap-man
- locked future games: brainz, triplez, werdz
"""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from services.reward_service import (
    calculate_play_reward,
    enforce_daily_caps,
    get_tier_multipliers,
)
from services.badge_service import evaluate_badges, persist_badge_updates
from services.daily_task_service import maybe_process_full_daily_loop

router = APIRouter(prefix="/games", tags=["Play"])


GAME_REGISTRY = {
    "stackz": {"locked": False},
    "breakerz": {"locked": False},
    "pulze": {"locked": False},
    "zap-man": {"locked": False},
    "brainz": {"locked": True},
    "triplez": {"locked": True},
    "werdz": {"locked": True},
}


class GameResultRequest(BaseModel):
    game_type: str
    score: int
    level: int = 1
    blocks_destroyed: int = 0
    session_duration_seconds: int = 0
    completed: bool = True


def normalize_tier_key(tier: str) -> str:
    safe = str(tier or "").lower().strip()

    if safe in ("plus", "zitizen"):
        return "plus"

    return "starter"


def normalize_game_id(game_type: str) -> str:
    return str(game_type or "").lower().strip()


async def check_and_reset_daily_zpts(db, user: dict) -> dict:
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
                        "games_played_today": 0,
                        "last_zpts_reset": now.isoformat(),
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
                    "games_played_today": 0,
                    "last_zpts_reset": now.isoformat(),
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


def safe_game_field(game_type: str) -> str:
    return game_type.replace("-", "_")


def get_personal_best_field(game_type: str) -> str:
    return f"personal_best_{safe_game_field(game_type)}"


def get_daily_best_field(game_type: str) -> str:
    return f"daily_best_{safe_game_field(game_type)}"


def get_daily_best_count_field(game_type: str) -> str:
    return f"daily_best_count_{safe_game_field(game_type)}"


def get_personal_best_rewarded_day_field(game_type: str) -> str:
    return f"personal_best_rewarded_day_{safe_game_field(game_type)}"


@router.get("/registry")
async def get_game_registry():
    return {
        "games": [
            {"id": game_id, "locked": config["locked"]}
            for game_id, config in GAME_REGISTRY.items()
        ]
    }


@router.post("/result/{wallet_address}")
async def submit_game_result(
    wallet_address: str,
    game_data: GameResultRequest,
    request: Request,
):
    db = request.app.state.db
    wallet = wallet_address.lower().strip()
    canonical_game_type = normalize_game_id(game_data.game_type)

    if not wallet:
        raise HTTPException(status_code=400, detail="Wallet address is required")

    game_config = GAME_REGISTRY.get(canonical_game_type)

    if not game_config:
        raise HTTPException(status_code=400, detail="Unknown game type")

    if game_config["locked"]:
        raise HTTPException(status_code=403, detail="Game is locked")

    if game_data.score < 0:
        raise HTTPException(status_code=400, detail="Invalid score")

    if game_data.level < 1:
        raise HTTPException(status_code=400, detail="Invalid level")

    if game_data.session_duration_seconds < 0:
        raise HTTPException(status_code=400, detail="Invalid session duration")

    user = await db.users.find_one({"wallet_address": wallet})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tier = normalize_tier_key(user.get("tier", "starter"))

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
    except ValueError as error:
        logging.warning(
            "Game reward validation failed for %s / %s: %s",
            wallet,
            canonical_game_type,
            str(error),
        )
        raise HTTPException(status_code=400, detail=str(error))

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
    achievement_bonus_awarded = min(
        achievement_bonus_awarded,
        achievement_bonus_requested,
    )

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

    if not updated_user:
        raise HTTPException(status_code=500, detail="User missing after play update")

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
        "success": True,
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
        "badge_trophy_bonus_percent": updated_user.get("badge_trophy_bonus_percent", 0),
        "message": f"Earned {zpts_to_add} zPts!",
    }