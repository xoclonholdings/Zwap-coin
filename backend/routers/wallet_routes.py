from fastapi import APIRouter, HTTPException, Request
from datetime import datetime

wallet_router = APIRouter(prefix="/wallet", tags=["Wallet"])

# Export canonical name expected by server.py
router = wallet_router


@wallet_router.post("/convert-zpts")
async def convert_zpts(request: Request, payload: dict):
    db = request.app.state.db

    wallet = payload.get("walletAddress")
    zpts_amount = int(payload.get("zpts_amount", 0))

    if not wallet:
        raise HTTPException(status_code=400, detail="Missing walletAddress")

    if zpts_amount < 1000:
        raise HTTPException(status_code=400, detail="Minimum conversion is 1000 zPts")

    # integer math only
    zwap_delta = zpts_amount // 1000
    zpts_spent = zwap_delta * 1000

    user = await db.users.find_one({"walletAddress": wallet})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("zpts_balance", 0) < zpts_spent:
        raise HTTPException(status_code=400, detail="Insufficient zPts")

    result = await db.users.update_one(
        {
            "walletAddress": wallet,
            "zpts_balance": {"$gte": zpts_spent}
        },
        {
            "$inc": {
                "zpts_balance": -zpts_spent,
                "zwap_balance": zwap_delta
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Conversion failed")

    await db.ledger.insert_one({
        "type": "CONVERT_ZPTS_TO_ZWAP",
        "walletAddress": wallet,
        "zpts_delta": -zpts_spent,
        "zwap_delta": zwap_delta,
        "rate": 1000,
        "created_at": datetime.utcnow()
    })

    user_after = await db.users.find_one({"walletAddress": wallet})

    return {
        "zpts_after": user_after["zpts_balance"],
        "zwap_after": user_after["zwap_balance"],
        "rate": 1000
    }