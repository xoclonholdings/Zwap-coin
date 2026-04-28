from datetime import datetime, timezone
from typing import List, Optional
import re
import uuid

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict

shop_router = APIRouter(tags=["Shop"])


# ---------------------------
# Models
# ---------------------------

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
    email: str
    item_id: str
    payment_type: str = "zpts"


# ---------------------------
# Helpers
# ---------------------------

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_email(email: Optional[str]) -> str:
    return str(email or "").lower().strip()


def normalize_id(value: Optional[str]) -> str:
    if value is None:
        return ""

    normalized = str(value).strip().lower()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    normalized = re.sub(r"-+", "-", normalized)
    return normalized.strip("-")


def title_from_category_id(category_id: str) -> str:
    safe = str(category_id or "general").replace("-", " ").replace("_", " ")
    return safe.title()


# ---------------------------
# GET CATEGORIES
# ---------------------------

@shop_router.get("/shop/categories", response_model=List[ShopCategory])
async def get_shop_categories(request: Request):
    db = request.app.state.db

    saved = (
        await db.shop_categories.find({"active": True}, {"_id": 0})
        .sort("sort_order", 1)
        .to_list(length=100)
    )

    if saved:
        return [
            ShopCategory(
                id=normalize_id(c.get("id")),
                label=c.get("label") or "Category",
                description=c.get("description", ""),
                sort_order=int(c.get("sort_order", 0) or 0),
                active=True,
            )
            for c in saved
            if normalize_id(c.get("id"))
        ]

    items = await db.shop_items.find(
        {"active": True, "in_stock": True},
        {"_id": 0, "category": 1},
    ).to_list(length=200)

    category_ids = sorted({
        normalize_id(i.get("category", "general"))
        for i in items
        if normalize_id(i.get("category"))
    })

    return [
        ShopCategory(
            id=cid,
            label=title_from_category_id(cid),
            sort_order=i,
            active=True,
        )
        for i, cid in enumerate(category_ids)
    ]


# ---------------------------
# GET ITEMS
# ---------------------------

@shop_router.get("/shop/items", response_model=List[ShopItem])
async def get_shop_items(request: Request):
    db = request.app.state.db

    items = await db.shop_items.find(
        {"active": True, "in_stock": True},
        {"_id": 0},
    ).sort([("category", 1), ("name", 1)]).to_list(length=200)

    return [
        ShopItem(
            id=normalize_id(i.get("id")),
            name=i.get("name", ""),
            description=i.get("description", ""),
            payment_method=i.get("payment_method", "zpts"),
            price_zpts=i.get("price_zpts"),
            price_zwap=i.get("price_zwap"),
            price_stripe=i.get("price_stripe"),
            image_url=i.get("image_url"),
            category=normalize_id(i.get("category", "general")) or "general",
            subcategory=normalize_id(i.get("subcategory")) if i.get("subcategory") else None,
            item_type=i.get("item_type", "custom"),
            rotation=i.get("rotation", "Custom"),
            phase=i.get("phase", "Phase A"),
            in_stock=True,
            active=True,
            plus_only=bool(i.get("plus_only", False)),
            max_quantity=i.get("max_quantity"),
            fulfillment_type=i.get("fulfillment_type", "none"),
            download_url=i.get("download_url"),
            external_url=i.get("external_url"),
            fulfillment_notes=i.get("fulfillment_notes"),
        )
        for i in items
        if normalize_id(i.get("id"))
    ]


# ---------------------------
# PURCHASE (EMAIL ONLY)
# ---------------------------

@shop_router.post("/shop/purchase")
async def purchase_item(purchase: PurchaseRequest, request: Request):
    db = request.app.state.db

    email = normalize_email(purchase.email)
    item_id = normalize_id(purchase.item_id)
    payment_type = purchase.payment_type.lower().strip()

    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    if not item_id:
        raise HTTPException(status_code=400, detail="Item id required")

    if payment_type not in {"zpts", "zwap"}:
        raise HTTPException(status_code=400, detail="Invalid payment type")

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    item = await db.shop_items.find_one({
        "id": item_id,
        "active": True,
        "in_stock": True,
    })

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.get("plus_only") and user.get("tier") not in {"plus", "zitizen"}:
        raise HTTPException(status_code=403, detail="Zitizen required")

    # ---------------------------
    # PAYMENT
    # ---------------------------

    if payment_type == "zpts":
        price = int(item.get("price_zpts") or 0)

        if user.get("zpts_balance", 0) < price:
            raise HTTPException(status_code=400, detail="Insufficient zPts")

        update = {"$inc": {"zpts_balance": -price}}

    else:
        price = float(item.get("price_zwap") or 0)

        if user.get("zwap_balance", 0) < price:
            raise HTTPException(status_code=400, detail="Insufficient ZWAP")

        update = {"$inc": {"zwap_balance": -price}}

    now = utc_now_iso()
    purchase_id = str(uuid.uuid4())

    update["$set"] = {"updated_at": now}

    await db.users.update_one({"email": email}, update)

    # ---------------------------
    # RECORD PURCHASE
    # ---------------------------

    await db.shop_purchases.insert_one({
        "id": purchase_id,
        "email": email,
        "item_id": item_id,
        "item_name": item.get("name"),
        "price": price,
        "currency": payment_type,
        "created_at": now,
    })

    # ---------------------------
    # ACTIVITY LOG (CRITICAL)
    # ---------------------------

    await db.activity_logs.insert_one({
        "id": str(uuid.uuid4()),
        "email": email,
        "type": "shop_purchase",
        "item_id": item_id,
        "item_name": item.get("name"),
        "message": f"Purchased {item.get('name')}",
        "priority": "normal",
        "created_at": now,
    })

    updated_user = await db.users.find_one({"email": email}, {"_id": 0})

    return {
        "success": True,
        "item": item.get("name"),
        "price": price,
        "currency": payment_type,
        "zpts_balance": updated_user.get("zpts_balance", 0),
        "zwap_balance": updated_user.get("zwap_balance", 0),
    }


router = shop_router