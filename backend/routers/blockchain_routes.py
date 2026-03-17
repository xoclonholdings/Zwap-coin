from fastapi import APIRouter, Request, HTTPException
from web3 import Web3

blockchain_router = APIRouter(prefix="/blockchain", tags=["Blockchain"])


@blockchain_router.get("/balance/{wallet_address}")
async def get_wallet_balance(wallet_address: str, request: Request):
    w3 = request.app.state.w3
    contract = request.app.state.zwap_contract

    try:
        wallet = Web3.to_checksum_address(wallet_address)

        # Native MATIC balance
        matic_balance = w3.eth.get_balance(wallet)
        matic_balance = w3.from_wei(matic_balance, "ether")

        # ZWAP token balance
        zwap_balance = 0
        if contract:
            raw_balance = contract.functions.balanceOf(wallet).call()
            zwap_balance = raw_balance / (10 ** 18)

        return {
            "wallet": wallet_address,
            "matic": float(matic_balance),
            "zwap": float(zwap_balance),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# export
router = blockchain_router