from typing import Dict


async def get_treasury_status(db, w3, zwap_contract) -> Dict:
    """
    Read-only treasury visibility:
    - native wallet balance
    - token contract balance
    - issued vs claimed totals
    - connection status
    """

    treasury_wallet = "0x102a5301c56cFCf4F02bEA3184Bdb44b731375E0"
    contract_address = "0xE8898453Af13B9496a6E8ADA92C6efDAF4967A81"
    
    native_balance = 0
    token_balance = 0
    web3_connected = bool(w3 and w3.is_connected())
    contract_address = None

    if zwap_contract is not None:
        try:
            contract_address = zwap_contract.address
        except Exception:
            contract_address = None

    if web3_connected:
        try:
            native_balance_wei = w3.eth.get_balance(treasury_wallet)
            native_balance = float(w3.from_wei(native_balance_wei, "ether"))
        except Exception:
            native_balance = 0

        try:
            if zwap_contract is not None:
                token_balance_raw = zwap_contract.functions.balanceOf(treasury_wallet).call()
                token_balance = float(w3.from_wei(token_balance_raw, "ether"))
        except Exception:
            token_balance = 0

    issued_total = await db.swaps.aggregate([
        {"$group": {"_id": None, "total_issued": {"$sum": "$amount"}}}
    ]).to_list(length=1)

    claimed_total = await db.users.aggregate([
        {"$group": {"_id": None, "total_claimed": {"$sum": "$zwap_balance"}}}
    ]).to_list(length=1)

    return {
        "treasury_wallet": treasury_wallet,
        "contract_address": contract_address,
        "native_balance": native_balance,
        "on_chain_balance": token_balance,
        "issued_total": issued_total[0]["total_issued"] if issued_total else 0,
        "claimed_total": claimed_total[0]["total_claimed"] if claimed_total else 0,
        "web3_connected": web3_connected,
        "status_label": "connected" if web3_connected else "offline",
    }