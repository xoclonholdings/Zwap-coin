from datetime import datetime, timezone
import json
import os

from fastapi import APIRouter, HTTPException, Request
import stripe

router = APIRouter()

stripe.api_key = os.environ.get("STRIPE_API_KEY")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_origin_url(body: dict) -> str:
    return body.get("origin_url") or "http://localhost:3000"


@router.post("/stripe/create-checkout")
async def create_checkout_session(request: Request):
    body = await request.json()

    db = request.app.state.db
    wallet_address = (body.get("wallet_address") or "").lower().strip()
    item_id = str(body.get("item_id") or "").strip()
    origin_url = get_origin_url(body)

    if not wallet_address:
        raise HTTPException(status_code=400, detail="wallet_address is required")

    if not item_id:
        raise HTTPException(status_code=400, detail="item_id is required")

    item = await db.shop_items.find_one(
        {
            "id": item_id,
            "active": {"$ne": False},
            "in_stock": {"$ne": False},
        },
        {"_id": 0},
    )

    if not item:
        raise HTTPException(status_code=404, detail="Shop item not found")

    if item.get("payment_method") != "stripe":
        raise HTTPException(status_code=400, detail="Item is not available through Stripe")

    price = item.get("price_stripe")

    if price is None:
        raise HTTPException(status_code=400, detail="Item Stripe price is missing")

    try:
        unit_amount = int(round(float(price) * 100))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Stripe price")

    if unit_amount <= 0:
        raise HTTPException(status_code=400, detail="Stripe price must be greater than zero")

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": item.get("name", "ZWAP! Shop Item"),
                    },
                    "unit_amount": unit_amount,
                },
                "quantity": 1,
            }
        ],
        mode="payment",
        success_url=f"{origin_url}/success?payment=success&item={item_id}",
        cancel_url=f"{origin_url}/cancel?payment=cancel",
        metadata={
            "wallet_address": wallet_address,
            "item_id": item_id,
            "purchase_type": "shop_item",
        },
    )

    await db.payment_transactions.insert_one(
        {
            "id": session.id,
            "session_id": session.id,
            "wallet_address": wallet_address,
            "item_id": item_id,
            "amount": unit_amount / 100,
            "currency": "usd",
            "payment_status": "pending",
            "type": "shop_item",
            "created_at": utc_now_iso(),
        }
    )

    return {"url": session.url}


@router.post("/stripe/create-subscription-checkout")
async def create_subscription_checkout(request: Request):
    body = await request.json()

    db = request.app.state.db
    wallet_address = (body.get("wallet_address") or "").lower().strip()
    origin_url = get_origin_url(body)

    if not wallet_address:
        raise HTTPException(status_code=400, detail="wallet_address is required")

    zitizen_price_id = os.environ.get("STRIPE_ZITIZEN_PRICE_ID") or os.environ.get(
        "STRIPE_PLUS_PRICE_ID"
    )

    if zitizen_price_id:
        line_items = [{"price": zitizen_price_id, "quantity": 1}]
    else:
        line_items = [
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "ZWAP! Zitizen Subscription",
                    },
                    "unit_amount": 999,
                    "recurring": {"interval": "month"},
                },
                "quantity": 1,
            }
        ]

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="subscription",
        line_items=line_items,
        success_url=f"{origin_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{origin_url}/subscription/cancel",
        metadata={
            "wallet_address": wallet_address,
            "purchase_type": "subscription_zitizen",
        },
    )

    await db.payment_transactions.insert_one(
        {
            "id": session.id,
            "session_id": session.id,
            "wallet_address": wallet_address,
            "amount": 9.99,
            "currency": "usd",
            "payment_status": "pending",
            "type": "subscription_zitizen",
            "created_at": utc_now_iso(),
        }
    )

    return {"url": session.url}


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    db = request.app.state.db

    try:
        event = json.loads(payload.decode("utf-8"))
    except Exception as error:
        return {"status": "error", "message": f"Invalid payload: {str(error)}"}

    event_type = event.get("type")
    event_data = event.get("data", {}).get("object", {})

    if event_type != "checkout.session.completed":
        return {"status": "received"}

    session = event_data
    metadata = session.get("metadata", {}) or {}

    wallet_address = (metadata.get("wallet_address") or "").lower().strip()
    item_id = metadata.get("item_id")
    purchase_type = metadata.get("purchase_type")
    session_id = session.get("id")

    amount_paid = (session.get("amount_total") or 0) / 100
    currency = session.get("currency", "usd")
    now_iso = utc_now_iso()

    if not wallet_address or not session_id:
        return {"status": "received"}

    if purchase_type == "shop_item" and item_id:
        item = await db.shop_items.find_one(
            {"id": item_id},
            {"_id": 0},
        )

        if item:
            existing_purchase = await db.purchases.find_one(
                {"stripe_session_id": session_id}
            )

            if not existing_purchase:
                await db.purchases.insert_one(
                    {
                        "id": session_id,
                        "user_wallet": wallet_address,
                        "item_id": item_id,
                        "item_name": item.get("name", "Item"),
                        "price": amount_paid,
                        "currency": currency,
                        "payment_provider": "stripe",
                        "purchased_at": now_iso,
                        "stripe_session_id": session_id,
                        "payment_status": "paid",
                    }
                )

            existing_inventory = await db.user_inventory.find_one(
                {
                    "user_wallet": wallet_address,
                    "item_id": item_id,
                    "stripe_session_id": session_id,
                }
            )

            if not existing_inventory:
                await db.user_inventory.insert_one(
                    {
                        "id": session_id,
                        "user_wallet": wallet_address,
                        "item_id": item_id,
                        "item_name": item.get("name", "Item"),
                        "category": item.get("category", "general"),
                        "fulfillment_type": item.get("fulfillment_type", "none"),
                        "download_url": item.get("download_url"),
                        "external_url": item.get("external_url"),
                        "granted_at": now_iso,
                        "source": "stripe",
                        "stripe_session_id": session_id,
                        "active": True,
                    }
                )

        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "payment_status": "paid",
                    "updated_at": now_iso,
                }
            },
        )

    if purchase_type in {"subscription_zitizen", "subscription_plus"}:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "payment_status": "paid",
                    "wallet_address": wallet_address,
                    "updated_at": now_iso,
                }
            },
        )

        await db.users.update_one(
            {"wallet_address": wallet_address},
            {
                "$set": {
                    "tier": "plus",
                    "subscription_status": "active",
                    "tier_updated_at": now_iso,
                    "stripe_session_id": session_id,
                }
            },
        )

        existing_zitizen = await db.user_inventory.find_one(
            {
                "user_wallet": wallet_address,
                "item_id": "zitizen_subscription",
                "active": True,
            }
        )

        if not existing_zitizen:
            await db.user_inventory.insert_one(
                {
                    "id": session_id,
                    "user_wallet": wallet_address,
                    "item_id": "zitizen_subscription",
                    "item_name": "Zitizen",
                    "granted_at": now_iso,
                    "source": "stripe",
                    "stripe_session_id": session_id,
                    "active": True,
                }
            )

    return {"status": "received"}