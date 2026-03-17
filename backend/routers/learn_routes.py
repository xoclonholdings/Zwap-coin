from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
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


class LearnModuleSummary(BaseModel):
    id: str
    title: str
    level: str
    category: str
    short_description: str


LEARN_MODULES = [
    {
        "id": "web3-basics",
        "title": "What Is Web3?",
        "level": "beginner",
        "category": "foundations",
        "short_description": "A simple introduction to Web3, digital ownership, and blockchain-based apps.",
        "content": {
            "overview": (
                "Web3 is a way of building internet products that use blockchains, smart contracts, "
                "and community-owned systems. Instead of relying entirely on one central platform, "
                "Web3 apps can spread trust, data, and control across a network."
            ),
            "key_points": [
                "Web1 was mostly read-only, Web2 became read-and-write, and Web3 adds stronger ideas of ownership and participation.",
                "Web3 often uses blockchains to record activity in a transparent and tamper-resistant way.",
                "Smart contracts are on-chain programs that automatically carry out rules when conditions are met.",
                "dApps are decentralized applications that run using blockchain-connected backends or smart contracts.",
                "Tokens can be used to coordinate access, incentives, rewards, and participation inside an ecosystem.",
            ],
            "zwap_context": (
                "In ZWAP terms, Web3 is not just about holding a token. It is about users interacting with an ecosystem "
                "where wallets, rewards, game participation, and token utility can connect through blockchain rails."
            ),
        },
    },
    {
        "id": "utility-token-basics",
        "title": "What Is a Utility Token?",
        "level": "beginner",
        "category": "tokens",
        "short_description": "Learn what utility tokens do and why they matter inside an app ecosystem.",
        "content": {
            "overview": (
                "A utility token is a digital asset designed to unlock access to features, products, or services "
                "inside a specific ecosystem. Its purpose is use, not just passive holding."
            ),
            "key_points": [
                "A utility token can be used for payments, access, rewards, and sometimes governance.",
                "Its value is usually tied to what it can do inside a platform or network.",
                "Utility tokens are often created through smart contracts on an existing blockchain.",
                "A token can have more than one role, but utility and governance are not exactly the same thing.",
            ],
            "zwap_context": (
                "For ZWAP, utility means the token should connect to real platform behavior such as participation, "
                "access, rewards, marketplace actions, and ecosystem features."
            ),
        },
    },
    {
        "id": "web2-vs-web3",
        "title": "Web2 vs Web3",
        "level": "beginner",
        "category": "foundations",
        "short_description": "A plain-English comparison between platform internet and ownership-oriented internet.",
        "content": {
            "overview": (
                "Web2 is the familiar internet of apps, feeds, and platform accounts. Web3 aims to add stronger user "
                "ownership, programmable assets, and portable participation through blockchain infrastructure."
            ),
            "key_points": [
                "Web2 platforms usually control the rules, storage, and monetization.",
                "Web3 systems try to let users hold assets and identities through wallets rather than only platform accounts.",
                "Web3 can make digital items, access rights, and rewards more portable across products.",
                "Web3 is still early and has usability, security, and education challenges.",
            ],
            "zwap_context": (
                "ZWAP can teach users that a wallet-connected experience is different from a normal app login because "
                "participation can connect to assets and ecosystem utility beyond one single screen."
            ),
        },
    },
    {
        "id": "smart-contract-basics",
        "title": "What Is a Smart Contract?",
        "level": "beginner",
        "category": "foundations",
        "short_description": "Understand the on-chain rules that power many blockchain applications.",
        "content": {
            "overview": (
                "A smart contract is code deployed on a blockchain that runs automatically when its rules are triggered. "
                "It can help automate transfers, permissions, and system behavior."
            ),
            "key_points": [
                "Smart contracts execute logic automatically instead of depending on manual approval.",
                "They are often used for tokens, marketplaces, games, and access logic.",
                "Because they are code, bad smart contracts can also contain bugs or security risks.",
            ],
            "zwap_context": (
                "When ZWAP connects rewards, token utility, or ecosystem mechanics to blockchain logic, smart contracts "
                "become part of the trust layer."
            ),
        },
    },
    {
        "id": "zwap-token-utility",
        "title": "How ZWAP Fits In",
        "level": "beginner",
        "category": "zwap",
        "short_description": "A beginner explanation of how ZWAP and zPts differ and how utility can work inside the app.",
        "content": {
            "overview": (
                "ZWAP is the ecosystem token, while zPts are off-chain in-app points. They are related, but they are not the same thing."
            ),
            "key_points": [
                "zPts are app-tracked points and do not live on-chain.",
                "ZWAP is the token layer used for ecosystem utility.",
                "A healthy beginner flow teaches users what they earn, where it lives, and what they can do with it.",
                "Utility becomes stronger when users can clearly connect rewards, access, and actions inside the app.",
            ],
            "zwap_context": (
                "The Learn module should help users understand the path from learning, to participation, to earning, "
                "to practical token use inside ZWAP."
            ),
        },
    },
]


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


@learn_router.get("/modules", response_model=List[LearnModuleSummary])
async def list_learn_modules():
    return [
        LearnModuleSummary(
            id=module["id"],
            title=module["title"],
            level=module["level"],
            category=module["category"],
            short_description=module["short_description"],
        )
        for module in LEARN_MODULES
    ]


@learn_router.get("/modules/{module_id}")
async def get_learn_module(module_id: str):
    module = next((m for m in LEARN_MODULES if m["id"] == module_id), None)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


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