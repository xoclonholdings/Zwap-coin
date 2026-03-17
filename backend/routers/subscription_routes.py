from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timezone
import os
import uuid
import logging
import stripe

subscription_router = APIRouter(tags=["Subscription"])


class SubscriptionRequest(BaseModel):
    wallet_address: str
    origin_url: str


@subscription_router.post("/subscription/checkout")
async def create_subscription_checkout(request: Request, sub_request: SubscriptionRequest):
    """Create Stripe checkout session for Plus subscription"""
    db = request.app.state.db
    stripe.api_key = os.environ.get("STRIPE_API_KEY")

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
                            "interval": "month",
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

        await db.payment_transactions.insert_one(
            {
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
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )

        return {"url": session.url, "session_id": session.id}

    except Exception as e:
        logging.error(f"Subscription checkout error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@subscription_router.get("/subscription/status/{session_id}")
async def get_subscription_status(session_id: str, request: Request):
    """Check subscription payment status directly from Stripe"""
    db = request.app.state.db
    stripe.api_key = os.environ.get("STRIPE_API_KEY")

    try:
        session = stripe.checkout.Session.retrieve(session_id)

        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "payment_status": session.payment_status,
                    "status": session.status,
                }
            },
        )

        return {
            "status": session.status,
            "payment_status": session.payment_status,
            "amount": (session.amount_total / 100) if session.amount_total else 0,
            "currency": session.currency,
        }

    except Exception as e:
        logging.error(f"Subscription status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@subscription_router.post("/subscription/activate/{wallet_address}")
async def activate_subscription(wallet_address: str, session_id: str, request: Request):
    """Activate Plus subscription after successful payment"""
    db = request.app.state.db
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
            "message": "Plus subscription already active",
        }

    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$set": {
                "tier": "plus",
                "subscription_id": session_id,
                "subscription_status": "active",
            }
        },
    )

    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "activated": True,
                "wallet_address": wallet,
            }
        },
    )

    await db.user_inventory.update_one(
        {
            "user_wallet": wallet,
            "item_id": "plus_subscription",
        },
        {
            "$set": {
                "item_name": "Plus",
                "granted_at": datetime.now(timezone.utc).isoformat(),
                "source": "stripe",
                "active": True,
            }
        },
        upsert=True,
    )

    return {
        "success": True,
        "tier": "plus",
        "message": "Plus subscription activated!",
    }


@subscription_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    db = request.app.state.db
    stripe.api_key = os.environ.get("STRIPE_API_KEY")

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
                        "event_type": event_type,
                    }
                },
            )

        return {"status": "success"}

    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}


# Export canonical name expected by server.py
router = subscription_router