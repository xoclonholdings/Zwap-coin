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
from services.learn_service import (
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


def _safe_email(user: dict) -> str:
    return str(user.get("email") or "").lower().strip()


def _safe_wallet(value: str = "") -> str:
    return str(value or "").lower().strip()


def _get_user_lookup(user: dict) -> dict:
    email = _safe_email(user)

    if email:
        return {"email": email}

    wallet = _safe_wallet(user.get("wallet_address"))

    if wallet:
        return {"wallet_address": wallet}

    return {"id": user["id"]}


async def find_user_for_learn_completion(db, identity: str) -> dict:
    safe_identity = str(identity or "").lower().strip()

    if not safe_identity:
        return None

    user = await db.users.find_one({"email": safe_identity})

    if user:
        return user

    return await db.users.find_one({"wallet_address": safe_identity})


async def check_and_reset_daily_zpts(db, user: dict) -> dict:
    now = datetime.now(timezone.utc)
    last_reset = user.get("last_zpts_reset")
    lookup = _get_user_lookup(user)

    if last_reset:
        last_reset_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))

        if last_reset_dt.date() < now.date():
            await db.users.update_one(
                lookup,
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
            lookup,
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


@learn_router.post("/complete/{identity}/{module_id}")
async def complete_module(identity: str, module_id: str, request: Request):
    db = request.app.state.db
    safe_identity = str(identity or "").lower().strip()

    if not safe_identity:
        raise HTTPException(status_code=400, detail="User identity is required")

    user = await find_user_for_learn_completion(db, safe_identity)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    email = _safe_email(user)
    wallet = _safe_wallet(user.get("wallet_address"))
    lookup = _get_user_lookup(user)

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
        email=email or None,
        wallet_address=wallet or None,
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
        lookup,
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

    if email:
        await maybe_mark_learn_task_complete(db, email)

    updated_user = await db.users.find_one(lookup)

    if not updated_user:
        raise HTTPException(status_code=500, detail="User missing after Learn update")

    badge_result = evaluate_badges(updated_user)
    await persist_badge_updates(db, updated_user["id"], badge_result["updates"])
    updated_user.update(badge_result["updates"])

    full_loop_result = await maybe_process_full_daily_loop(
        db,
        email=email or None,
        wallet_address=wallet or None,
    )

    if (
        full_loop_result.get("awarded")
        or full_loop_result.get("reason") == "cap_reached_loop_counted"
    ):
        refreshed_user = await db.users.find_one(lookup)

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