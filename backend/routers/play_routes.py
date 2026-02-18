from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/games", tags=["Play"])

class TriviaAnswerRequest(BaseModel):
    questionId: str
    answer: str
    timeTaken: float

@router.get("/trivia/questions")
async def get_trivia_questions(count: int = 5, difficulty: str = "medium"):
    # TODO: wire to real trivia source/service
    # For now this just confirms the route exists and matches frontend calls.
    return {"questions": [], "count": count, "difficulty": difficulty}

@router.post("/trivia/answer")
async def check_trivia_answer(payload: TriviaAnswerRequest):
    # TODO: wire to real trivia checking logic/service
    return {"correct": False, "explanation": None}

@router.post("/result/{wallet_address}")
async def submit_game_result(wallet_address: str, request: Request):
    # TODO: wire to real reward + zPts logic/service using request.app.state.db
    body = await request.json()
    return {"ok": True, "wallet": wallet_address, "received": body}

