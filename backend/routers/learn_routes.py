from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from services.badge_service import evaluate_badges, persist_badge_updates
from services.daily_task_service import (
    maybe_mark_learn_task_complete,
    maybe_process_full_daily_loop,
)
from services.reward_service import enforce_daily_caps, get_tier_multipliers
from services.zlearn_service import (
    check_trivia_answer,
    create_trivia_session,
    get_module,
    get_module_summaries,
)

learn_router = APIRouter(prefix="/learn", tags=["Learn"])


class TriviaAnswer(BaseModel):
    question_id: str
    answer: str
    time_taken: float


class LearnModuleSummary(BaseModel):
    id: str
    title: str
    level: str
    category: str
    short_description: str
    core: str
    analogy: str
    did_you_know: List[str]
    quick_check: dict


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
                        "last_zpts_reset": now.isoformat(),
                    }
                },
            )

            user["daily_zpts_earned"] = 0
            user["last_zpts_reset"] = now.isoformat()
    else:
        await db.users.update_one(
            {"wallet_address": user["wallet_address"]},
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


@learn_router.get("/modules", response_model=List[LearnModuleSummary])
async def list_learn_modules():
    return [LearnModuleSummary(**module) for module in get_module_summaries()]


@learn_router.get("/modules/{module_id}")
async def get_learn_module(module_id: str):
    module = get_module(module_id)

    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    return module


@learn_router.get("/trivia/questions")
async def get_trivia_questions(count: int = 5, difficulty: int = 1):
    return create_trivia_session(count=count, difficulty=difficulty)


@learn_router.post("/trivia/answer")
async def check_answer(answer: TriviaAnswer):
    return check_trivia_answer(
        question_id=answer.question_id,
        answer=answer.answer,
        time_taken=answer.time_taken,
    )


@learn_router.post("/complete/{wallet_address}/{module_id}")
async def complete_module(wallet_address: str, module_id: str, request: Request):
    db = request.app.state.db
    wallet = wallet_address.lower().strip()

    if not wallet:
        raise HTTPException(status_code=400, detail="Wallet address is required")

    user = await db.users.find_one({"wallet_address": wallet})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    module = get_module(module_id)

    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    completed = user.get("completed_modules", [])

    if module_id in completed:
        return {
            "success": True,
            "message": "Already completed",
            "module_id": module_id,
            "reward": 0,
        }

    user = await check_and_reset_daily_zpts(db, user)

    tier = user.get("tier", "starter")
    daily_zpts = int(user.get("daily_zpts_earned", 0) or 0)

    tier_config = await get_tier_multipliers(tier)
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

    reward = min(25, int(cap_check["remaining"]))

    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {
                "zpts_balance": reward,
                "daily_zpts_earned": reward,
                "badge_zpts_earned": reward,
                "badge_learn_completions": 1,
                "badge_deep_engagement": 1,
            },
            "$push": {
                "completed_modules": module_id,
            },
            "$set": {
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
        },
    )

    await maybe_mark_learn_task_complete(db, wallet)

    updated_user = await db.users.find_one({"wallet_address": wallet})

    if not updated_user:
        raise HTTPException(status_code=500, detail="User missing after Learn update")

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
        "message": "Module completed",
        "module_id": module_id,
        "reward": reward,
        "full_loop_awarded": full_loop_result.get("awarded", False),
        "full_loop_bonus": full_loop_result.get("full_loop_bonus", 0),
        "new_zpts_balance": int(updated_user.get("zpts_balance", 0)),
        "daily_zpts_remaining": max(
            0,
            int(tier_config["daily_zpts_cap"])
            - int(updated_user.get("daily_zpts_earned", 0)),
        ),
        "badge_learn_completions": updated_user.get("badge_learn_completions", 0),
        "badge_deep_engagement": updated_user.get("badge_deep_engagement", 0),
        "badge_learner_level": updated_user.get("badge_learner_level", 0),
        "badge_learner_mastered": updated_user.get("badge_learner_mastered", False),
        "badge_builder_level": updated_user.get("badge_builder_level", 0),
        "badge_builder_mastered": updated_user.get("badge_builder_mastered", False),
        "badge_finisher_level": updated_user.get("badge_finisher_level", 0),
        "badge_finisher_mastered": updated_user.get("badge_finisher_mastered", False),
        "badge_trophies": updated_user.get("badge_trophies", 0),
        "badge_trophy_bonus_percent": updated_user.get("badge_trophy_bonus_percent", 0),
    }


router = learn_router