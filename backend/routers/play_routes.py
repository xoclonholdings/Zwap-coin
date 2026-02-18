"""
Play (Games) Router
====================
Routes for trivia, game results, and future game types.
Reward calculations are delegated to reward_service (stubs for now).
"""

from fastapi import APIRouter, Request
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


@router.get("/trivia/questions")
async def get_trivia_questions(count: int = 5, difficulty: str = "medium"):
    """
    Returns trivia questions.
    Currently: frontend generates questions from the education spine.
    Future: backend generates + validates questions server-side.
    """
    return {"questions": [], "count": count, "difficulty": difficulty}


@router.post("/trivia/answer")
async def check_trivia_answer(payload: TriviaAnswerRequest):
    """
    Validates a trivia answer.
    Currently: stub — frontend validates client-side.
    Future: server-side validation to prevent cheating.
    """
    return {"correct": False, "explanation": None}


@router.post("/result/{wallet_address}")
async def submit_game_result(wallet_address: str, request: Request):
    """
    Submit a game result for reward processing.
    Currently: handled by server.py inline logic.
    Future: delegate to calculate_play_reward() + enforce_daily_caps().
    """
    body = await request.json()
    return {"ok": True, "wallet": wallet_address, "received": body}
