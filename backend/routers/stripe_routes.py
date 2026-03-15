from fastapi import APIRouter, Request
import stripe
import json

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
        success_url="http://localhost:3000/success",
        cancel_url="http://localhost:3000/cancel",
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

    return {"status": "received"}