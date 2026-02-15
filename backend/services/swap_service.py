from typing import Dict

FEE_RATE = 0.01  # Example fee rate

async def get_prices(db) -> Dict:
    """
    Returns current swap prices from DB or external source.
    """
    cursor = db.swap_prices.find()
    return {item["symbol"]: item["price"] async for item in cursor}

async def execute_swap(db, w3, zwap_contract, user_id: str, from_token: str, to_token: str, amount: float) -> Dict:
    """
    Executes token swap, applies fee, updates balances, records swap.
    """
    prices = await get_prices(db)
    if from_token not in prices or to_token not in prices:
        raise ValueError("Invalid token symbols")

    net_amount = amount * (1 - FEE_RATE)
    converted_amount = net_amount * (prices[to_token] / prices[from_token])

    # Update user balances
    await db.users.update_one(
        {"_id": user_id},
        {"$inc": {f"balances.{from_token}": -amount, f"balances.{to_token}": converted_amount}}
    )

    # Record swap
    await db.swaps.insert_one({
        "user_id": user_id,
        "from_token": from_token,
        "to_token": to_token,
        "amount_in": amount,
        "amount_out": converted_amount,
        "fee": amount * FEE_RATE,
        "timestamp": datetime.utcnow()
    })

    return {
        "user_id": user_id,
        "from_token": from_token,
        "to_token": to_token,
        "amount_in": amount,
        "amount_out": converted_amount,
        "fee": amount * FEE_RATE
    }
