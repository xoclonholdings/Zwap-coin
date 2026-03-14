from typing import Dict


async def get_treasury_status(db, w3, zwap_contract) -> Dict:
    """
    Reads on-chain treasury balance and calculates issued vs claimed totals.
    Works even if Web3 is not connected.
    """

    treasury_wallet = "TREASURY_WALLET_ADDRESS"

    # Default if blockchain unavailable
    balance_zwap = 0

    if w3 and w3.is_connected():
        try:
            balance_wei = w3.eth.get_balance(treasury_wallet)
            balance_zwap = w3.from_wei(balance_wei, "ether")
        except Exception:
            balance_zwap = 0

    # MongoDB aggregation
    issued_total = await db.swaps.aggregate([
        {"$group": {"_id": None, "total_issued": {"$sum": "$amount"}}}
    ]).to_list(length=1)

    claimed_total = await db.users.aggregate([
        {"$group": {"_id": None, "total_claimed": {"$sum": "$zwap_balance"}}}
    ]).to_list(length=1)

    return {
        "on_chain_balance": float(balance_zwap),
        "issued_total": issued_total[0]["total_issued"] if issued_total else 0,
        "claimed_total": claimed_total[0]["total_claimed"] if claimed_total else 0,
        "web3_connected": bool(w3 and w3.is_connected()),
    }