from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timezone

wallet_router = APIRouter(prefix="/wallet", tags=["Conversion"])


class ConvertZPtsPayload(BaseModel):
    walletAddress: str
    zpts_amount: int


@wallet_router.post("/convert-zpts")
async def convert_zpts(request: Request, payload: ConvertZPtsPayload):
    db = request.app.state.db

    wallet = (payload.walletAddress or "").lower().strip()
    zpts_amount = int(payload.zpts_amount)

    if not wallet:
        raise HTTPException(status_code=400, detail="Missing walletAddress")

    if zpts_amount < 1000:
        raise HTTPException(status_code=400, detail="Minimum conversion is 1000 zPts")

    # 1000 zPts = 1 ZWAP
    zwap_delta = zpts_amount // 1000
    zpts_spent = zwap_delta * 1000

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if int(user.get("zpts_balance", 0)) < zpts_spent:
        raise HTTPException(status_code=400, detail="Insufficient zPts")

    result = await db.users.update_one(
        {
            "wallet_address": wallet,
            "zpts_balance": {"$gte": zpts_spent},
        },
        {
            "$inc": {
                "zpts_balance": -zpts_spent,
                "zwap_balance": zwap_delta,
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Conversion failed")

    await db.ledger.insert_one(
        {
            "type": "CONVERT_ZPTS_TO_ZWAP",
            "wallet_address": wallet,
            "zpts_delta": -zpts_spent,
            "zwap_delta": zwap_delta,
            "rate": 1000,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )

    user_after = await db.users.find_one({"wallet_address": wallet})

    return {
        "success": True,
        "zpts_after": user_after.get("zpts_balance", 0),
        "zwap_after": user_after.get("zwap_balance", 0),
        "zpts_spent": zpts_spent,
        "zwap_received": zwap_delta,
        "rate": 1000,
    }


router = wallet_router