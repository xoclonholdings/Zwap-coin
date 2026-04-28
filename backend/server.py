from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from web3 import Web3

import routers.wallet_routes as wallet_routes
from routers import auth_routes
from routers import blockchain_routes
from routers import stripe_routes
from routers import move_routes
from routers import play_routes
from routers import shop_routes
from routers import learn_routes
from routers import user_routes
from routers import rewards_routes
from routers import activity_routes
from admin_routes import admin_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

print("CONNECTED DB:", db.name)

STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

app = FastAPI(title="ZWAP! V1 API")
api_router = APIRouter(prefix="/api")


@app.get("/")
async def app_root():
    return {
        "name": "ZWAP! V1 API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


ZWAP_CONTRACT_ADDRESS = "0xe8898453af13b9496a6e8ada92c6efdaf4967a81"

POLYGON_RPC_URL = os.environ.get("POLYGON_RPC_URL", "https://polygon-rpc.com")
w3 = Web3(Web3.HTTPProvider(POLYGON_RPC_URL))

ERC20_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function",
    },
]

zwap_contract = None

if w3.is_connected():
    zwap_contract = w3.eth.contract(
        address=Web3.to_checksum_address(ZWAP_CONTRACT_ADDRESS),
        abi=ERC20_ABI,
    )
    logging.info("Connected to Polygon. ZWAP! contract loaded.")
else:
    logging.warning("Polygon RPC not connected. ZWAP! contract not loaded.")

app.state.db = db
app.state.w3 = w3
app.state.zwap_contract = zwap_contract
app.state.stripe_api_key = STRIPE_API_KEY


@api_router.get("/")
async def root():
    return {"message": "ZWAP! V1 API", "version": "1.0.0"}


@api_router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "zwap-v1-api",
        "db_name": db.name,
        "polygon_connected": w3.is_connected(),
    }


api_router.include_router(wallet_routes.router)
api_router.include_router(auth_routes.router)
api_router.include_router(blockchain_routes.router)
api_router.include_router(move_routes.router)
api_router.include_router(play_routes.router)
api_router.include_router(shop_routes.router)
api_router.include_router(learn_routes.router)
api_router.include_router(user_routes.router)
api_router.include_router(rewards_routes.router)
api_router.include_router(stripe_routes.router)
api_router.include_router(activity_routes.router)
api_router.include_router(admin_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_app():
    client.close()
    logging.info("MongoDB client closed")