from typing import Dict

async def adjust_reward(db, user_id: str, amount: float) -> Dict:
    """
    Adjusts rewards for a user. Manages append-only rewards ledger.
    """
    # Append to rewards ledger
    await db.rewards.insert_one({
        "user_id": user_id,
        "amount": amount,
        "timestamp": datetime.utcnow()
    })

    # Update user balance
    await db.users.update_one(
        {"_id": user_id},
        {"$inc": {"zwap_balance": amount}}
    )

    return {"user_id": user_id, "adjusted": amount}

async def get_reward_aggregates(db, user_id: str) -> Dict:
    """
    Aggregation queries for rewards.
    """
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$user_id", "total_rewards": {"$sum": "$amount"}}}
    ]
    result = await db.rewards.aggregate(pipeline).to_list(length=1)
    return result[0] if result else {"total_rewards": 0}
