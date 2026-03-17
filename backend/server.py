from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
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

# ============ MODELS ============





class SubscriptionRequest(BaseModel):
    wallet_address: str
    origin_url: str

    
# ============ SUBSCRIPTION ENDPOINTS ============

@api_router.post("/subscription/checkout")
async def create_subscription_checkout(request: Request, sub_request: SubscriptionRequest):
    """Create Stripe checkout session for Plus subscription"""
    print("HIT server.py subscription/checkout")
    import stripe

    stripe.api_key = STRIPE_API_KEY

    success_url = f"{sub_request.origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{sub_request.origin_url}/subscription/cancel"

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": "ZWAP Plus Subscription",
                        },
                        "unit_amount": 999,
                        "recurring": {
                            "interval": "month"
                        },
                    },
                    "quantity": 1,
                }
            ],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "tier": "plus",
                "type": "subscription",
                "wallet_address": sub_request.wallet_address,
            },
        )

        await db.payment_transactions.insert_one({
            "id": str(uuid.uuid4()),
            "session_id": session.id,
            "amount": 9.99,
            "currency": "usd",
            "metadata": {
                "tier": "plus",
                "type": "subscription",
                "wallet_address": sub_request.wallet_address,
            },
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        return {"url": session.url, "session_id": session.id}

    except Exception as e:
        logging.error(f"Subscription checkout error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/subscription/status/{session_id}")
async def get_subscription_status(session_id: str):
    """Check subscription payment status directly from Stripe"""
    import stripe

    stripe.api_key = STRIPE_API_KEY

    try:
        session = stripe.checkout.Session.retrieve(session_id)

        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "payment_status": session.payment_status,
                    "status": session.status
                }
            }
        )

        return {
            "status": session.status,
            "payment_status": session.payment_status,
            "amount": (session.amount_total / 100) if session.amount_total else 0,
            "currency": session.currency
        }

    except Exception as e:
        logging.error(f"Subscription status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/subscription/activate/{wallet_address}")
async def activate_subscription(wallet_address: str, session_id: str):
    """Activate Plus subscription after successful payment"""
    wallet = wallet_address.lower()

    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.get("payment_status") != "paid":
        raise HTTPException(status_code=400, detail="Payment not completed")

    if transaction.get("activated"):
        return {
        "success": True,
        "tier": "plus",
        "message": "Plus subscription already active"
    }
    
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

    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "activated": True,
                "wallet_address": wallet
            }
        }
    )
    

    await db.user_inventory.update_one(
        {
            "user_wallet": wallet,
            "item_id": "plus_subscription"
        },
        {
            "$set": {
                "item_name": "Plus",
                "granted_at": datetime.now(timezone.utc).isoformat(),
                "source": "stripe",
                "active": True
            }
        },
        upsert=True
    )
    
    return {
        "success": True,
        "tier": "plus",
        "message": "Plus subscription activated!"
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    import stripe

    stripe.api_key = STRIPE_API_KEY

    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(body, signature, webhook_secret)
        else:
            event = stripe.Event.construct_from(await request.json(), stripe.api_key)

        event_type = event["type"]
        event_data = event["data"]["object"]

        if event_type == "checkout.session.completed":
            session_id = event_data.get("id")
            payment_status = event_data.get("payment_status", "paid")

            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "payment_status": payment_status,
                        "status": "complete",
                        "event_type": event_type
                    }
                }
            )

        return {"status": "success"}

    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}
        
    
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