from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List

from services.zlearn_service import (
    get_module,
    get_module_summaries,
    create_trivia_session,
    check_trivia_answer,
    get_ticker_education_items,
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


@learn_router.get("/modules", response_model=List[LearnModuleSummary])
async def list_learn_modules():
    return [LearnModuleSummary(**module) for module in get_module_summaries()]


@learn_router.get("/modules/{module_id}")
async def get_learn_module(module_id: str):
    module = get_module(module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@learn_router.get("/ticker")
async def get_learn_ticker_items(limit: int = 10):
    return get_ticker_education_items(limit=limit)


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
    wallet = wallet_address.lower()

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    completed = user.get("completed_modules", [])
    if module_id in completed:
        return {"message": "Already completed", "reward": 0}

    reward = 25

    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {"zpts_balance": reward, "total_zpts": reward},
            "$push": {"completed_modules": module_id},
        },
    )

    return {
        "message": "Module completed",
        "reward": reward,
    }


router = learn_router