from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import random
from web3 import Web3
import asyncio
from functools import lru_cache

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')

# Create the main app
app = FastAPI(title="ZWAP! Coin API")
api_router = APIRouter(prefix="/api")

# ============ CONSTANTS ============
# ============ ZWAP CONTRACT CONFIG ============
ZWAP_CONTRACT_ADDRESS = "0xe8898453af13b9496a6e8ada92c6efdaf4967a81"
ZWAP_CHAIN_ID = 137  # Polygon
ZWAP_DECIMALS = 18

# Treasury wallet (to be set)
TREASURY_WALLET = os.environ.get("TREASURY_WALLET", "")

# Web3 Setup for Polygon
POLYGON_RPC_URL = os.environ.get("POLYGON_RPC_URL", "")
w3 = Web3(Web3.HTTPProvider(POLYGON_RPC_URL)) if POLYGON_RPC_URL else None

# ERC-20 ABI (minimal for balanceOf)
ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
]

# ZWAP Contract instance
zwap_contract = None
if w3 and w3.is_connected():
    zwap_contract = w3.eth.contract(
        address=Web3.to_checksum_address(ZWAP_CONTRACT_ADDRESS),
        abi=ERC20_ABI
    )
    logging.info(f"Connected to Polygon. ZWAP contract loaded at {ZWAP_CONTRACT_ADDRESS}")

TIERS = {
    "starter": {
        "name": "Starter",
        "price": 0,
        "zwap_multiplier": 1.0,
        "daily_zpts_cap": 75,
        "monthly_zwap_cap": 146250,
        "games": ["zbrickles", "ztrivia"],
        "features": ["zWALK", "ads"]
    },
    "plus": {
        "name": "Plus",
        "price": 12.99,
        "zwap_multiplier": 1.5,
        "daily_zpts_cap": 150,
        "monthly_zwap_cap": 219375,
        "games": ["zbrickles", "ztrivia", "ztetris", "zslots"],
        "features": ["zWALK", "no_ads", "zDance", "zWorkout"]
    }
}

ZPTS_TO_ZWAP_RATE = 1000  # 1000 Z Points = 1 ZWAP

# ============ ANTI-CHEAT: RATE LIMITING ============

from collections import defaultdict
import time as _time

# In-memory rate limiter {wallet: {action: last_timestamp}}
_rate_limits = defaultdict(dict)

# Daily ZWAP tracking reset helper
async def check_and_reset_daily_zwap(user: dict) -> dict:
    """Reset daily ZWAP earned at midnight UTC"""
    now = datetime.now(timezone.utc)
    last_reset = user.get("last_zwap_reset")
    if last_reset:
        last_dt = datetime.fromisoformat(last_reset.replace('Z', '+00:00'))
        if last_dt.date() < now.date():
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"daily_zwap_earned": 0.0, "last_zwap_reset": now.isoformat()}}
            )
            user["daily_zwap_earned"] = 0.0
    else:
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"daily_zwap_earned": 0.0, "last_zwap_reset": now.isoformat()}}
        )
        user["daily_zwap_earned"] = 0.0
    return user

def check_rate_limit(wallet: str, action: str, cooldown_seconds: int) -> bool:
    """Returns True if rate-limited (too soon). False if OK."""
    now = _time.time()
    last = _rate_limits[wallet].get(action, 0)
    if now - last < cooldown_seconds:
        return True
    _rate_limits[wallet][action] = now
    return False

# Anti-cheat constants
STEP_CLAIM_COOLDOWN = 300   # 5 min between step claims
GAME_RESULT_COOLDOWN = 20   # 20 sec between game submissions
MAX_STEPS_PER_CLAIM = 50000
MIN_STEPS_PER_CLAIM = 10
MAX_GAME_SCORES = {"zbrickles": 5000, "ztrivia": 50, "ztetris": 10000, "zslots": 8000}
DAILY_ZWAP_CAPS = {"starter": 500.0, "plus": 1500.0}

# ============ MODELS ============

class UserCreate(BaseModel):
    wallet_address: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    wallet_address: str
    zwap_balance: float = 0.0
    zpts_balance: int = 0
    tier: str = "starter"
    subscription_id: Optional[str] = None
    subscription_status: Optional[str] = None
    total_steps: int = 0
    daily_steps: int = 0
    daily_zpts_earned: int = 0
    last_zpts_reset: Optional[str] = None
    games_played: int = 0
    total_earned: float = 0.0
    created_at: str

class StepsUpdate(BaseModel):
    steps: int

class GameResult(BaseModel):
    game_type: str
    score: int
    level: int = 1
    blocks_destroyed: int = 0

class TriviaAnswer(BaseModel):
    question_id: str
    answer: str
    time_taken: float  # seconds

class ConvertZPtsRequest(BaseModel):
    zpts_amount: int

class ShopItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    price_zwap: float
    price_zpts: Optional[int] = None
    image_url: str
    category: str
    in_stock: bool = True
    plus_only: bool = False

class PurchaseRequest(BaseModel):
    item_id: str
    payment_type: str = "zwap"  # "zwap" or "zpts"

class SwapRequest(BaseModel):
    from_token: str
    to_token: str
    amount: float

class SwapResponse(BaseModel):
    from_token: str
    to_token: str
    from_amount: float
    to_amount: float
    rate: float
    fee: float
    transaction_id: str

class SubscriptionRequest(BaseModel):
    origin_url: str

class TriviaQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    difficulty: int  # 1-5

# ============ HELPER FUNCTIONS ============

async def get_crypto_prices():
    """Fetch real crypto prices from CoinGecko"""
    try:
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(
                "https://api.coingecko.com/api/v3/simple/price",
                params={"ids": "bitcoin,ethereum,matic-network,solana", "vs_currency": "usd"},
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "BTC": data.get("bitcoin", {}).get("usd", 65000),
                    "ETH": data.get("ethereum", {}).get("usd", 3500),
                    "POL": data.get("matic-network", {}).get("usd", 0.85),
                    "SOL": data.get("solana", {}).get("usd", 150),
                    "ZWAP": 0.01
                }
    except Exception as e:
        logging.error(f"Error fetching prices: {e}")
    return {"BTC": 65000, "ETH": 3500, "POL": 0.85, "SOL": 150, "ZWAP": 0.01}

def calculate_step_rewards(steps: int, multiplier: float = 1.0) -> float:
    """Tiered earning system for steps"""
    if steps < 1000:
        base = steps * 0.01
    elif steps < 5000:
        base = 10 + (steps - 1000) * 0.02
    elif steps < 10000:
        base = 90 + (steps - 5000) * 0.03
    else:
        base = 240 + (steps - 10000) * 0.05
    return base * multiplier

def calculate_game_rewards(game_type: str, score: int, level: int, blocks: int = 0, multiplier: float = 1.0) -> dict:
    """Calculate ZWAP and Z Points rewards for games with progressive difficulty"""
    # Base rewards scale with level difficulty
    difficulty_multiplier = 1 + (level - 1) * 0.1  # Harder levels = slightly more reward
    
    if game_type == "zbrickles":
        base_zwap = min(blocks * 0.5 + (score / 100), 50)  # Cap per game
        base_zpts = min(blocks + (score // 50), 10)  # Cap Z Points
    elif game_type == "ztrivia":
        base_zwap = min(score * 0.5, 30)  # Per correct answer
        base_zpts = min(score * 2, 8)
    elif game_type == "ztetris":
        base_zwap = min((score / 100) + (level * 2), 75)
        base_zpts = min((score // 100) + level, 12)
    elif game_type == "zslots":
        base_zwap = min(score * 0.3, 40)
        base_zpts = min(score // 10, 8)
    else:
        base_zwap = 0
        base_zpts = 0
    
    return {
        "zwap": round(base_zwap * difficulty_multiplier * multiplier, 2),
        "zpts": int(base_zpts * difficulty_multiplier)
    }

async def check_and_reset_daily_zpts(user: dict) -> dict:
    """Check if daily Z Points should be reset"""
    now = datetime.now(timezone.utc)
    last_reset = user.get("last_zpts_reset")
    
    if last_reset:
        last_reset_dt = datetime.fromisoformat(last_reset.replace('Z', '+00:00'))
        if last_reset_dt.date() < now.date():
            # Reset daily Z Points
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"daily_zpts_earned": 0, "last_zpts_reset": now.isoformat()}}
            )
            user["daily_zpts_earned"] = 0
    else:
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"last_zpts_reset": now.isoformat()}}
        )
    
    return user

def get_user_tier_config(tier: str) -> dict:
    return TIERS.get(tier, TIERS["starter"])

async def get_onchain_zwap_balance(wallet_address: str) -> Optional[float]:
    """Get ZWAP balance from Polygon blockchain"""
    if not zwap_contract or not w3:
        logging.warning("Web3 not connected, cannot fetch on-chain balance")
        return None
    
    try:
        # Run blocking Web3 call in thread pool
        loop = asyncio.get_event_loop()
        checksum_address = Web3.to_checksum_address(wallet_address)
        
        # Get balance (blocking call)
        balance_wei = await loop.run_in_executor(
            None, 
            zwap_contract.functions.balanceOf(checksum_address).call
        )
        
        # Convert from wei (18 decimals) to human readable
        balance = balance_wei / (10 ** ZWAP_DECIMALS)
        return balance
    except Exception as e:
        logging.error(f"Error fetching on-chain balance for {wallet_address}: {e}")
        return None

# ============ USER ENDPOINTS ============

@api_router.post("/users/connect", response_model=UserResponse)
async def connect_wallet(user_data: UserCreate):
    """Connect wallet and create/get user"""
    wallet = user_data.wallet_address.lower()
    existing = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    
    if existing:
        return UserResponse(**existing)
    
    new_user = {
        "id": str(uuid.uuid4()),
        "wallet_address": wallet,
        "zwap_balance": 100.0,
        "zpts_balance": 0,
        "tier": "starter",
        "subscription_id": None,
        "subscription_status": None,
        "total_steps": 0,
        "daily_steps": 0,
        "daily_zpts_earned": 0,
        "last_zpts_reset": datetime.now(timezone.utc).isoformat(),
        "games_played": 0,
        "total_earned": 100.0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(new_user)
    return UserResponse(**{k: v for k, v in new_user.items() if k != "_id"})

@api_router.get("/users/{wallet_address}", response_model=UserResponse)
async def get_user(wallet_address: str):
    """Get user by wallet address"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    avatar_url: Optional[str] = None

@api_router.put("/users/{wallet_address}/profile")
async def update_profile(wallet_address: str, profile: ProfileUpdate):
    """Update user profile (username and avatar)"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {}
    if profile.username:
        update_data["custom_username"] = profile.username
    if profile.avatar_url:
        update_data["avatar_url"] = profile.avatar_url
    
    if update_data:
        await db.users.update_one(
            {"wallet_address": wallet},
            {"$set": update_data}
        )
    
    updated = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    return updated

@api_router.get("/tiers")
async def get_tiers():
    """Get available subscription tiers"""
    return TIERS

# ============ BLOCKCHAIN ENDPOINTS ============

@api_router.get("/blockchain/balance/{wallet_address}")
async def get_blockchain_balance(wallet_address: str):
    """Get real on-chain ZWAP balance from Polygon"""
    try:
        balance = await get_onchain_zwap_balance(wallet_address)
        if balance is None:
            return {
                "wallet_address": wallet_address,
                "onchain_balance": None,
                "error": "Unable to fetch on-chain balance",
                "connected": w3.is_connected() if w3 else False
            }
        
        return {
            "wallet_address": wallet_address,
            "onchain_balance": balance,
            "contract_address": ZWAP_CONTRACT_ADDRESS,
            "network": "polygon",
            "chain_id": ZWAP_CHAIN_ID,
            "decimals": ZWAP_DECIMALS
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/blockchain/contract-info")
async def get_contract_info():
    """Get ZWAP token contract information"""
    if not zwap_contract or not w3:
        return {
            "connected": False,
            "error": "Web3 not connected"
        }
    
    try:
        loop = asyncio.get_event_loop()
        
        # Get token info
        symbol = await loop.run_in_executor(None, zwap_contract.functions.symbol().call)
        decimals = await loop.run_in_executor(None, zwap_contract.functions.decimals().call)
        total_supply_wei = await loop.run_in_executor(None, zwap_contract.functions.totalSupply().call)
        total_supply = total_supply_wei / (10 ** decimals)
        
        return {
            "connected": True,
            "contract_address": ZWAP_CONTRACT_ADDRESS,
            "network": "polygon",
            "chain_id": ZWAP_CHAIN_ID,
            "symbol": symbol,
            "decimals": decimals,
            "total_supply": total_supply,
            "total_supply_formatted": f"{total_supply:,.0f}"
        }
    except Exception as e:
        logging.error(f"Error fetching contract info: {e}")
        return {
            "connected": w3.is_connected() if w3 else False,
            "error": str(e)
        }

# ============ FAUCET ENDPOINTS (MOVE) ============

@api_router.post("/faucet/steps/{wallet_address}")
async def claim_step_rewards(wallet_address: str, steps_data: StepsUpdate):
    """Claim ZWAP rewards for steps (no Z Points from walking)"""
    wallet = wallet_address.lower()

    # Anti-cheat: rate limit
    if check_rate_limit(wallet, "steps", STEP_CLAIM_COOLDOWN):
        raise HTTPException(status_code=429, detail="Too many step claims. Please wait a few minutes.")

    # Anti-cheat: sanity checks
    if steps_data.steps < MIN_STEPS_PER_CLAIM:
        raise HTTPException(status_code=400, detail=f"Minimum {MIN_STEPS_PER_CLAIM} steps required")
    if steps_data.steps > MAX_STEPS_PER_CLAIM:
        raise HTTPException(status_code=400, detail=f"Step count exceeds maximum ({MAX_STEPS_PER_CLAIM})")

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tier = user.get("tier", "starter")
    tier_config = get_user_tier_config(tier)

    # Daily ZWAP cap enforcement
    user = await check_and_reset_daily_zwap(user)
    daily_zwap = user.get("daily_zwap_earned", 0.0)
    zwap_cap = DAILY_ZWAP_CAPS.get(tier, 500.0)

    if daily_zwap >= zwap_cap:
        raise HTTPException(status_code=429, detail="Daily ZWAP earning limit reached. Come back tomorrow!")

    rewards = calculate_step_rewards(steps_data.steps, tier_config["zwap_multiplier"])

    # Cap rewards to remaining daily allowance
    rewards = min(rewards, zwap_cap - daily_zwap)

    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {"zwap_balance": rewards, "total_steps": steps_data.steps, "total_earned": rewards, "daily_zwap_earned": rewards},
            "$set": {"daily_steps": steps_data.steps}
        }
    )

    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    return {
        "steps_counted": steps_data.steps,
        "rewards_earned": round(rewards, 2),
        "new_balance": updated_user["zwap_balance"],
        "daily_zwap_remaining": round(zwap_cap - updated_user.get("daily_zwap_earned", 0), 2),
        "message": f"Earned {rewards:.2f} ZWAP for {steps_data.steps} steps!"
    }

# ============ GAME ENDPOINTS ============

@api_router.post("/games/result/{wallet_address}")
async def submit_game_result(wallet_address: str, game_data: GameResult):
    """Submit game result and claim rewards (ZWAP + Z Points)"""
    wallet = wallet_address.lower()

    # Anti-cheat: rate limit
    if check_rate_limit(wallet, "game", GAME_RESULT_COOLDOWN):
        raise HTTPException(status_code=429, detail="Submitting too fast. Wait a moment between games.")

    # Anti-cheat: score sanity check
    max_score = MAX_GAME_SCORES.get(game_data.game_type, 5000)
    if game_data.score > max_score:
        logging.warning(f"Anti-cheat flag: {wallet} submitted {game_data.game_type} score {game_data.score} (max {max_score})")
        raise HTTPException(status_code=400, detail="Invalid score")

    if game_data.score < 0 or game_data.level < 1:
        raise HTTPException(status_code=400, detail="Invalid game data")

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    tier = user.get("tier", "starter")
    tier_config = get_user_tier_config(tier)

    if game_data.game_type not in tier_config["games"]:
        raise HTTPException(status_code=403, detail=f"Game not available in {tier_config['name']} tier")

    # Daily Z Points cap
    user = await check_and_reset_daily_zpts(user)
    daily_zpts = user.get("daily_zpts_earned", 0)
    zpts_cap = tier_config["daily_zpts_cap"]

    # Daily ZWAP cap
    user = await check_and_reset_daily_zwap(user)
    daily_zwap = user.get("daily_zwap_earned", 0.0)
    zwap_cap = DAILY_ZWAP_CAPS.get(tier, 500.0)

    rewards = calculate_game_rewards(
        game_data.game_type, game_data.score, game_data.level,
        game_data.blocks_destroyed, tier_config["zwap_multiplier"]
    )

    # Cap Z Points to daily limit
    zpts_to_add = max(0, min(rewards["zpts"], zpts_cap - daily_zpts))
    # Cap ZWAP to daily limit
    zwap_to_add = max(0.0, min(rewards["zwap"], zwap_cap - daily_zwap))

    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {
                "zwap_balance": zwap_to_add,
                "zpts_balance": zpts_to_add,
                "games_played": 1,
                "total_earned": zwap_to_add,
                "daily_zpts_earned": zpts_to_add,
                "daily_zwap_earned": zwap_to_add,
            }
        }
    )

    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})

    return {
        "game": game_data.game_type,
        "score": game_data.score,
        "level": game_data.level,
        "zwap_earned": round(zwap_to_add, 2),
        "zpts_earned": zpts_to_add,
        "zpts_capped": zpts_to_add < rewards["zpts"],
        "zwap_capped": zwap_to_add < rewards["zwap"],
        "daily_zpts_remaining": zpts_cap - updated_user.get("daily_zpts_earned", 0),
        "daily_zwap_remaining": round(zwap_cap - updated_user.get("daily_zwap_earned", 0), 2),
        "new_zwap_balance": updated_user["zwap_balance"],
        "new_zpts_balance": updated_user["zpts_balance"],
        "message": f"Earned {zwap_to_add:.2f} ZWAP + {zpts_to_add} zPts!"
    }

# ============ EDUCATION SPINE TRIVIA (SERVER-SIDE) ============

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

# Session store: {session_id: {questions: [...], expires: timestamp}}
_trivia_sessions = {}

@api_router.get("/games/trivia/questions")
async def get_trivia_questions(count: int = 5, difficulty: int = 1):
    """Get trivia questions from the education spine — server-side validated"""
    filtered = [q for q in EDUCATION_TRIVIA if q["difficulty"] <= difficulty + 1]
    selected = random.sample(filtered, min(count, len(filtered)))

    session_id = str(uuid.uuid4())
    _trivia_sessions[session_id] = {
        "questions": {q["id"]: q["answer"] for q in selected},
        "expires": _time.time() + 600,  # 10 min session
    }

    # Clean expired sessions
    now = _time.time()
    expired = [k for k, v in _trivia_sessions.items() if v["expires"] < now]
    for k in expired:
        del _trivia_sessions[k]

    return {
        "session_id": session_id,
        "questions": [
            {"id": q["id"], "question": q["question"], "options": q["options"],
             "difficulty": q["difficulty"], "module": q["module"]}
            for q in selected
        ]
    }

@api_router.post("/games/trivia/answer")
async def check_trivia_answer(answer: TriviaAnswer):
    """Check trivia answer — server-side validation"""
    # Look up answer in education spine
    question = next((q for q in EDUCATION_TRIVIA if q["id"] == answer.question_id), None)
    if not question:
        return {"correct": False, "correct_answer": None, "time_bonus": 0}

    correct = question["answer"] == answer.answer
    time_bonus = max(0, 1 - (answer.time_taken / 30)) if correct else 0

    return {
        "correct": correct,
        "correct_answer": question["answer"],
        "time_bonus": round(time_bonus, 2)
    }

@api_router.post("/faucet/scratch/{wallet_address}")
async def scratch_to_win(wallet_address: str):
    """Scratch card bonus"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    won = random.random() < 0.3
    amount = random.choice([5, 10, 25, 50, 100]) if won else 0
    
    if won:
        await db.users.update_one(
            {"wallet_address": wallet},
            {"$inc": {"zwap_balance": amount, "total_earned": amount}}
        )
    
    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    return {
        "won": won,
        "amount": amount,
        "new_balance": updated_user["zwap_balance"],
        "message": f"You won {amount} ZWAP!" if won else "Better luck next time!"
    }

# ============ Z POINTS CONVERSION ============

@api_router.post("/zpts/convert/{wallet_address}")
async def convert_zpts_to_zwap(wallet_address: str, convert_data: ConvertZPtsRequest):
    """Convert Z Points to ZWAP (1000 zPts = 1 ZWAP)"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("zpts_balance", 0) < convert_data.zpts_amount:
        raise HTTPException(status_code=400, detail="Insufficient Z Points")
    
    if convert_data.zpts_amount < ZPTS_TO_ZWAP_RATE:
        raise HTTPException(status_code=400, detail=f"Minimum {ZPTS_TO_ZWAP_RATE} zPts required")
    
    zwap_amount = convert_data.zpts_amount / ZPTS_TO_ZWAP_RATE
    
    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {"zpts_balance": -convert_data.zpts_amount, "zwap_balance": zwap_amount}
        }
    )
    
    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    return {
        "zpts_converted": convert_data.zpts_amount,
        "zwap_received": zwap_amount,
        "new_zpts_balance": updated_user["zpts_balance"],
        "new_zwap_balance": updated_user["zwap_balance"],
        "message": f"Converted {convert_data.zpts_amount} zPts to {zwap_amount} ZWAP!"
    }

# ============ SUBSCRIPTION ENDPOINTS ============

@api_router.post("/subscription/checkout")
async def create_subscription_checkout(request: Request, sub_request: SubscriptionRequest):
    """Create Stripe checkout session for Plus subscription"""
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{sub_request.origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{sub_request.origin_url}/subscription/cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=12.99,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"tier": "plus", "type": "subscription"}
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    await db.payment_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "amount": 12.99,
        "currency": "usd",
        "metadata": {"tier": "plus", "type": "subscription"},
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/subscription/status/{session_id}")
async def get_subscription_status(request: Request, session_id: str):
    """Check subscription payment status"""
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction record
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {"payment_status": status.payment_status, "status": status.status}}
    )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount": status.amount_total / 100,
        "currency": status.currency
    }

@api_router.post("/subscription/activate/{wallet_address}")
async def activate_subscription(wallet_address: str, session_id: str):
    """Activate Plus subscription after successful payment"""
    wallet = wallet_address.lower()
    
    # Check transaction
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.get("payment_status") != "paid":
        raise HTTPException(status_code=400, detail="Payment not completed")
    
    if transaction.get("activated"):
        raise HTTPException(status_code=400, detail="Already activated")
    
    # Update user tier
    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$set": {
                "tier": "plus",
                "subscription_id": session_id,
                "subscription_status": "active"
            }
        }
    )
    
    # Mark as activated
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {"activated": True, "wallet_address": wallet}}
    )
    
    return {"success": True, "tier": "plus", "message": "Plus subscription activated!"}

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction
        await db.payment_transactions.update_one(
            {"session_id": webhook_response.session_id},
            {"$set": {"payment_status": webhook_response.payment_status, "event_type": webhook_response.event_type}}
        )
        
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ============ SHOP ENDPOINTS ============

@api_router.get("/shop/items", response_model=List[ShopItem])
async def get_shop_items():
    """Get all shop items"""
    count = await db.shop_items.count_documents({})
    if count == 0:
        items = [
            {"id": str(uuid.uuid4()), "name": "ZWAP! Hoodie", "description": "Premium cotton hoodie with glowing ZWAP! logo", "price_zwap": 500, "price_zpts": 3000, "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", "category": "apparel", "in_stock": True, "plus_only": False},
            {"id": str(uuid.uuid4()), "name": "Crypto Cap", "description": "Adjustable cap with embroidered crypto symbols", "price_zwap": 200, "price_zpts": 1500, "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400", "category": "apparel", "in_stock": True, "plus_only": False},
            {"id": str(uuid.uuid4()), "name": "TLDR eBook", "description": "Self-Help Simplified™ digital guide", "price_zwap": 50, "price_zpts": 499, "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", "category": "ebooks", "in_stock": True, "plus_only": False},
            {"id": str(uuid.uuid4()), "name": "NFT Art Print", "description": "Limited edition digital art print", "price_zwap": 1000, "price_zpts": 5000, "image_url": "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=400", "category": "collectibles", "in_stock": True, "plus_only": False},
            {"id": str(uuid.uuid4()), "name": "Smartwatch Band", "description": "Premium wearable band for fitness tracking", "price_zwap": 800, "price_zpts": 5000, "image_url": "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400", "category": "tech", "in_stock": True, "plus_only": True},
            {"id": str(uuid.uuid4()), "name": "ZWAP! Sticker Pack", "description": "Set of 10 holographic stickers", "price_zwap": 30, "price_zpts": 250, "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "category": "accessories", "in_stock": True, "plus_only": False},
            {"id": str(uuid.uuid4()), "name": "Game Boost Pack", "description": "2x rewards for 24 hours", "price_zwap": 100, "price_zpts": 800, "image_url": "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400", "category": "boosts", "in_stock": True, "plus_only": False},
        ]
        await db.shop_items.insert_many(items)
    
    items = await db.shop_items.find({}, {"_id": 0}).to_list(100)
    return [ShopItem(**item) for item in items]

@api_router.post("/shop/purchase/{wallet_address}")
async def purchase_item(wallet_address: str, purchase: PurchaseRequest):
    """Purchase item with ZWAP or Z Points"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    item = await db.shop_items.find_one({"id": purchase.item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Check Plus-only items
    if item.get("plus_only") and user.get("tier") != "plus":
        raise HTTPException(status_code=403, detail="Plus subscription required")
    
    # Check balance and deduct
    if purchase.payment_type == "zpts":
        if not item.get("price_zpts"):
            raise HTTPException(status_code=400, detail="Item not available for Z Points")
        if user.get("zpts_balance", 0) < item["price_zpts"]:
            raise HTTPException(status_code=400, detail="Insufficient Z Points")
        await db.users.update_one(
            {"wallet_address": wallet},
            {"$inc": {"zpts_balance": -item["price_zpts"]}}
        )
        price_paid = item["price_zpts"]
        currency = "zpts"
    else:
        if user["zwap_balance"] < item["price_zwap"]:
            raise HTTPException(status_code=400, detail="Insufficient ZWAP balance")
        await db.users.update_one(
            {"wallet_address": wallet},
            {"$inc": {"zwap_balance": -item["price_zwap"]}}
        )
        price_paid = item["price_zwap"]
        currency = "zwap"
    
    # Record purchase
    await db.purchases.insert_one({
        "id": str(uuid.uuid4()),
        "user_wallet": wallet,
        "item_id": item["id"],
        "item_name": item["name"],
        "price": price_paid,
        "currency": currency,
        "purchased_at": datetime.now(timezone.utc).isoformat()
    })
    
    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    
    return {
        "success": True,
        "item": item["name"],
        "price": price_paid,
        "currency": currency,
        "new_zwap_balance": updated_user["zwap_balance"],
        "new_zpts_balance": updated_user.get("zpts_balance", 0),
        "message": f"Successfully purchased {item['name']}!"
    }

# ============ SWAP ENDPOINTS ============

@api_router.get("/swap/prices")
async def get_prices():
    return await get_crypto_prices()

@api_router.post("/swap/execute/{wallet_address}", response_model=SwapResponse)
async def execute_swap(wallet_address: str, swap: SwapRequest):
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    prices = await get_crypto_prices()
    from_price = prices.get(swap.from_token, 0)
    to_price = prices.get(swap.to_token, 0)
    
    if from_price == 0 or to_price == 0:
        raise HTTPException(status_code=400, detail="Invalid token pair")
    
    if swap.from_token == "ZWAP" and user["zwap_balance"] < swap.amount:
        raise HTTPException(status_code=400, detail="Insufficient ZWAP balance")
    
    from_value_usd = swap.amount * from_price
    fee = from_value_usd * 0.01
    net_value_usd = from_value_usd - fee
    to_amount = net_value_usd / to_price
    rate = from_price / to_price
    
    if swap.from_token == "ZWAP":
        await db.users.update_one({"wallet_address": wallet}, {"$inc": {"zwap_balance": -swap.amount}})
    elif swap.to_token == "ZWAP":
        await db.users.update_one({"wallet_address": wallet}, {"$inc": {"zwap_balance": to_amount}})
    
    swap_record = {
        "id": str(uuid.uuid4()),
        "user_wallet": wallet,
        "from_token": swap.from_token,
        "to_token": swap.to_token,
        "from_amount": swap.amount,
        "to_amount": to_amount,
        "rate": rate,
        "fee": fee,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.swaps.insert_one(swap_record)
    
    return SwapResponse(
        from_token=swap.from_token, to_token=swap.to_token, from_amount=swap.amount,
        to_amount=round(to_amount, 8), rate=round(rate, 8), fee=round(fee, 4),
        transaction_id=swap_record["id"]
    )

# ============ LEADERBOARD ============

class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    wallet: str
    value: int
    tier: str

class UserRankResponse(BaseModel):
    local_rank: int
    regional_rank: int
    global_rank: int
    category: str
    value: int

def generate_username(wallet: str) -> str:
    """Generate username from wallet address"""
    try:
        # Handle wallets with 0x prefix
        if wallet.startswith("0x"):
            hash_num = int(wallet[2:10], 16) % 9999
        else:
            # Fallback for non-standard addresses
            hash_num = sum(ord(c) for c in wallet[:8]) % 9999
        return f"Zwapper#{str(hash_num).zfill(4)}"
    except (ValueError, IndexError):
        return f"Zwapper#{str(abs(hash(wallet)) % 9999).zfill(4)}"

@api_router.get("/leaderboard/stats")
async def get_leaderboard_stats():
    """Get global stats for the ticker"""
    total_users = await db.users.count_documents({})
    
    # Top earner today (simplified - using total_earned)
    top_earner = await db.users.find_one({}, {"_id": 0, "wallet_address": 1, "total_earned": 1}, sort=[("total_earned", -1)])
    
    # Top gamer
    top_gamer = await db.users.find_one({}, {"_id": 0, "wallet_address": 1, "games_played": 1}, sort=[("games_played", -1)])
    
    # Top stepper
    top_stepper = await db.users.find_one({}, {"_id": 0, "wallet_address": 1, "total_steps": 1}, sort=[("total_steps", -1)])
    
    # Total ZWAP distributed
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_earned"}}}]
    total_earned_result = await db.users.aggregate(pipeline).to_list(1)
    total_zwap_distributed = total_earned_result[0]["total"] if total_earned_result else 0
    
    # Total steps walked
    steps_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_steps"}}}]
    total_steps_result = await db.users.aggregate(steps_pipeline).to_list(1)
    total_steps = total_steps_result[0]["total"] if total_steps_result else 0
    
    return {
        "total_users": total_users,
        "total_zwap_distributed": round(total_zwap_distributed, 2),
        "total_steps_walked": total_steps,
        "top_earner": {
            "username": generate_username(top_earner["wallet_address"]) if top_earner else "N/A",
            "value": top_earner.get("total_earned", 0) if top_earner else 0
        },
        "top_gamer": {
            "username": generate_username(top_gamer["wallet_address"]) if top_gamer else "N/A",
            "value": top_gamer.get("games_played", 0) if top_gamer else 0
        },
        "top_stepper": {
            "username": generate_username(top_stepper["wallet_address"]) if top_stepper else "N/A",
            "value": top_stepper.get("total_steps", 0) if top_stepper else 0
        }
    }

@api_router.get("/leaderboard/user/{wallet_address}/{category}")
async def get_user_rank(wallet_address: str, category: str):
    """Get user's rank in a specific category"""
    wallet = wallet_address.lower()
    
    if category == "steps":
        sort_field = "total_steps"
    elif category == "games":
        sort_field = "games_played"
    elif category == "earned":
        sort_field = "total_earned"
    elif category == "zpts":
        sort_field = "zpts_balance"
    else:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_value = user.get(sort_field, 0)
    
    # Count users with higher values for global rank
    global_rank = await db.users.count_documents({sort_field: {"$gt": user_value}}) + 1
    total_users = await db.users.count_documents({})
    
    # Simulate regional and local ranks (in production, would use geolocation)
    regional_rank = max(1, global_rank // 10)  # Simplified
    local_rank = max(1, global_rank // 50)  # Simplified
    
    return {
        "username": generate_username(wallet),
        "category": category,
        "value": user_value,
        "local_rank": local_rank,
        "regional_rank": regional_rank,
        "global_rank": global_rank,
        "total_users": total_users
    }

@api_router.get("/leaderboard/{category}")
async def get_leaderboard(category: str, limit: int = 10):
    """Get leaderboard by category"""
    if category == "steps":
        sort_field = "total_steps"
    elif category == "games":
        sort_field = "games_played"
    elif category == "earned":
        sort_field = "total_earned"
    elif category == "zpts":
        sort_field = "zpts_balance"
    else:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    users = await db.users.find({}, {"_id": 0, "wallet_address": 1, sort_field: 1, "tier": 1}).sort(sort_field, -1).limit(limit).to_list(limit)
    
    return [
        {
            "rank": i + 1,
            "username": generate_username(u['wallet_address']),
            "wallet": f"{u['wallet_address'][:6]}...{u['wallet_address'][-4:]}",
            "value": u.get(sort_field, 0),
            "tier": u.get("tier", "starter")
        }
        for i, u in enumerate(users)
    ]

# ============ HEALTH & ROOT ============

@api_router.get("/")
async def root():
    return {"message": "ZWAP! Coin API", "version": "2.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "service": "zwap-api"}

# Include admin routes
from admin_routes import admin_router
api_router.include_router(admin_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
