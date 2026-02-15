from typing import Dict

async def get_treasury_status(db, w3, zwap_contract) -> Dict:
    """
    Reads on-chain treasury balance and calculates issued vs claimed totals.
    Returns a structured dictionary.
    """
    # Example: Read treasury wallet balance from blockchain
    treasury_wallet = "TREASURY_WALLET_ADDRESS"  # Replace with config/env var
    balance_wei = await w3.eth.get_balance(treasury_wallet)
    balance_zwap = w3.fromWei(balance_wei, 'ether')

    # Example: MongoDB aggregation for issued vs claimed
    issued_total = await db.swaps.aggregate([
        {"$group": {"_id": None, "total_issued": {"$sum": "$amount"}}}
    ]).to_list(length=1)
    claimed_total = await db.users.aggregate([
        {"$group": {"_id": None, "total_claimed": {"$sum": "$zwap_balance"}}}
    ]).to_list(length=1)

    return {
        "on_chain_balance": balance_zwap,
        "issued_total": issued_total[0]["total_issued"] if issued_total else 0,
        "claimed_total": claimed_total[0]["total_claimed"] if claimed_total else 0
    }
