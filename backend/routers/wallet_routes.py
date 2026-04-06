from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timezone

wallet_router = APIRouter(prefix="/wallet", tags=["Wallet"])


class ConvertZPtsPayload(BaseModel):
    walletAddress: str
    zpts_amount: int


class ClaimZwapPayload(BaseModel):
    walletAddress: str
    amount: float | None = None


@wallet_router.post("/convert-zpts")
async def convert_zpts(request: Request, payload: ConvertZPtsPayload):
    db = request.app.state.db

    wallet = payload.walletAddress.lower()
    zpts_amount = int(payload.zpts_amount)

    if not wallet:
      raise HTTPException(status_code=400, detail="Missing walletAddress")

    if zpts_amount < 1000:
        raise HTTPException(status_code=400, detail="Minimum conversion is 1000 zPts")

    zwap_delta = zpts_amount // 1000
    zpts_spent = zwap_delta * 1000

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("zpts_balance", 0) < zpts_spent:
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
    if not user_after:
        raise HTTPException(status_code=500, detail="User missing after conversion")

    return {
        "zpts_after": user_after.get("zpts_balance", 0),
        "zwap_after": user_after.get("zwap_balance", 0),
        "rate": 1000,
        "zpts_spent": zpts_spent,
        "zwap_received": zwap_delta,
    }


@wallet_router.post("/claim-zwap")
async def claim_zwap(request: Request, payload: ClaimZwapPayload):
    db = request.app.state.db
    w3 = request.app.state.w3
    zwap_contract = request.app.state.zwap_contract
    treasury_wallet = request.app.state.treasury_wallet
    treasury_private_key = request.app.state.treasury_private_key

    wallet = (payload.walletAddress or "").lower()
    requested_amount = payload.amount

    if not wallet:
        raise HTTPException(status_code=400, detail="Missing walletAddress")

    if not w3 or not w3.is_connected():
        raise HTTPException(status_code=500, detail="Web3 not connected")

    if not zwap_contract:
        raise HTTPException(status_code=500, detail="ZWAP contract not configured")

    if not treasury_wallet or not treasury_private_key:
        raise HTTPException(status_code=500, detail="Treasury wallet not configured")

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    internal_zwap = float(user.get("zwap_balance", 0) or 0)

    if internal_zwap <= 0:
        raise HTTPException(status_code=400, detail="No claimable ZWAP available")

    claim_amount = internal_zwap if requested_amount is None else float(requested_amount)

    if claim_amount <= 0:
        raise HTTPException(status_code=400, detail="Claim amount must be greater than zero")

    if claim_amount > internal_zwap:
        raise HTTPException(status_code=400, detail="Insufficient internal ZWAP balance")

    try:
        amount_wei = w3.to_wei(claim_amount, "ether")
        nonce = w3.eth.get_transaction_count(treasury_wallet)

        tx = zwap_contract.functions.transfer(
            wallet,
            amount_wei,
        ).build_transaction(
            {
                "from": treasury_wallet,
                "nonce": nonce,
                "gas": 200000,
                "gasPrice": w3.eth.gas_price,
            }
        )

        signed_tx = w3.eth.account.sign_transaction(tx, treasury_private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_hash_hex = w3.to_hex(tx_hash)

        update_result = await db.users.update_one(
            {
                "wallet_address": wallet,
                "zwap_balance": {"$gte": claim_amount},
            },
            {
                "$inc": {
                    "zwap_balance": -claim_amount,
                }
            },
        )

        if update_result.matched_count == 0:
            raise HTTPException(status_code=400, detail="Claim balance changed before transfer could finalize")

        await db.ledger.insert_one(
            {
                "type": "CLAIM_ZWAP_TO_WALLET",
                "wallet_address": wallet,
                "zwap_delta": -claim_amount,
                "tx_hash": tx_hash_hex,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )

        user_after = await db.users.find_one({"wallet_address": wallet})

        return {
            "success": True,
            "wallet_address": wallet,
            "claimed_amount": claim_amount,
            "zwap_after": user_after.get("zwap_balance", 0) if user_after else 0,
            "tx_hash": tx_hash_hex,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


router = wallet_router