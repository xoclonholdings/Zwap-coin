from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request

from .common import verify_admin, get_db

router = APIRouter()


@router.get("/users")
async def admin_list_users(
    request: Request,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    _: None = Depends(verify_admin),
):
    db = get_db(request)

    query: Dict[str, Any] = {}

    if search:
        query = {
            "$or": [
                {"wallet_address": {"$regex": search, "$options": "i"}},
                {"custom_username": {"$regex": search, "$options": "i"}},
                {"username": {"$regex": search, "$options": "i"}},
            ]
        }

    users = await db.users.find(
        query,
        {
            "_id": 0,
            "wallet_address": 1,
            "custom_username": 1,
            "username": 1,
            "tier": 1,
            "zwap_balance": 1,
            "zpts_balance": 1,
            "status": 1,
        },
    ).skip(skip).limit(limit).to_list(length=limit)

    normalized_users = []
    for user in users:
        normalized_users.append(
            {
                "wallet_address": user.get("wallet_address"),
                "username": user.get("custom_username") or user.get("username") or "—",
                "tier": user.get("tier", "starter"),
                "zwap_balance": user.get("zwap_balance", 0),
                "zpts_balance": user.get("zpts_balance", 0),
                "status": user.get("status", "active"),
            }
        )

    total = await db.users.count_documents(query)

    return {
        "users": normalized_users,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/users/{wallet}/purchases")
async def admin_user_purchases(
    wallet: str,
    request: Request,
    limit: int = 20,
    _: None = Depends(verify_admin),
):
    db = get_db(request)

    purchases = await db.purchases.find(
        {"user_wallet": wallet},
        {
            "_id": 0,
            "id": 1,
            "item_id": 1,
            "item_name": 1,
            "price": 1,
            "currency": 1,
            "purchased_at": 1,
            "refunded": 1,
            "refunded_at": 1,
            "refunded_by": 1,
        },
    ).sort("purchased_at", -1).limit(limit).to_list(length=limit)

    item_ids = [p.get("item_id") for p in purchases if p.get("item_id")]
    items_map: Dict[str, str] = {}

    if item_ids:
        items = await db.shop_items.find(
            {"_id": {"$in": item_ids}},
            {"_id": 1, "name": 1},
        ).to_list(length=len(item_ids))

        items_map = {
            str(item.get("_id")): item.get("name", "Item")
            for item in items
        }

    normalized_purchases = []
    for purchase in purchases:
        item_id = purchase.get("item_id")

        normalized_purchases.append(
            {
                "id": purchase.get("id"),
                "item_id": item_id,
                "item_name": purchase.get("item_name") or items_map.get(str(item_id), "Item"),
                "amount": purchase.get("price", 0),
                "payment_type": purchase.get("currency", "zwap"),
                "timestamp": purchase.get("purchased_at"),
                "refunded": purchase.get("refunded", False),
                "refunded_at": purchase.get("refunded_at"),
                "refunded_by": purchase.get("refunded_by"),
            }
        )

    return {"purchases": normalized_purchases}


@router.post("/purchases/{purchase_id}/refund")
async def refund_purchase(
    purchase_id: str,
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)

    purchase = await db.purchases.find_one({"id": purchase_id})
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    if purchase.get("refunded"):
        raise HTTPException(status_code=400, detail="Purchase already refunded")

    wallet = purchase.get("user_wallet")
    price = purchase.get("price", 0)
    currency = (purchase.get("currency") or "").lower()

    if not wallet:
        raise HTTPException(status_code=400, detail="Purchase missing wallet")

    balance_field = "zwap_balance" if currency == "zwap" else "zpts_balance"

    await db.users.update_one(
        {"wallet_address": wallet},
        {"$inc": {balance_field: price}},
    )

    from datetime import datetime
    refunded_at = datetime.utcnow().isoformat()

    await db.purchases.update_one(
        {"id": purchase_id},
        {
            "$set": {
                "refunded": True,
                "refunded_at": refunded_at,
                "refunded_by": "admin",
            }
        },
    )

    await db.admin_actions.insert_one(
        {
            "id": f"admin_action_refund_{purchase_id}",
            "action_type": "refund_purchase",
            "target_type": "purchase",
            "target_id": purchase_id,
            "wallet_address": wallet,
            "amount": price,
            "currency": currency,
            "performed_by": "admin",
            "created_at": refunded_at,
        }
    )

    return {
        "success": True,
        "purchase_id": purchase_id,
        "wallet": wallet,
        "amount_refunded": price,
        "currency": currency,
    }