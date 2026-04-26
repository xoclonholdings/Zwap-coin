import random
import time as _time
import uuid
from typing import Any, Dict, List, Optional

# zLearn monolith
# Single education source for:
# - Learn modules
# - Trivia
# - Did you know facts
# - Ticker tips
# - Wallet/About snippets
# - ZWAP-specific concept teaching

ZLEARN_MODULES: List[Dict[str, Any]] = [
    {
        "id": "web3-basics",
        "title": "What Is Web3?",
        "level": "beginner",
        "category": "foundations",
        "icon": "globe",
        "color": "cyan",
        "short_description": "A simple introduction to Web3, digital ownership, and blockchain-based apps.",
        "core": (
            "Web3 is the next layer of the internet where users can do more than just read and interact. "
            "They can also hold assets, connect wallets, and participate in systems powered by blockchain."
        ),
        "analogy": (
            "Think of Web2 like renting space in someone else's mall. Web3 is more like entering a city "
            "where you can actually own your shop, your keys, and some of the roads you use."
        ),
        "did_you_know": [
            "Web3 often uses wallets instead of only usernames and passwords.",
            "Smart contracts can automate rules without needing a central company to approve every action.",
            "Many Web3 apps use tokens to coordinate rewards, access, and participation.",
        ],
        "tips": [
            "Start simple. You do not need to understand every Web3 concept in one day.",
            "Focus first on wallets, blockchain, and token utility.",
        ],
        "quick_check": {
            "question": "What makes Web3 different from earlier internet models?",
            "answer": "It adds stronger ideas of ownership, wallets, blockchain, and token-powered participation.",
        },
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
        "trivia": [
            {
                "id": "web3-basics-1",
                "question": "What makes Web3 different from older internet models?",
                "options": [
                    "It removes all apps",
                    "It adds stronger ownership and wallet-based participation",
                    "It only works for banks",
                    "It has no users"
                ],
                "answer": "It adds stronger ownership and wallet-based participation",
                "difficulty": 1,
            }
        ],
    },
    {
        "id": "cryptocurrency",
        "title": "What Is Cryptocurrency?",
        "level": "beginner",
        "category": "foundations",
        "icon": "coins",
        "color": "cyan",
        "short_description": "A beginner-friendly definition of digital money.",
        "core": (
            "Cryptocurrency is digital money that lives on the internet. It is not printed like paper cash "
            "and it is not controlled by one single bank. Instead, it runs on a network of computers that agree on every transaction."
        ),
        "analogy": (
            "Think of it like a shared notebook that everyone can see, but no one can erase. "
            "Every time someone sends money, it gets written in ink."
        ),
        "did_you_know": [
            "Crypto transactions are recorded on something called a blockchain.",
            "You do not need a bank to send cryptocurrency.",
            "Every crypto transaction is verified by computers around the world.",
        ],
        "tips": [
            "Crypto is digital. Do not think of it like paper cash.",
            "Always double-check which token and network you are using.",
        ],
        "quick_check": {
            "question": "Is cryptocurrency physical or digital?",
            "answer": "Digital.",
        },
        "content": {
            "overview": (
                "Cryptocurrency is digital money that uses blockchain systems to record and verify transactions."
            ),
            "key_points": [
                "Crypto is digital money.",
                "It is tracked through blockchain systems.",
                "It is not usually controlled by one bank.",
                "Users often access it through wallets.",
            ],
            "zwap_context": (
                "ZWAP is part of a crypto ecosystem, so users need a clear foundation for what digital assets are "
                "before they can understand reward flows, swaps, and token utility."
            ),
        },
        "trivia": [
            {
                "id": "edu-crypto-1",
                "question": "Is cryptocurrency physical or digital?",
                "options": ["Physical", "Digital", "Both", "Neither"],
                "answer": "Digital",
                "difficulty": 1,
            },
            {
                "id": "edu-crypto-2",
                "question": "Does one bank control cryptocurrency?",
                "options": ["Yes", "No", "Sometimes", "Only in the US"],
                "answer": "No",
                "difficulty": 1,
            },
            {
                "id": "edu-crypto-3",
                "question": "What keeps track of crypto transactions?",
                "options": [
                    "A single bank",
                    "A network of computers",
                    "Paper receipts",
                    "The government",
                ],
                "answer": "A network of computers",
                "difficulty": 1,
            },
        ],
    },
    {
        "id": "blockchain",
        "title": "What Is a Blockchain?",
        "level": "beginner",
        "category": "foundations",
        "icon": "blocks",
        "color": "purple",
        "short_description": "How blockchain works in plain English.",
        "core": (
            "A blockchain is a digital record book. It stores transactions in blocks. "
            "Once a block is full, it gets sealed and linked to the next one."
        ),
        "analogy": (
            "Imagine stacking Lego bricks. Each brick connects to the one before it. "
            "If someone tries to remove one in the middle, the whole stack breaks."
        ),
        "did_you_know": [
            "Blockchain makes cheating very hard.",
            "Blocks are connected in order, like train cars.",
            "Once information is added, it cannot easily be changed.",
        ],
        "tips": [
            "Blockchain is the record layer, not the app itself.",
            "The chain helps create trust through visible history.",
        ],
        "quick_check": {
            "question": "What are transactions stored in on a blockchain?",
            "answer": "Blocks.",
        },
        "content": {
            "overview": (
                "A blockchain is a digital ledger that stores information in linked blocks."
            ),
            "key_points": [
                "Transactions are grouped into blocks.",
                "Blocks are linked in order.",
                "Changing old records is very difficult.",
                "This helps create transparency and trust.",
            ],
            "zwap_context": (
                "ZWAP users do not need to be engineers, but they should understand that blockchains are the rails "
                "that help digital assets and on-chain systems work."
            ),
        },
        "trivia": [
            {
                "id": "edu-chain-1",
                "question": "What are transactions stored in?",
                "options": ["Files", "Blocks", "Folders", "Emails"],
                "answer": "Blocks",
                "difficulty": 1,
            },
            {
                "id": "edu-chain-2",
                "question": "Can you erase a block once it is added?",
                "options": ["Yes", "No", "Only admins can", "After 24 hours"],
                "answer": "No",
                "difficulty": 1,
            },
            {
                "id": "edu-chain-3",
                "question": "Why is it called a chain?",
                "options": [
                    "It looks like a chain",
                    "Because blocks are linked together",
                    "It was invented by a chain company",
                    "No reason",
                ],
                "answer": "Because blocks are linked together",
                "difficulty": 2,
            },
        ],
    },
    {
        "id": "wallet",
        "title": "What Is a Crypto Wallet?",
        "level": "beginner",
        "category": "foundations",
        "icon": "wallet",
        "color": "blue",
        "short_description": "A simple explanation of what wallets really do.",
        "core": (
            "A crypto wallet does not store money the way a physical wallet does. "
            "It stores keys that allow you to access your crypto."
        ),
        "analogy": (
            "Your wallet is like the key to a safety deposit box. "
            "The money is not in the key. The key just unlocks access."
        ),
        "did_you_know": [
            "Your wallet address is usually safe to share.",
            "Your private key should never be shared.",
            "Losing your private key can mean losing access.",
        ],
        "tips": [
            "Never share your private key or seed phrase.",
            "A wallet helps you access assets. It does not physically hold them.",
        ],
        "quick_check": {
            "question": "What does a wallet really store?",
            "answer": "Keys.",
        },
        "content": {
            "overview": (
                "A wallet is the tool that helps a user access and control their crypto assets."
            ),
            "key_points": [
                "Wallets manage access through keys.",
                "Wallets can connect users to Web3 apps.",
                "Wallet addresses can be public.",
                "Private keys must stay private.",
            ],
            "zwap_context": (
                "ZWAP uses wallet-based participation, so wallet education is one of the most important beginner lessons in the app."
            ),
        },
        "trivia": [
            {
                "id": "edu-wallet-1",
                "question": "Does a wallet hold crypto physically?",
                "options": ["Yes", "No", "Only some wallets", "Only on phones"],
                "answer": "No",
                "difficulty": 1,
            },
            {
                "id": "edu-wallet-2",
                "question": "What does a wallet really store?",
                "options": ["Coins", "Keys", "Passwords", "Photos"],
                "answer": "Keys",
                "difficulty": 2,
            },
            {
                "id": "edu-wallet-3",
                "question": "Should you share your private key?",
                "options": ["Yes, with friends", "Never", "Only online", "Only with your bank"],
                "answer": "Never",
                "difficulty": 1,
            },
        ],
    },
    {
        "id": "utility-token-basics",
        "title": "What Is a Utility Token?",
        "level": "beginner",
        "category": "tokens",
        "icon": "ticket",
        "color": "purple",
        "short_description": "Learn what utility tokens do and why they matter inside an app ecosystem.",
        "core": (
            "A utility token is a token that is meant to be used. Its job is not just to sit in a wallet. "
            "It should unlock value inside a product, platform, or ecosystem."
        ),
        "analogy": (
            "Think of a utility token like a universal pass, arcade card, and rewards key blended together."
        ),
        "did_you_know": [
            "Utility tokens can be used for access, payments, rewards, or ecosystem participation.",
            "A token can have utility without representing ownership in a company.",
            "The stronger the real use inside a platform, the stronger the utility story becomes.",
        ],
        "tips": [
            "A utility token matters most when users can actually do something with it.",
        ],
        "quick_check": {
            "question": "What gives a utility token meaning?",
            "answer": "What it can actually do inside the ecosystem.",
        },
        "content": {
            "overview": (
                "A utility token is a digital asset designed to unlock access to features, products, or services "
                "inside a specific ecosystem."
            ),
            "key_points": [
                "Utility tokens are meant for use.",
                "Their value is tied to ecosystem function.",
                "They can power rewards, access, and participation.",
            ],
            "zwap_context": (
                "For ZWAP, utility means the token should connect to real platform behavior such as participation, "
                "access, rewards, marketplace actions, and ecosystem features."
            ),
        },
        "trivia": [],
    },
    {
        "id": "zwap-token-utility",
        "title": "How ZWAP Fits In",
        "level": "beginner",
        "category": "zwap",
        "icon": "zap",
        "color": "emerald",
        "short_description": "A beginner explanation of how ZWAP and zPts differ and how utility can work inside the app.",
        "core": (
            "ZWAP and zPts are connected, but they are not the same thing. "
            "zPts are in-app points. ZWAP is the token layer."
        ),
        "analogy": (
            "Think of zPts like points on your arcade card, while ZWAP is the actual token rail connected to the wider ecosystem."
        ),
        "did_you_know": [
            "zPts are tracked in the app and are not on-chain.",
            "ZWAP is the token users associate with ecosystem utility.",
            "Clear education reduces confusion between rewards, balances, and token use.",
        ],
        "tips": [
            "zPts and ZWAP should always be explained separately in the UI.",
            "Good education prevents reward confusion.",
        ],
        "quick_check": {
            "question": "Are zPts and ZWAP the same thing?",
            "answer": "No. zPts are app points, while ZWAP is the token layer.",
        },
        "content": {
            "overview": (
                "ZWAP is the ecosystem token, while zPts are off-chain in-app points."
            ),
            "key_points": [
                "zPts are app-tracked points and do not live on-chain.",
                "ZWAP is the token layer used for ecosystem utility.",
                "Users need to understand what they earn, where it lives, and what it does.",
            ],
            "zwap_context": (
                "The Learn module should help users understand the path from learning, to participation, to earning, "
                "to practical token use inside ZWAP."
            ),
        },
        "trivia": [],
    },
    {
        "id": "zpts",
        "title": "What Are zPts?",
        "level": "beginner",
        "category": "zwap",
        "icon": "star",
        "color": "purple",
        "short_description": "Understand the role of zPts inside the app.",
        "core": (
            "zPts are reward points inside the app. They are not cryptocurrency. "
            "But they can convert into ZWAP."
        ),
        "analogy": (
            "zPts are like reward stars in school. Collect enough stars and you get a prize."
        ),
        "did_you_know": [
            "zPts are tracked in the app database.",
            "zPts help prevent spam rewards.",
            "zPts can have daily limits depending on your tier.",
        ],
        "tips": [
            "zPts are app-side points, not on-chain tokens.",
        ],
        "quick_check": {
            "question": "How many zPts equal 1 ZWAP?",
            "answer": "1000.",
        },
        "content": {
            "overview": "zPts are in-app reward points that can convert into ZWAP.",
            "key_points": [
                "zPts are off-chain.",
                "zPts are tracked in the app database.",
                "1000 zPts convert into 1 ZWAP.",
            ],
            "zwap_context": (
                "zPts give ZWAP a smoother reward system by letting the app track progress before token conversion."
            ),
        },
        "trivia": [
            {
                "id": "edu-zpts-1",
                "question": "Are zPts the same as ZWAP?",
                "options": ["Yes", "No", "They are similar", "Only on Plus tier"],
                "answer": "No",
                "difficulty": 1,
            },
            {
                "id": "edu-zpts-2",
                "question": "How many zPts equal 1 ZWAP?",
                "options": ["100", "500", "1000", "10000"],
                "answer": "1000",
                "difficulty": 2,
            },
            {
                "id": "edu-zpts-3",
                "question": "Do zPts live on the blockchain?",
                "options": ["Yes", "No, they are tracked in the app", "Sometimes", "Only for Plus users"],
                "answer": "No, they are tracked in the app",
                "difficulty": 2,
            },
        ],
    },
    {
        "id": "swap",
        "title": "What Is a Swap?",
        "level": "beginner",
        "category": "tokens",
        "icon": "arrows",
        "color": "green",
        "short_description": "A simple explanation of exchanging one crypto asset for another.",
        "core": (
            "A swap lets you exchange one cryptocurrency for another. "
            "It works like trading one type of money for another."
        ),
        "analogy": "Like exchanging dollars for euros at an airport.",
        "did_you_know": [
            "Swap prices change based on market value.",
            "Small fees help support the network.",
            "Swaps use live market pricing.",
        ],
        "tips": [
            "Prices can move while you are preparing a swap.",
            "Always confirm the token and amount before swapping.",
        ],
        "quick_check": {
            "question": "What does a swap do?",
            "answer": "It exchanges one crypto asset for another.",
        },
        "content": {
            "overview": (
                "A swap is the exchange of one token or cryptocurrency for another."
            ),
            "key_points": [
                "Swaps exchange one digital asset for another.",
                "Prices can change based on live market conditions.",
                "Small fees are usually part of the process.",
            ],
            "zwap_context": (
                "In ZWAP, swap education helps users understand that exchange functions are based on price movement, "
                "fees, and the assets involved."
            ),
        },
        "trivia": [
            {
                "id": "edu-swap-1",
                "question": "What does a swap do?",
                "options": [
                    "Deletes crypto",
                    "Exchanges one crypto for another",
                    "Creates new crypto",
                    "Sends crypto to a bank",
                ],
                "answer": "Exchanges one crypto for another",
                "difficulty": 1,
            },
            {
                "id": "edu-swap-2",
                "question": "Does the price stay the same all the time?",
                "options": ["Yes", "No, it changes", "Only on weekdays", "Only for ZWAP"],
                "answer": "No, it changes",
                "difficulty": 2,
            },
            {
                "id": "edu-swap-3",
                "question": "Why is there a small fee?",
                "options": ["There is no fee", "To help support the system", "To pay the government", "It is a bug"],
                "answer": "To help support the system",
                "difficulty": 2,
            },
        ],
    },
]

_trivia_sessions: Dict[str, Dict[str, Any]] = {}


def list_modules() -> List[Dict[str, Any]]:
    return ZLEARN_MODULES


def get_module(module_id: str) -> Optional[Dict[str, Any]]:
    return next((m for m in ZLEARN_MODULES if m["id"] == module_id), None)


def get_module_summaries() -> List[Dict[str, Any]]:
    summaries = []
    for module in ZLEARN_MODULES:
        summaries.append(
            {
                "id": module["id"],
                "title": module["title"],
                "level": module["level"],
                "category": module["category"],
                "short_description": module["short_description"],
                "core": module["core"],
                "analogy": module["analogy"],
                "did_you_know": module["did_you_know"],
                "quick_check": module["quick_check"],
            }
        )
    return summaries


def get_all_trivia() -> List[Dict[str, Any]]:
    trivia_items: List[Dict[str, Any]] = []

    for module in ZLEARN_MODULES:
        for item in module.get("trivia", []):
            trivia_items.append(
                {
                    "id": item["id"],
                    "module_id": module["id"],
                    "module": module["title"],
                    "question": item["question"],
                    "options": item["options"],
                    "answer": item["answer"],
                    "difficulty": item.get("difficulty", 1),
                }
            )

    return trivia_items


def create_trivia_session(count: int = 5, difficulty: int = 1) -> Dict[str, Any]:
    all_trivia = get_all_trivia()
    filtered = [q for q in all_trivia if q["difficulty"] <= difficulty + 1]
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
                "module_id": q["module_id"],
            }
            for q in selected
        ],
    }


def check_trivia_answer(question_id: str, answer: str, time_taken: float) -> Dict[str, Any]:
    question = next((q for q in get_all_trivia() if q["id"] == question_id), None)
    if not question:
        return {"correct": False, "correct_answer": None, "time_bonus": 0}

    correct = question["answer"] == answer
    time_bonus = max(0, 1 - (time_taken / 30)) if correct else 0

    return {
        "correct": correct,
        "correct_answer": question["answer"],
        "time_bonus": round(time_bonus, 2),
    }


def get_all_did_you_know() -> List[Dict[str, str]]:
    facts: List[Dict[str, str]] = []

    for module in ZLEARN_MODULES:
        for fact in module.get("did_you_know", []):
            facts.append(
                {
                    "type": "did_you_know",
                    "module_id": module["id"],
                    "module_title": module["title"],
                    "text": fact,
                }
            )

    return facts


def get_all_tips() -> List[Dict[str, str]]:
    tips: List[Dict[str, str]] = []

    for module in ZLEARN_MODULES:
        for tip in module.get("tips", []):
            tips.append(
                {
                    "type": "tip",
                    "module_id": module["id"],
                    "module_title": module["title"],
                    "text": tip,
                }
            )

    return tips


def get_ticker_education_items(limit: int = 10) -> List[Dict[str, str]]:
    pool = get_all_did_you_know() + get_all_tips()
    random.shuffle(pool)
    return pool[: max(1, limit)]


def get_wallet_module() -> Optional[Dict[str, Any]]:
    return get_module("wallet")
