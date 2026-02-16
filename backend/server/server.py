# server.server.py

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.responses import FileResponse

# ===========================
# ENVIRONMENT VARIABLES
# ===========================
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

STRIPE_API_KEY = os.environ["STRIPE_API_KEY"]
POLYGON_RPC_URL = os.environ.get("POLYGON_RPC_URL", "")
ADMIN_API_KEY = os.environ["ADMIN_API_KEY"]
TREASURY_WALLET = os.environ.get("TREASURY_WALLET", "")

ZPTS_TO_ZWAP_RATE = int(os.environ.get("ZPTS_TO_ZWAP_RATE", 1000))
FEE_RATE = float(os.environ.get("FEE_RATE", 0.01))
SUBSCRIPTION_AMOUNT = float(os.environ.get("SUBSCRIPTION_AMOUNT", 12.99))
SUBSCRIPTION_CURRENCY = os.environ.get("SUBSCRIPTION_CURRENCY", "usd")

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

# ===========================
# DATABASE (MongoDB) SETUP
# ===========================
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ===========================
# FASTAPI APP
# ===========================
app = FastAPI(title="ZWAP! API", version="2.0.0")
api_router = APIRouter(prefix="/api")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/favicon.ico")

# ===========================
# MIDDLEWARE
# ===========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s - %(levelname)s - %(message)s")

# ===========================
# ROUTERS (must match your actual folder: routers/)
# Keep /api prefix behavior identical to original server.py
# ===========================
from routers.admin_routes import router as admin_router
from routers.swap_routes import router as swap_router
from routers.shop_routes import router as shop_router
from routers.play_routes import router as play_router
from routers.move_routes import router as move_router
from routers.user_routes import router as user_router
from routers.learn_routes import router as learn_router
from routers.leaderboard_routes import router as leaderboard_router
from routers.news_routes import router as news_router
from routers.subscription_routes import router as subscription_router

# Core feature routers
api_router.include_router(admin_router)        # already /admin inside file
api_router.include_router(user_router)         # should define its own prefix, e.g. /users
api_router.include_router(move_router)         # e.g. /move or /faucet
api_router.include_router(play_router)         # e.g. /games
api_router.include_router(shop_router)         # e.g. /shop
api_router.include_router(swap_router)         # e.g. /swap
api_router.include_router(learn_router)        # e.g. /learn

# Restored routers (were imported but not mounted)
api_router.include_router(leaderboard_router)  # e.g. /leaderboard
api_router.include_router(news_router)         # e.g. /news
api_router.include_router(subscription_router) # e.g. /subscription

@api_router.get("/health")
async def api_health():
    return {"status": "healthy", "service": "zwap-api"}

app.include_router(api_router)

# ===========================
# ROOT & HEALTH
# ===========================
@app.get("/")
async def root():
    return {"message": "ZWAP! API", "version": app.version}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "zwap-api"}


# ===========================
# SHUTDOWN
# ===========================
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
