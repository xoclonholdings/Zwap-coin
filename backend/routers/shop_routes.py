from datetime import datetime, timezone
from typing import List, Optional
import re
import uuid

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict

shop_router = APIRouter(tags=["Shop"])


class ShopCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    label: str
    description: str = ""
    sort_order: int = 0
    active: bool = True


class ShopItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    description: str = ""
    payment_method: str = "zpts"
    price_zpts: Optional[int] = None
    price_zwap: Optional[float] = None
    price_stripe: Optional[float] = None
    image_url: Optional[str] = None
    category: str = "general"
    subcategory: Optional[str] = None
    item_type: Optional[str] = "custom"
    rotation: Optional[str] = "Custom"
    phase: Optional[str] = "Phase A"
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
    payment_type: str = "zpts"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_id(value: Optional[str]) -> str:
    if value is None:
        return ""

    normalized = str(value).strip().lower()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    normalized = re.sub(r"-+", "-", normalized)
    normalized = normalized.strip("-")
    return normalized


def title_from_category_id(category_id: str) -> str:
    safe = str(category_id or "general").replace("-", " ").replace("_", " ")
    return safe.title()


@shop_router.get("/shop/categories", response_model=List[ShopCategory])
async def get_shop_categories(request: Request):
    db = request.app.state.db

    saved_categories = (
        await db.shop_categories.find(
            {"active": True},
            {"_id": 0},
        )
        .sort("sort_order", 1)
        .to_list(length=100)
    )

    if saved_categories:
        return [
            ShopCategory(
                id=normalize_id(category.get("id", "")),
                label=category.get("label") or "Category",
                description=category.get("description", ""),
                sort_order=int(category.get("sort_order", 0) or 0),
                active=True,
            )
            for category in saved_categories
            if normalize_id(category.get("id", ""))
        ]

    active_items = await db.shop_items.find(
        {
            "active": True,
            "in_stock": True,
        },
        {"_id": 0, "category": 1},
    ).to_list(length=200)

    category_ids = sorted(
        {
            normalize_id(item.get("category", "general"))
            for item in active_items
            if normalize_id(item.get("category", "general"))
        }
    )

    return [
        ShopCategory(
            id=category_id,
            label=title_from_category_id(category_id),
            sort_order=index,
            active=True,
        )
        for index, category_id in enumerate(category_ids)
    ]


@shop_router.get("/shop/items", response_model=List[ShopItem])
async def get_shop_items(request: Request):
    db = request.app.state.db

    items = await db.shop_items.find(
        {
            "active": True,
            "in_stock": True,
        },
        {"_id": 0},
    ).sort([("category", 1), ("name", 1)]).to_list(length=200)

    return [
        ShopItem(
            id=normalize_id(item.get("id", "")),
            name=item.get("name", ""),
            description=item.get("description", ""),
            payment_method=item.get("payment_method", "zpts"),
            price_zpts=item.get("price_zpts"),
            price_zwap=item.get("price_zwap"),
            price_stripe=item.get("price_stripe"),
            image_url=item.get("image_url"),
            category=normalize_id(item.get("category", "general")) or "general",
            subcategory=normalize_id(item.get("subcategory")) if item.get("subcategory") else None,
            item_type=item.get("item_type", "custom"),
            rotation=item.get("rotation", "Custom"),
            phase=item.get("phase", "Phase A"),
            in_stock=True,
            active=True,
            plus_only=bool(item.get("plus_only", False)),
            max_quantity=item.get("max_quantity"),
            fulfillment_type=item.get("fulfillment_type", "none"),
            download_url=item.get("download_url"),
            external_url=item.get("external_url"),
            fulfillment_notes=item.get("fulfillment_notes"),
        )
        for item in items
        if normalize_id(item.get("id", ""))
    ]


@shop_router.post("/shop/purchase/{wallet_address}")
async def purchase_item(
    wallet_address: str,
    purchase: PurchaseRequest,
    request: Request,
):
    db = request.app.state.db

    wallet = wallet_address.lower().strip()
    item_id = normalize_id(purchase.item_id)
    payment_type = purchase.payment_type.lower().strip()

    if not wallet:
        raise HTTPException(status_code=400, detail="Wallet address is required")

    if not item_id:
        raise HTTPException(status_code=400, detail="Item id is required")

    if payment_type not in {"zpts", "zwap"}:
        raise HTTPException(status_code=400, detail="Unsupported payment type")

    user = await db.users.find_one({"wallet_address": wallet})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    item = await db.shop_items.find_one(
        {
            "id": item_id,
            "active": True,
            "in_stock": True,
        },
        {"_id": 0},
    )

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.get("plus_only") and user.get("tier") not in {"plus", "zitizen"}:
        raise HTTPException(status_code=403, detail="Zitizen subscription required")

    item_payment_method = str(item.get("payment_method", "zpts")).lower().strip()
    if item_payment_method != payment_type:
        raise HTTPException(
            status_code=400,
            detail=f"Item requires {item_payment_method} payment",
        )

    if payment_type == "zpts":
        price_paid = int(item.get("price_zpts") or 0)

        if price_paid <= 0:
            raise HTTPException(status_code=400, detail="Item is not available for zPts")

        if int(user.get("zpts_balance", 0) or 0) < price_paid:
            raise HTTPException(status_code=400, detail="Insufficient zPts")

        balance_update = {
            "$inc": {"zpts_balance": -price_paid},
            "$set": {"updated_at": utc_now_iso()},
        }

    else:
        price_paid = float(item.get("price_zwap") or 0)

        if price_paid <= 0:
            raise HTTPException(status_code=400, detail="Item is not available for ZWAP")

        if float(user.get("zwap_balance", 0) or 0) < price_paid:
            raise HTTPException(status_code=400, detail="Insufficient ZWAP balance")

        balance_update = {
            "$inc": {"zwap_balance": -price_paid},
            "$set": {"updated_at": utc_now_iso()},
        }

    purchase_id = str(uuid.uuid4())
    now_iso = utc_now_iso()

    update_result = await db.users.update_one(
        {"wallet_address": wallet},
        balance_update,
    )

    if update_result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Purchase failed")

    purchase_record = {
        "id": purchase_id,
        "user_wallet": wallet,
        "item_id": item_id,
        "item_name": item.get("name", "Item"),
        "price": price_paid,
        "currency": payment_type,
        "purchased_at": now_iso,
    }

    await db.purchases.insert_one(dict(purchase_record))
    await db.shop_purchases.insert_one(dict(purchase_record))

    existing_inventory = await db.user_inventory.find_one(
        {
            "user_wallet": wallet,
            "item_id": item_id,
            "active": True,
        }
    )

    if not existing_inventory:
        await db.user_inventory.insert_one(
            {
                "id": str(uuid.uuid4()),
                "user_wallet": wallet,
                "item_id": item_id,
                "item_name": item.get("name", "Item"),
                "category": normalize_id(item.get("category", "general")) or "general",
                "subcategory": normalize_id(item.get("subcategory")) if item.get("subcategory") else None,
                "item_type": item.get("item_type", "custom"),
                "fulfillment_type": item.get("fulfillment_type", "none"),
                "download_url": item.get("download_url"),
                "external_url": item.get("external_url"),
                "fulfillment_notes": item.get("fulfillment_notes"),
                "granted_at": now_iso,
                "source": payment_type,
                "active": True,
            }
        )

    updated_user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})

    return {
        "success": True,
        "purchase_id": purchase_id,
        "item_id": item_id,
        "item": item.get("name", "Item"),
        "price": price_paid,
        "currency": payment_type,
        "new_zwap_balance": updated_user.get("zwap_balance", 0),
        "new_zpts_balance": updated_user.get("zpts_balance", 0),
        "message": f"Successfully purchased {item.get('name', 'item')}.",
    }


@shop_router.get("/users/{wallet_address}/inventory")
async def get_user_inventory(wallet_address: str, request: Request):
    db = request.app.state.db
    wallet = wallet_address.lower().strip()

    inventory = (
        await db.user_inventory.find(
            {"user_wallet": wallet, "active": True},
            {"_id": 0},
        )
        .sort("granted_at", -1)
        .to_list(length=200)
    )

    return {"items": inventory}


router = shop_router