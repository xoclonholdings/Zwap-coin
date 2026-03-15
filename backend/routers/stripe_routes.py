from fastapi import APIRouter
import stripe

router = APIRouter()

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