from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from web3 import Web3
import routers.wallet_routes as wallet_routes
import stripe
from routers import stripe_routes
from routers import move_routes
from routers import play_routes
from routers import shop_routes
from routers import swap_routes
from routers import subscription_routes
from services import reward_service
from routers import leaderboard_routes
from routers import learn_routes
from routers.admin_routes import admin_router
from routers import user_routes


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
print("CONNECTED DB:", db.name)
print("MONGO URL:", mongo_url)

# Stripe
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
stripe.api_key = STRIPE_API_KEY

# Create the main app
app = FastAPI(title="ZWAP! API")
api_router = APIRouter(prefix="/api")

# ============ CONSTANTS ============
# ============ ZWAP CONTRACT CONFIG ============
ZWAP_CONTRACT_ADDRESS = "0xe8898453af13b9496a6e8ada92c6efdaf4967a81"
ZWAP_CHAIN_ID = 137  # Polygon
ZWAP_DECIMALS = 18

# Treasury wallet (to be set)
TREASURY_WALLET = os.environ.get("TREASURY_WALLET", "")

# Web3 Setup for Polygon
POLYGON_RPC_URL = os.environ.get("POLYGON_RPC_URL", "https://polygon-rpc.com")

w3 = Web3(Web3.HTTPProvider(POLYGON_RPC_URL))

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
    },
    
    {
    "constant": False,
    "inputs": [
        {"name": "_to", "type": "address"},
        {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
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

# Expose shared objects for router/service access
app.state.db = db
app.state.w3 = w3
app.state.zwap_contract = zwap_contract
app.state.treasury_wallet = "0x102a5301c56cFCf4F02bEA3184Bdb44b731375E0"
app.state.treasury_private_key = os.environ.get("TREASURY_PRIVATE_KEY", "")

    
# ============ SUBSCRIPTION ENDPOINTS ============



    
# ============ HEALTH & ROOT ============

@api_router.get("/")
async def root():
    return {"message": "ZWAP! Coin API", "version": "2.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "service": "zwap-api"}

# Include admin + wallet routes before mounting api_router on app
api_router.include_router(admin_router)
api_router.include_router(wallet_routes.router)
api_router.include_router(move_routes.router)
api_router.include_router(play_routes.router)
api_router.include_router(shop_routes.router)
api_router.include_router(swap_routes.router)
api_router.include_router(subscription_routes.router)
api_router.include_router(leaderboard_routes.router)
api_router.include_router(learn_routes.router)
api_router.include_router(user_routes.router)

app.include_router(api_router)
app.include_router(stripe_routes.router)

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