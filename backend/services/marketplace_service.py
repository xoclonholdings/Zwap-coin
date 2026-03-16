from typing import Dict, List, Any
from datetime import datetime, timezone
import uuid

from fastapi import HTTPException


COLLECTION_NAME = "shop_items"


def _normalize_item_payload(item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensure that the item document has consistent fields.
    Used by both create_item and update_item.
    """
    normalized: Dict[str, Any] = {}

    # Name
    name = (item.get("name") or "").strip()
    if name:
        normalized["name"] = name

    # Description
    normalized["description"] = (item.get("description") or "").strip()

    # Image URL
    image_url = (item.get("image_url") or "").strip()
    normalized["image_url"] = image_url or None

    # Payment method
    payment_method = (item.get("payment_method") or "zwap").strip().lower()
    allowed_payment_methods = {"zwap", "zpts", "stripe"}
    normalized["payment_method"] = (
        payment_method if payment_method in allowed_payment_methods else "zwap"
    )

    # Prices
    try:
        normalized["price_zwap"] = float(item.get("price_zwap") or 0)
    except (TypeError, ValueError):
        normalized["price_zwap"] = 0.0

    try:
        zpts_raw = item.get("price_zpts", item.get("price_zpoints", 0))
        normalized["price_zpts"] = float(zpts_raw or 0)
    except (TypeError, ValueError):
        normalized["price_zpts"] = 0.0

    try:
        stripe_raw = item.get("price_stripe", item.get("price_usd", 0))
        normalized["price_stripe"] = float(stripe_raw or 0)
    except (TypeError, ValueError):
        normalized["price_stripe"] = 0.0

    # Max quantity
    max_q_raw = item.get("max_quantity", None)
    if max_q_raw in ("", None, "null"):
        normalized["max_quantity"] = None
    else:
        try:
            normalized["max_quantity"] = int(max_q_raw)
        except (TypeError, ValueError):
            normalized["max_quantity"] = None

    # Active flag
    is_active = item.get("is_active")
    if is_active is None:
        normalized["is_active"] = True
    else:
        normalized["is_active"] = bool(is_active)

    # Legacy compatibility
    normalized["active"] = normalized["is_active"]

    # Category / subcategory
    category = (item.get("category") or "").strip()
    normalized["category"] = category or None

    subcategory = (item.get("subcategory") or "").strip()
    normalized["subcategory"] = subcategory or None

    # Fulfillment fields
    fulfillment_type = (item.get("fulfillment_type") or "none").strip().lower()
    allowed_fulfillment_types = {"none", "digital", "external", "manual"}
    normalized["fulfillment_type"] = (
        fulfillment_type if fulfillment_type in allowed_fulfillment_types else "none"
    )

    download_url = (item.get("download_url") or "").strip()
    normalized["download_url"] = download_url or None

    external_url = (item.get("external_url") or "").strip()
    normalized["external_url"] = external_url or None

    fulfillment_notes = (item.get("fulfillment_notes") or "").strip()
    normalized["fulfillment_notes"] = fulfillment_notes or None

    # Plus-only flag
    normalized["plus_only"] = bool(item.get("plus_only", False))

    # Timestamps
    now = datetime.now(timezone.utc)
    if "created_at" not in item:
        normalized["created_at"] = now
    normalized["updated_at"] = now

    return normalized


async def list_items(db) -> Dict[str, List[Dict[str, Any]]]:
    """
    Returns all shop items for admin & marketplace.
    Makes docs JSON-safe and returns the shape the frontend expects.
    """
    cursor = db[COLLECTION_NAME].find()
    items: List[Dict[str, Any]] = []

    async for doc in cursor:
        safe_doc = dict(doc)

        safe_doc["id"] = str(safe_doc.get("id") or safe_doc.get("_id")) if (
            safe_doc.get("id") or safe_doc.get("_id")
        ) is not None else None
        safe_doc.pop("_id", None)

        if isinstance(safe_doc.get("created_at"), datetime):
            safe_doc["created_at"] = safe_doc["created_at"].isoformat()

        if isinstance(safe_doc.get("updated_at"), datetime):
            safe_doc["updated_at"] = safe_doc["updated_at"].isoformat()

        items.append(safe_doc)

    return {"items": items}


async def list_orders(db, limit: int = 100) -> Dict[str, List[Dict[str, Any]]]:
    """
    Returns recent marketplace purchase records for admin use.
    Supports multiple purchase record shapes already used in the app.
    """
    safe_limit = max(1, min(int(limit or 100), 500))

    cursor = (
        db.purchases
        .find()
        .sort("timestamp", -1)
        .limit(safe_limit)
    )

    orders: List[Dict[str, Any]] = []

    async for doc in cursor:
        raw_id = doc.get("_id")
        user_id = doc.get("user_id")
        user_wallet = doc.get("user_wallet")
        item_id = doc.get("item_id")

        item = None
        if item_id:
            item = await db[COLLECTION_NAME].find_one({"_id": item_id})
            if not item:
                item = await db[COLLECTION_NAME].find_one({"id": item_id})

        user = None
        if user_id:
            user = await db.users.find_one({"_id": user_id})
            if not user:
                user = await db.users.find_one({"id": user_id})

        if not user and user_wallet:
            user = await db.users.find_one({"wallet_address": user_wallet.lower()})

        timestamp = doc.get("timestamp") or doc.get("purchased_at")
        if isinstance(timestamp, datetime):
            timestamp = timestamp.isoformat()

        amount = doc.get("amount")
        if amount is None:
            amount = doc.get("price", 0)

        payment_type = doc.get("payment_type")
        if payment_type is None:
            payment_type = doc.get("currency", "zwap")

        order = {
            "id": str(raw_id) if raw_id is not None else doc.get("id"),
            "user_id": user_id or (user.get("id") if user else None),
            "item_id": item_id,
            "payment_type": payment_type,
            "amount": amount,
            "timestamp": timestamp,
            "item_name": doc.get("item_name") or (item.get("name") if item else None),
            "item_image_url": doc.get("item_image_url") or (item.get("image_url") if item else None),
            "wallet_address": user_wallet or (user.get("wallet_address") if user else None),
            "username": (
                doc.get("username")
                or (user.get("custom_username") if user else None)
                or (user.get("username") if user else None)
            ),
        }

        orders.append(order)

    return {"orders": orders}


async def create_item(db, item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new marketplace item in the shop_items collection.
    """
    payload = _normalize_item_payload(item)

    if not payload.get("name"):
        raise HTTPException(status_code=400, detail="Item name is required")

    payment_method = payload.get("payment_method", "zwap")

    if payment_method == "zwap" and payload.get("price_zwap", 0) <= 0:
        raise HTTPException(status_code=400, detail="ZWAP price must be greater than 0")

    if payment_method == "zpts" and payload.get("price_zpts", 0) <= 0:
        raise HTTPException(status_code=400, detail="zPts price must be greater than 0")

    if payment_method == "stripe" and payload.get("price_stripe", 0) <= 0:
        raise HTTPException(status_code=400, detail="Stripe price must be greater than 0")

    item_id = item.get("id") or str(uuid.uuid4())
    payload["_id"] = item_id
    payload["id"] = item_id

    await db[COLLECTION_NAME].insert_one(payload)

    created = await db[COLLECTION_NAME].find_one({"_id": item_id})
    if not created:
        raise HTTPException(status_code=500, detail="Item was not created")

    created["id"] = str(created.get("id") or created.get("_id"))
    created.pop("_id", None)

    if isinstance(created.get("created_at"), datetime):
        created["created_at"] = created["created_at"].isoformat()

    if isinstance(created.get("updated_at"), datetime):
        created["updated_at"] = created["updated_at"].isoformat()

    return created


async def update_item(db, item_id: str, item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update an existing marketplace item.
    Called by: PUT /admin/marketplace/items/{item_id}
    """
    if not item_id:
        raise HTTPException(status_code=400, detail="Missing item id")

    payload = _normalize_item_payload(item)

    if "name" in payload and not payload["name"]:
        raise HTTPException(status_code=400, detail="Item name cannot be empty")

    payment_method = payload.get("payment_method", "zwap")

    if payment_method == "zwap" and payload.get("price_zwap", 0) <= 0:
        raise HTTPException(status_code=400, detail="ZWAP price must be greater than 0")

    if payment_method == "zpts" and payload.get("price_zpts", 0) <= 0:
        raise HTTPException(status_code=400, detail="zPts price must be greater than 0")

    if payment_method == "stripe" and payload.get("price_stripe", 0) <= 0:
        raise HTTPException(status_code=400, detail="Stripe price must be greater than 0")

    result = await db[COLLECTION_NAME].update_one(
        {"$or": [{"_id": item_id}, {"id": item_id}]},
        {"$set": payload},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")

    doc = await db[COLLECTION_NAME].find_one({"$or": [{"_id": item_id}, {"id": item_id}]})
    if not doc:
        raise HTTPException(status_code=404, detail="Item not found after update")

    doc["id"] = str(doc.get("id") or doc.get("_id"))
    doc.pop("_id", None)

    if isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = doc["created_at"].isoformat()

    if isinstance(doc.get("updated_at"), datetime):
        doc["updated_at"] = doc["updated_at"].isoformat()

    return doc


async def delete_item(db, item_id: str) -> Dict[str, Any]:
    """
    Delete an item completely from the marketplace.
    Supports both legacy 'id' and new '_id' schema.
    """
    if not item_id:
        raise HTTPException(status_code=400, detail="Missing item id")

    result = await db[COLLECTION_NAME].delete_one({"_id": item_id})

    if result.deleted_count == 0:
        result = await db[COLLECTION_NAME].delete_one({"id": item_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")

    return {"deleted": True, "id": item_id}


# ===========================
# PURCHASE LOGIC (legacy/internal)
# ===========================
async def purchase_item(db, user_id: str, item_id: str, payment_type: str) -> Dict[str, Any]:
    """
    Handles purchase logic, balance check, deduction, and record.
    payment_type: "ZWAP" or "zPts"
    """
    user = await db.users.find_one({"_id": user_id})
    item = await db[COLLECTION_NAME].find_one({"_id": item_id})

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
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "item_id": item_id,
        "amount": cost,
        "payment_type": payment_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    return {"user_id": user_id, "item_id": item_id, "amount": cost}