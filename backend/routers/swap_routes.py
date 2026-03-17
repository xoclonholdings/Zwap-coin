from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from services import reward_service

swap_router = APIRouter(tags=["Swap"])


class ConvertZPtsRequest(BaseModel):
    zpts_amount: int


@swap_router.post("/zpts/convert/{wallet_address}")
async def convert_zpts_to_zwap(wallet_address: str, convert_data: ConvertZPtsRequest, request: Request):
    """Convert Z Points to ZWAP using centralized reward service."""
    db = request.app.state.db
    wallet = wallet_address.lower()

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("zpts_balance", 0) < convert_data.zpts_amount:
        raise HTTPException(status_code=400, detail="Insufficient Z Points")

    result = await reward_service.convert_zpts_to_zwap(
        convert_data.zpts_amount,
        user.get("tier", "starter")
    )

    zwap_amount = result["zwap"]

    await db.users.update_one(
        {"wallet_address": wallet},
        {
            "$inc": {
                "zpts_balance": -convert_data.zpts_amount,
                "zwap_balance": zwap_amount,
            }
        }
    )

    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})

    return {
        "zpts_converted": convert_data.zpts_amount,
        "zwap_received": zwap_amount,
        "rate": result["rate"],
        "new_zpts_balance": updated_user.get("zpts_balance", 0),
        "new_zwap_balance": updated_user.get("zwap_balance", 0),
        "message": f"Converted {convert_data.zpts_amount} zPts to {zwap_amount} ZWAP",
    }


# Export canonical name expected by server.py
router = swap_router