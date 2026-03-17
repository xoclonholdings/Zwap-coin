from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

shop_router = APIRouter(tags=["Shop"])


class ShopItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    description: str = ""

    payment_method: str = "zwap"
    price_zwap: float = 0
    price_zpts: Optional[float] = None
    price_stripe: Optional[float] = None

    image_url: Optional[str] = None
    category: str = "general"
    subcategory: Optional[str] = None

    in_stock: bool = True
    active: bool = True
    plus_only: bool = False
    max_quantity: Optional[int] = None

    fulfillment_type: str = "none"
    download_url: Optional[str] = None
    external_url: Optional[str] = None
    fulfillment_notes: Optional[str] = None


class PurchaseRequest(BaseModel):
    item_id: str
    payment_type: str = "zwap"


@shop_router.get("/shop/items", response_model=List[ShopItem])
async def get_shop_items(request: Request):
    db = request.app.state.db

    items = await db.shop_items.find({}).to_list(100)

    normalized_items = []
    for item in items:
        normalized_items.append(
            ShopItem(
                id=item.get("id") or str(item.get("_id")),
                name=item.get("name", ""),
                description=item.get("description", ""),
                payment_method=item.get("payment_method", "zwap"),
                price_zwap=item.get("price_zwap", 0),
                price_zpts=item.get("price_zpts"),
                price_stripe=item.get("price_stripe"),
                image_url=item.get("image_url"),
                category=item.get("category", "general"),
                subcategory=item.get("subcategory"),
                in_stock=item.get("in_stock", True),
                active=item.get("active", item.get("is_active", True)),
                plus_only=item.get("plus_only", False),
                max_quantity=item.get("max_quantity"),
                fulfillment_type=item.get("fulfillment_type", "none"),
                download_url=item.get("download_url"),
                external_url=item.get("external_url"),
                fulfillment_notes=item.get("fulfillment_notes"),
            )
        )

    return normalized_items


@shop_router.post("/shop/purchase/{wallet_address}")
async def purchase_item(wallet_address: str, purchase: PurchaseRequest, request: Request):
    db = request.app.state.db
    wallet = wallet_address.lower()

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    item = await db.shop_items.find_one({
        "$or": [
            {"id": purchase.item_id},
            {"_id": purchase.item_id},
        ]
    })

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item_id = item.get("id") or str(item.get("_id"))

    if item.get("plus_only") and user.get("tier") != "plus":
        raise HTTPException(status_code=403, detail="Plus subscription required")

    if purchase.payment_type == "zpts":
        if not item.get("price_zpts"):
            raise HTTPException(status_code=400, detail="Item not available for Z Points")

        if user.get("zpts_balance", 0) < item["price_zpts"]:
            raise HTTPException(status_code=400, detail="Insufficient Z Points")

        await db.users.update_one(
            {"wallet_address": wallet},
            {"$inc": {"zpts_balance": -item["price_zpts"]}}
        )

        price_paid = item["price_zpts"]
        currency = "zpts"

    else:
        if user.get("zwap_balance", 0) < item.get("price_zwap", 0):
            raise HTTPException(status_code=400, detail="Insufficient ZWAP balance")

        await db.users.update_one(
            {"wallet_address": wallet},
            {"$inc": {"zwap_balance": -item["price_zwap"]}}
        )

        price_paid = item["price_zwap"]
        currency = "zwap"

    await db.purchases.insert_one({
        "id": str(uuid.uuid4()),
        "user_wallet": wallet,
        "item_id": item_id,
        "item_name": item.get("name", "Item"),
        "price": price_paid,
        "currency": currency,
        "purchased_at": datetime.now(timezone.utc).isoformat()
    })

    existing_inventory = await db.user_inventory.find_one({
        "user_wallet": wallet,
        "item_id": item_id,
        "active": True,
    })

    if not existing_inventory:
        await db.user_inventory.insert_one({
            "user_wallet": wallet,
            "item_id": item_id,
            "item_name": item.get("name", "Item"),
            "granted_at": datetime.now(timezone.utc).isoformat(),
            "source": currency,
            "active": True,
        })

    updated_user = await db.users.find_one(
        {"wallet_address": wallet},
        {"_id": 0}
    )

    return {
        "success": True,
        "item": item.get("name", "Item"),
        "price": price_paid,
        "currency": currency,
        "new_zwap_balance": updated_user.get("zwap_balance", 0),
        "new_zpts_balance": updated_user.get("zpts_balance", 0),
        "message": f"Successfully purchased {item.get('name', 'item')}!"
    }


# Export canonical name expected by server.py
router = shop_router