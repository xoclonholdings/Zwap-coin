from fastapi import APIRouter, Request
import stripe
import json
from datetime import datetime, timezone

router = APIRouter()


# ===========================
# CREATE CHECKOUT SESSION
# ===========================
@router.post("/stripe/create-checkout")
async def create_checkout_session(request: Request):
    body = await request.json()

    wallet_address = body.get("wallet_address")
    item_id = body.get("item_id")
    purchase_type = body.get("purchase_type", "shop_item")

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "ZWAP Purchase"
                    },
                    "unit_amount": 500,
                },
                "quantity": 1
            }
        ],
        mode="payment",
        success_url="http://localhost:3000/shop?payment=success",
        cancel_url="http://localhost:3000/shop?payment=cancel",
        metadata={
            "wallet_address": wallet_address or "",
            "item_id": item_id or "",
            "purchase_type": purchase_type,
        }
    )

    return {"url": session.url}


# ===========================
# STRIPE WEBHOOK
# ===========================
@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()

    try:
        event = stripe.Event.construct_from(
            json.loads(payload), stripe.api_key
        )
    except Exception as e:
        return {"status": "error", "message": str(e)}

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]

        wallet_address = session.get("metadata", {}).get("wallet_address")
        item_id = session.get("metadata", {}).get("item_id")
        purchase_type = session.get("metadata", {}).get("purchase_type")

        print("Payment completed:", session["id"])
        print("Wallet:", wallet_address)
        print("Item ID:", item_id)
        print("Purchase Type:", purchase_type)

        if purchase_type == "shop_item" and wallet_address and item_id:
            db = request.app.state.db

            item = await db.shop_items.find_one({"id": item_id})
            if item:
                amount_paid = (session.get("amount_total") or 0) / 100

                await db.purchases.insert_one({
                    "id": session["id"],
                    "user_wallet": wallet_address,
                    "item_id": item_id,
                    "item_name": item.get("name", "Item"),
                    "price": amount_paid,
                    "currency": "usd",
                    "payment_provider": "stripe",
                    "purchased_at": datetime.now(timezone.utc).isoformat(),
                    "stripe_session_id": session["id"],
                    "payment_status": "paid",
                })
                
                await db.user_inventory.insert_one({
                    "user_wallet": wallet_address,
                    "item_id": item_id,
                    "item_name": item.get("name", "Item"),
                    "granted_at": datetime.now(timezone.utc).isoformat(),
                    "source": "stripe",
                    "stripe_session_id": session["id"],
                    "active": True,
                })

    return {"status": "received"}