# server.py
import os
import logging
import uuid
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

# ===== Environment Variables =====
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ.get("DB_NAME", "zwap_db")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

STRIPE_API_KEY = os.environ["STRIPE_API_KEY"]
POLYGON_RPC_URL = os.environ["POLYGON_RPC_URL"]
ADMIN_API_KEY = os.environ["ADMIN_API_KEY"]
TREASURY_WALLET = os.environ["TREASURY_WALLET"]

# Newly added variables
ZPTS_TO_ZWAP_RATE = int(os.environ.get("ZPTS_TO_ZWAP_RATE", 1000))
FEE_RATE = float(os.environ.get("FEE_RATE", 0.01))
SUBSCRIPTION_AMOUNT = float(os.environ.get("SUBSCRIPTION_AMOUNT", 12.99))
SUBSCRIPTION_CURRENCY = os.environ.get("SUBSCRIPTION_CURRENCY", "usd")

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")

# ===== FastAPI App & Database =====
app = FastAPI(title="ZWAP! API", version="2.0.0")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ===== Middleware =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Logging =====
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s - %(levelname)s - %(message)s")

# ===== Routers (Modular) =====
from routes.admin_routes import admin_router
from routes.shop_routes import shop_router
from routes.swap_routes import swap_router
from routes.play_routes import play_router
from routes.user_routes import user_router
from routes.learn_routes import learn_router
from routes.move_routes import move_router

# Include routers
app.include_router(admin_router, prefix="/api/admin")
app.include_router(shop_router, prefix="/api/shop")
app.include_router(swap_router, prefix="/api/swap")
app.include_router(play_router, prefix="/api/play")
app.include_router(user_router, prefix="/api/user")
app.include_router(learn_router, prefix="/api/learn")
app.include_router(move_router, prefix="/api/move")

# ===== Root & Health =====
@app.get("/")
async def root():
    return {"message": "ZWAP! API", "version": app.version}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "zwap-api"}

# ===== Shutdown Event =====
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
