from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="ZWAP! Coin API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserCreate(BaseModel):
    wallet_address: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    wallet_address: str
    zwap_balance: float = 0.0
    total_steps: int = 0
    daily_steps: int = 0
    last_step_update: Optional[str] = None
    games_played: int = 0
    total_earned: float = 0.0
    created_at: str

class StepsUpdate(BaseModel):
    steps: int

class GameResult(BaseModel):
    score: int
    blocks_destroyed: int

class ScratchResult(BaseModel):
    won: bool
    amount: float

class ShopItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    price: float
    image_url: str
    category: str
    in_stock: bool = True

class PurchaseRequest(BaseModel):
    item_id: str

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

# ============ HELPER FUNCTIONS ============

async def get_crypto_prices():
    """Fetch real crypto prices from CoinGecko"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.coingecko.com/api/v3/simple/price",
                params={
                    "ids": "bitcoin,ethereum,matic-network,solana",
                    "vs_currency": "usd"
                },
                timeout=10.0
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "BTC": data.get("bitcoin", {}).get("usd", 65000),
                    "ETH": data.get("ethereum", {}).get("usd", 3500),
                    "POL": data.get("matic-network", {}).get("usd", 0.85),
                    "SOL": data.get("solana", {}).get("usd", 150),
                    "ZWAP": 0.025  # ZWAP fixed price
                }
    except Exception as e:
        logging.error(f"Error fetching prices: {e}")
    
    # Fallback prices
    return {
        "BTC": 65000,
        "ETH": 3500,
        "POL": 0.85,
        "SOL": 150,
        "ZWAP": 0.025
    }

def calculate_step_rewards(steps: int) -> float:
    """Tiered earning system for steps"""
    if steps < 1000:
        return steps * 0.01  # 0.01 ZWAP per step
    elif steps < 5000:
        return 10 + (steps - 1000) * 0.02  # 0.02 ZWAP per step after 1000
    elif steps < 10000:
        return 90 + (steps - 5000) * 0.03  # 0.03 ZWAP per step after 5000
    else:
        return 240 + (steps - 10000) * 0.05  # 0.05 ZWAP per step after 10000

def calculate_game_rewards(score: int, blocks: int) -> float:
    """Tiered earning system for games"""
    base_reward = blocks * 0.5  # 0.5 ZWAP per block
    if score > 1000:
        bonus = (score - 1000) * 0.01
    else:
        bonus = 0
    return min(base_reward + bonus, 500)  # Cap at 500 ZWAP per game

# ============ USER ENDPOINTS ============

@api_router.post("/users/connect", response_model=UserResponse)
async def connect_wallet(user_data: UserCreate):
    """Connect wallet and create/get user"""
    wallet = user_data.wallet_address.lower()
    
    # Check if user exists
    existing = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    
    if existing:
        return UserResponse(**existing)
    
    # Create new user
    new_user = {
        "id": str(uuid.uuid4()),
        "wallet_address": wallet,
        "zwap_balance": 100.0,  # Starting bonus
        "total_steps": 0,
        "daily_steps": 0,
        "last_step_update": None,
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

# ============ FAUCET ENDPOINTS (MOVE & PLAY) ============

@api_router.post("/faucet/steps/{wallet_address}")
async def claim_step_rewards(wallet_address: str, steps_data: StepsUpdate):
    """Claim ZWAP rewards for steps walked"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate rewards
    new_steps = steps_data.steps
    rewards = calculate_step_rewards(new_steps)
    
    # Update user
    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {
                "zwap_balance": rewards,
                "total_steps": new_steps,
                "total_earned": rewards
            },
            "$set": {
                "daily_steps": new_steps,
                "last_step_update": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    
    return {
        "steps_counted": new_steps,
        "rewards_earned": rewards,
        "new_balance": updated_user["zwap_balance"],
        "message": f"Earned {rewards:.2f} ZWAP for {new_steps} steps!"
    }

@api_router.post("/faucet/game/{wallet_address}")
async def claim_game_rewards(wallet_address: str, game_data: GameResult):
    """Claim ZWAP rewards for playing games"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate rewards
    rewards = calculate_game_rewards(game_data.score, game_data.blocks_destroyed)
    
    # Update user
    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {
                "zwap_balance": rewards,
                "games_played": 1,
                "total_earned": rewards
            }
        }
    )
    
    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    
    return {
        "score": game_data.score,
        "blocks_destroyed": game_data.blocks_destroyed,
        "rewards_earned": rewards,
        "new_balance": updated_user["zwap_balance"],
        "message": f"Earned {rewards:.2f} ZWAP!"
    }

@api_router.post("/faucet/scratch/{wallet_address}")
async def scratch_to_win(wallet_address: str):
    """Scratch card bonus game"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Random chance to win (30% chance)
    won = random.random() < 0.3
    amount = random.choice([5, 10, 25, 50, 100]) if won else 0
    
    if won:
        await db.users.update_one(
            {"wallet_address": wallet},
            {
                "$inc": {
                    "zwap_balance": amount,
                    "total_earned": amount
                }
            }
        )
    
    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    
    return {
        "won": won,
        "amount": amount,
        "new_balance": updated_user["zwap_balance"],
        "message": f"You won {amount} ZWAP!" if won else "Better luck next time!"
    }

# ============ SHOP ENDPOINTS ============

@api_router.get("/shop/items", response_model=List[ShopItem])
async def get_shop_items():
    """Get all shop items"""
    # Seed shop items if empty
    count = await db.shop_items.count_documents({})
    if count == 0:
        items = [
            {
                "id": str(uuid.uuid4()),
                "name": "ZWAP! Hoodie",
                "description": "Premium cotton hoodie with glowing ZWAP! logo",
                "price": 500,
                "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
                "category": "apparel",
                "in_stock": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Crypto Cap",
                "description": "Adjustable cap with embroidered crypto symbols",
                "price": 200,
                "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400",
                "category": "apparel",
                "in_stock": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "NFT Art Print",
                "description": "Limited edition digital art print",
                "price": 1000,
                "image_url": "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=400",
                "category": "collectibles",
                "in_stock": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Hardware Wallet Case",
                "description": "Protective case for your hardware wallet",
                "price": 150,
                "image_url": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
                "category": "accessories",
                "in_stock": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "ZWAP! Sticker Pack",
                "description": "Set of 10 holographic stickers",
                "price": 50,
                "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                "category": "accessories",
                "in_stock": True
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Crypto Coffee Mug",
                "description": "Heat-reactive mug reveals crypto prices",
                "price": 100,
                "image_url": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400",
                "category": "accessories",
                "in_stock": True
            }
        ]
        await db.shop_items.insert_many(items)
    
    items = await db.shop_items.find({}, {"_id": 0}).to_list(100)
    return [ShopItem(**item) for item in items]

@api_router.post("/shop/purchase/{wallet_address}")
async def purchase_item(wallet_address: str, purchase: PurchaseRequest):
    """Purchase an item from the shop"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    item = await db.shop_items.find_one({"id": purchase.item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if user["zwap_balance"] < item["price"]:
        raise HTTPException(status_code=400, detail="Insufficient ZWAP balance")
    
    # Deduct balance and record purchase
    await db.users.update_one(
        {"wallet_address": wallet},
        {"$inc": {"zwap_balance": -item["price"]}}
    )
    
    purchase_record = {
        "id": str(uuid.uuid4()),
        "user_wallet": wallet,
        "item_id": item["id"],
        "item_name": item["name"],
        "price": item["price"],
        "purchased_at": datetime.now(timezone.utc).isoformat()
    }
    await db.purchases.insert_one(purchase_record)
    
    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    
    return {
        "success": True,
        "item": item["name"],
        "price": item["price"],
        "new_balance": updated_user["zwap_balance"],
        "message": f"Successfully purchased {item['name']}!"
    }

# ============ SWAP ENDPOINTS ============

@api_router.get("/swap/prices")
async def get_prices():
    """Get current crypto prices"""
    prices = await get_crypto_prices()
    return prices

@api_router.post("/swap/execute/{wallet_address}", response_model=SwapResponse)
async def execute_swap(wallet_address: str, swap: SwapRequest):
    """Execute a token swap"""
    wallet = wallet_address.lower()
    user = await db.users.find_one({"wallet_address": wallet})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    prices = await get_crypto_prices()
    
    from_price = prices.get(swap.from_token, 0)
    to_price = prices.get(swap.to_token, 0)
    
    if from_price == 0 or to_price == 0:
        raise HTTPException(status_code=400, detail="Invalid token pair")
    
    # If selling ZWAP, check balance
    if swap.from_token == "ZWAP":
        if user["zwap_balance"] < swap.amount:
            raise HTTPException(status_code=400, detail="Insufficient ZWAP balance")
    
    # Calculate swap
    from_value_usd = swap.amount * from_price
    fee = from_value_usd * 0.01  # 1% fee
    net_value_usd = from_value_usd - fee
    to_amount = net_value_usd / to_price
    rate = from_price / to_price
    
    # Update balance if ZWAP involved
    if swap.from_token == "ZWAP":
        await db.users.update_one(
            {"wallet_address": wallet},
            {"$inc": {"zwap_balance": -swap.amount}}
        )
    elif swap.to_token == "ZWAP":
        await db.users.update_one(
            {"wallet_address": wallet},
            {"$inc": {"zwap_balance": to_amount}}
        )
    
    # Record swap
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
        from_token=swap.from_token,
        to_token=swap.to_token,
        from_amount=swap.amount,
        to_amount=round(to_amount, 8),
        rate=round(rate, 8),
        fee=round(fee, 4),
        transaction_id=swap_record["id"]
    )

# ============ HEALTH & ROOT ============

@api_router.get("/")
async def root():
    return {"message": "ZWAP! Coin API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "service": "zwap-api"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
