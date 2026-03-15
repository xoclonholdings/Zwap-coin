from fastapi import APIRouter, Request
import stripe
import json

router = APIRouter()


# ===========================
# CREATE CHECKOUT SESSION
# ===========================
@router.post("/stripe/create-checkout")
async def create_checkout_session():

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
        cancel_url="http://localhost:3000/cancel"
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
        print("Payment completed:", session["id"])

    return {"status": "received"}