from datetime import datetime
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Request

import services.treasury_service as treasury_service

from .common import verify_admin, get_db, get_chain

router = APIRouter()


# ===========================
# TREASURY STATUS
# ===========================
@router.get("/treasury")
async def treasury_status(request: Request, _: None = Depends(verify_admin)):
    db = get_db(request)
    w3, zwap_contract = get_chain(request)
    return await treasury_service.get_treasury_status(db, w3, zwap_contract)


# ===========================
# SEND ZWAP
# ===========================
@router.post("/treasury/send")
async def admin_send_zwap(
    request: Request,
    payload: Dict,
    _: None = Depends(verify_admin),
):
    db = get_db(request)

    w3 = request.app.state.w3
    zwap_contract = request.app.state.zwap_contract
    treasury_wallet = request.app.state.treasury_wallet
    treasury_private_key = request.app.state.treasury_private_key

    if not w3 or not w3.is_connected():
        raise HTTPException(status_code=500, detail="Web3 not connected")

    if not zwap_contract:
        raise HTTPException(status_code=500, detail="ZWAP contract not configured")

    to_address = payload.get("to")
    amount = payload.get("amount")

    if not to_address or amount is None:
        raise HTTPException(status_code=400, detail="Missing destination or amount")

    try:
        amount_wei = w3.to_wei(amount, "ether")
        nonce = w3.eth.get_transaction_count(treasury_wallet)

        tx = zwap_contract.functions.transfer(
            to_address,
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

        await db.admin_activity.insert_one(
            {
                "type": "treasury_transfer",
                "to": to_address,
                "amount": amount,
                "tx_hash": tx_hash_hex,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        return {
            "success": True,
            "tx_hash": tx_hash_hex,
            "to": to_address,
            "amount": amount,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))