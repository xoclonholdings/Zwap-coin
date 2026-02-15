from typing import Dict, List

async def list_items(db) -> List[Dict]:
    """
    Returns all shop items.
    """
    cursor = db.shop_items.find()
    return [item async for item in cursor]

async def purchase_item(db, user_id: str, item_id: str, payment_type: str) -> Dict:
    """
    Handles purchase logic, balance check, deduction, and record.
    payment_type: "ZWAP" or "zPts"
    """
    user = await db.users.find_one({"_id": user_id})
    item = await db.shop_items.find_one({"_id": item_id})
    if not user or not item:
        raise ValueError("Invalid user or item")

    cost = item["price_zwap"] if payment_type == "ZWAP" else item["price_zpts"]
    balance_field = "zwap_balance" if payment_type == "ZWAP" else "zpts_balance"

    if user.get(balance_field, 0) < cost:
        raise ValueError("Insufficient balance")

    await db.users.update_one(
        {"_id": user_id},
        {"$inc": {balance_field: -cost}}
    )

    await db.purchases.insert_one({
        "user_id": user_id,
        "item_id": item_id,
        "payment_type": payment_type,
        "amount": cost,
        "timestamp": datetime.utcnow()
    })

    return {"user_id": user_id, "item_id": item_id, "amount": cost}
