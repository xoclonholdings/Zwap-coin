from fastapi import APIRouter, Request, HTTPException
import stripe
import json
import os
from datetime import datetime, timezone

router = APIRouter()

# Make sure your Stripe secret key is set in env
stripe.api_key = os.environ.get("STRIPE_API_KEY")


# ===========================
# CREATE SHOP CHECKOUT SESSION
# ===========================
@router.post("/stripe/create-checkout")
async def create_checkout_session(request: Request):
    body = await request.json()

    wallet_address = (body.get("wallet_address") or "").lower()
    item_id = body.get("item_id")
    purchase_type = body.get("purchase_type", "shop_item")
    origin_url = body.get("origin_url") or "http://localhost:3000"

    if not item_id:
        raise HTTPException(status_code=400, detail="item_id is required")

    db = request.app.state.db
    item = await db.shop_items.find_one({
        "$or": [
            {"id": item_id},
            {"_id": item_id},
        ]
    })

    if not item:
        raise HTTPException(status_code=404, detail="Shop item not found")

    resolved_item_id = item.get("id") or str(item.get("_id"))

    # Stripe checkout should only be used for stripe-priced items
    payment_method = item.get("payment_method")
    if payment_method and payment_method != "stripe":
        raise HTTPException(
            status_code=400,
            detail=f"Item is not purchasable with Stripe (payment_method={payment_method})"
        )

    # Stripe-priced items should use price_stripe
    price = item.get("price_stripe")
    if price is None:
        raise HTTPException(status_code=400, detail="Item Stripe price is missing")

    try:
        unit_amount = int(float(price) * 100)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Stripe price")

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": item.get("name", "ZWAP Purchase"),
                    },
                    "unit_amount": unit_amount,
                },
                "quantity": 1,
            }
        ],
        mode="payment",
        success_url=f"{origin_url}/success?payment=success",
        cancel_url=f"{origin_url}/cancel?payment=cancel",
        metadata={
            "wallet_address": wallet_address,
            "item_id": resolved_item_id,
            "purchase_type": purchase_type,
        },
    )

    return {"url": session.url}


# ===========================
# CREATE PLUS SUBSCRIPTION CHECKOUT SESSION
# ===========================
@router.post("/stripe/create-subscription-checkout")
async def create_subscription_checkout(request: Request):
    body = await request.json()

    wallet_address = (body.get("wallet_address") or "").lower()
    origin_url = body.get("origin_url") or "http://localhost:3000"

    if not wallet_address:
        raise HTTPException(status_code=400, detail="wallet_address is required")

    plus_price_id = os.environ.get("STRIPE_PLUS_PRICE_ID")

    if plus_price_id:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[
                {
                    "price": plus_price_id,
                    "quantity": 1,
                }
            ],
            success_url=f"{origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{origin_url}/subscription/cancel",
            metadata={
                "wallet_address": wallet_address,
                "purchase_type": "subscription_plus",
            },
        )
    else:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": "ZWAP Plus Subscription",
                        },
                        "unit_amount": 999,
                        "recurring": {"interval": "month"},
                    },
                    "quantity": 1,
                }
            ],
            success_url=f"{origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{origin_url}/subscription/cancel",
            metadata={
                "wallet_address": wallet_address,
                "purchase_type": "subscription_plus",
            },
        )

    return {"url": session.url}


# ===========================
# STRIPE WEBHOOK
# ===========================
@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    db = request.app.state.db

    try:
        event = json.loads(payload.decode("utf-8"))
    except Exception as e:
        return {"status": "error", "message": f"Invalid payload: {str(e)}"}

    try:
        event_type = event.get("type")
        event_data = event.get("data", {}).get("object", {})
    except Exception as e:
        return {"status": "error", "message": f"Malformed event: {str(e)}"}

    if event_type == "checkout.session.completed":
        session = event_data

        metadata = session.get("metadata", {}) or {}
        wallet_address = (metadata.get("wallet_address") or "").lower()
        item_id = metadata.get("item_id")
        purchase_type = metadata.get("purchase_type")

        session_id = session.get("id")
        amount_paid = (session.get("amount_total") or 0) / 100
        currency = session.get("currency", "usd")

        print("Payment completed:", session_id)
        print("Wallet:", wallet_address)
        print("Item ID:", item_id)
        print("Purchase Type:", purchase_type)

        # -----------------------------------
        # SHOP ITEM PURCHASE HANDLER
        # -----------------------------------
        if purchase_type == "shop_item" and wallet_address and item_id:
            item = await db.shop_items.find_one({
                "$or": [
                    {"id": item_id},
                    {"_id": item_id},
                ]
            })

            if item:
                resolved_item_id = item.get("id") or str(item.get("_id"))

                existing_purchase = await db.purchases.find_one({
                    "stripe_session_id": session_id
                })
                if not existing_purchase:
                    await db.purchases.insert_one({
                        "id": session_id,
                        "user_wallet": wallet_address,
                        "item_id": resolved_item_id,
                        "item_name": item.get("name", "Item"),
                        "price": amount_paid,
                        "currency": currency,
                        "payment_provider": "stripe",
                        "purchased_at": datetime.now(timezone.utc).isoformat(),
                        "stripe_session_id": session_id,
                        "payment_status": "paid",
                    })

                existing_inventory = await db.user_inventory.find_one({
                    "user_wallet": wallet_address,
                    "item_id": resolved_item_id,
                    "stripe_session_id": session_id,
                })

                if not existing_inventory:
                    await db.user_inventory.insert_one({
                        "user_wallet": wallet_address,
                        "item_id": resolved_item_id,
                        "item_name": item.get("name", "Item"),
                        "granted_at": datetime.now(timezone.utc).isoformat(),
                        "source": "stripe",
                        "stripe_session_id": session_id,
                        "active": True,
                    })

        # -----------------------------------
        # PLUS SUBSCRIPTION HANDLER
        # -----------------------------------
        if purchase_type == "subscription_plus" and wallet_address:
            await db.users.update_one(
                {"wallet_address": wallet_address},
                {
                    "$set": {
                        "tier": "plus",
                        "subscription_status": "active",
                        "tier_updated_at": datetime.now(timezone.utc).isoformat(),
                        "stripe_session_id": session_id,
                    }
                }
            )

    return {"status": "received"}