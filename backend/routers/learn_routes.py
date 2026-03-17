from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import random
import time as _time
import uuid

learn_router = APIRouter(prefix="/learn", tags=["Learn"])


class TriviaAnswer(BaseModel):
    question_id: str
    answer: str
    time_taken: float


class TriviaQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    difficulty: int


EDUCATION_TRIVIA = [
    {"id": "edu-crypto-1", "module": "What Is Cryptocurrency?", "question": "Is cryptocurrency physical or digital?", "options": ["Physical", "Digital", "Both", "Neither"], "answer": "Digital", "difficulty": 1},
    {"id": "edu-crypto-2", "module": "What Is Cryptocurrency?", "question": "Does one bank control cryptocurrency?", "options": ["Yes", "No", "Sometimes", "Only in the US"], "answer": "No", "difficulty": 1},
    {"id": "edu-crypto-3", "module": "What Is Cryptocurrency?", "question": "What keeps track of crypto transactions?", "options": ["A single bank", "A network of computers", "Paper receipts", "The government"], "answer": "A network of computers", "difficulty": 1},
    {"id": "edu-chain-1", "module": "What Is a Blockchain?", "question": "What are transactions stored in?", "options": ["Files", "Blocks", "Folders", "Emails"], "answer": "Blocks", "difficulty": 1},
    {"id": "edu-chain-2", "module": "What Is a Blockchain?", "question": "Can you erase a block once it is added?", "options": ["Yes", "No", "Only admins can", "After 24 hours"], "answer": "No", "difficulty": 1},
    {"id": "edu-chain-3", "module": "What Is a Blockchain?", "question": "Why is it called a chain?", "options": ["It looks like a chain", "Because blocks are linked together", "It was invented by a chain company", "No reason"], "answer": "Because blocks are linked together", "difficulty": 2},
    {"id": "edu-wallet-1", "module": "What Is a Crypto Wallet?", "question": "Does a wallet hold crypto physically?", "options": ["Yes", "No", "Only some wallets", "Only on phones"], "answer": "No", "difficulty": 1},
    {"id": "edu-wallet-2", "module": "What Is a Crypto Wallet?", "question": "What does a wallet really store?", "options": ["Coins", "Keys", "Passwords", "Photos"], "answer": "Keys", "difficulty": 2},
    {"id": "edu-wallet-3", "module": "What Is a Crypto Wallet?", "question": "Should you share your private key?", "options": ["Yes, with friends", "Never", "Only online", "Only with your bank"], "answer": "Never", "difficulty": 1},
    {"id": "edu-zwap-1", "module": "What Is ZWAP?", "question": "How do you earn ZWAP?", "options": ["Buying it", "Walking and playing games", "Watching ads", "Signing up"], "answer": "Walking and playing games", "difficulty": 1},
    {"id": "edu-zwap-2", "module": "What Is ZWAP?", "question": "Can you use ZWAP in the shop?", "options": ["Yes", "No", "Only on weekends", "Only with Plus"], "answer": "Yes", "difficulty": 1},
    {"id": "edu-zwap-3", "module": "What Is ZWAP?", "question": "Is ZWAP a physical coin?", "options": ["Yes", "No, it is digital", "Sometimes", "Only in some countries"], "answer": "No, it is digital", "difficulty": 1},
    {"id": "edu-zpts-1", "module": "What Are zPts?", "question": "Are zPts the same as ZWAP?", "options": ["Yes", "No", "They are similar", "Only on Plus tier"], "answer": "No", "difficulty": 1},
    {"id": "edu-zpts-2", "module": "What Are zPts?", "question": "How many zPts equal 1 ZWAP?", "options": ["100", "500", "1000", "10000"], "answer": "1000", "difficulty": 2},
    {"id": "edu-zpts-3", "module": "What Are zPts?", "question": "Do zPts live on the blockchain?", "options": ["Yes", "No, they are tracked in the app", "Sometimes", "Only for Plus users"], "answer": "No, they are tracked in the app", "difficulty": 2},
    {"id": "edu-swap-1", "module": "What Is a Swap?", "question": "What does a swap do?", "options": ["Deletes crypto", "Exchanges one crypto for another", "Creates new crypto", "Sends crypto to a bank"], "answer": "Exchanges one crypto for another", "difficulty": 1},
    {"id": "edu-swap-2", "module": "What Is a Swap?", "question": "Does the price stay the same all the time?", "options": ["Yes", "No, it changes", "Only on weekdays", "Only for ZWAP"], "answer": "No, it changes", "difficulty": 2},
    {"id": "edu-swap-3", "module": "What Is a Swap?", "question": "Why is there a small fee?", "options": ["There is no fee", "To help support the system", "To pay the government", "It is a bug"], "answer": "To help support the system", "difficulty": 2},
]

_trivia_sessions = {}


@learn_router.get("/trivia/questions")
async def get_trivia_questions(count: int = 5, difficulty: int = 1):
    """Get trivia questions from the education spine"""
    filtered = [q for q in EDUCATION_TRIVIA if q["difficulty"] <= difficulty + 1]
    selected = random.sample(filtered, min(count, len(filtered)))

    session_id = str(uuid.uuid4())
    _trivia_sessions[session_id] = {
        "questions": {q["id"]: q["answer"] for q in selected},
        "expires": _time.time() + 600,
    }

    now = _time.time()
    expired = [k for k, v in _trivia_sessions.items() if v["expires"] < now]
    for k in expired:
        del _trivia_sessions[k]

    return {
        "session_id": session_id,
        "questions": [
            {
                "id": q["id"],
                "question": q["question"],
                "options": q["options"],
                "difficulty": q["difficulty"],
                "module": q["module"],
            }
            for q in selected
        ],
    }


@learn_router.post("/trivia/answer")
async def check_trivia_answer(answer: TriviaAnswer):
    """Check trivia answer server-side"""
    question = next((q for q in EDUCATION_TRIVIA if q["id"] == answer.question_id), None)
    if not question:
        return {"correct": False, "correct_answer": None, "time_bonus": 0}

    correct = question["answer"] == answer.answer
    time_bonus = max(0, 1 - (answer.time_taken / 30)) if correct else 0

    return {
        "correct": correct,
        "correct_answer": question["answer"],
        "time_bonus": round(time_bonus, 2),
    }


# Export canonical name expected by server.py
router = learn_router