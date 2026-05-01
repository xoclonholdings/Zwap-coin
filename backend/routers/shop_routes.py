from datetime import datetime, timezone
from typing import List, Optional
import re
import uuid

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict

shop_router = APIRouter(tags=["Shop"])


DEFAULT_SHOP_CATEGORIES = [
    {
        "id": "bundle-combos",
        "label": "Combos",
        "group": "Bundles",
        "description": "Bundles and grouped value packs.",
        "sort_order": 0,
        "active": True,
    },
    {
        "id": "move-boosts",
        "label": "Boosts",
        "group": "Move",
        "description": "Movement boost items.",
        "sort_order": 1,
        "active": True,
    },
    {
        "id": "play-games",
        "label": "Games",
        "group": "Play",
        "description": "Playable game unlocks and game items.",
        "sort_order": 2,
        "active": True,
    },
    {
        "id": "play-boosts",
        "label": "Boosts",
        "group": "Play",
        "description": "Arcade boost items.",
        "sort_order": 3,
        "active": True,
    },
    {
        "id": "learn-ebooks",
        "label": "eBooks",
        "group": "Learn",
        "description": "Learning and eBook items.",
        "sort_order": 4,
        "active": True,
    },
    {
        "id": "profile-rings",
        "label": "Rings",
        "group": "Profile",
        "description": "Profile ring cosmetics.",
        "sort_order": 5,
        "active": True,
    },
    {
        "id": "profile-themes",
        "label": "Themes",
        "group": "Profile",
        "description": "Profile theme cosmetics.",
        "sort_order": 6,
        "active": True,
    },
    {
        "id": "garden-items",
        "label": "Garden",
        "group": "Garden",
        "description": "Garden progression and cosmetic items.",
        "sort_order": 7,
        "active": True,
    },
]


class ShopCategory(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    label: str
    group: str = "Shop"
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


def group_from_category_id(category_id: str) -> str:
    safe = normalize_id(category_id)

    if safe.startswith("bundle-"):
        return "Bundles"

    if safe.startswith("move-"):
        return "Move"

    if safe.startswith("play-"):
        return "Play"

    if safe.startswith("learn-"):
        return "Learn"

    if safe.startswith("profile-"):
        return "Profile"

    if safe.startswith("garden-"):
        return "Garden"

    return "Shop"


def normalize_legacy_category_id(category_id: Optional[str]) -> str:
    safe = normalize_id(category_id)

    legacy_map = {
        "boosts": "move-boosts",
        "ebooks": "learn-ebooks",
        "cosmetics": "profile-rings",
        "utility": "bundle-combos",
        "featured": "bundle-combos",
        "general": "bundle-combos",
    }

    return legacy_map.get(safe, safe or "bundle-combos")


def normalize_payment_method(value: Optional[str]) -> str:
    safe = str(value or "zpts").lower().strip()

    if safe in {"zpts", "zwap", "stripe"}:
        return safe

    return "zpts"


def build_category_response(category: dict, index: int = 0) -> ShopCategory:
    category_id = normalize_legacy_category_id(category.get("id"))

    return ShopCategory(
        id=category_id,
        label=category.get("label") or category.get("name") or title_from_category_id(category_id),
        group=category.get("group") or group_from_category_id(category_id),
        description=category.get("description", ""),
        sort_order=int(category.get("sort_order", index) or 0),
        active=category.get("active") is not False,
    )


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
            build_category_response(category, index)
            for index, category in enumerate(saved)
            if normalize_legacy_category_id(category.get("id"))
        ]

    items = await db.shop_items.find(
        {"active": True, "in_stock": True},
        {"_id": 0, "category": 1},
    ).to_list(length=200)

    category_ids = sorted({
        normalize_legacy_category_id(item.get("category", "bundle-combos"))
        for item in items
        if normalize_legacy_category_id(item.get("category"))
    })

    if not category_ids:
        return [
            build_category_response(category, index)
            for index, category in enumerate(DEFAULT_SHOP_CATEGORIES)
        ]

    return [
        ShopCategory(
            id=category_id,
            label=title_from_category_id(category_id),
            group=group_from_category_id(category_id),
            sort_order=index,
            active=True,
        )
        for index, category_id in enumerate(category_ids)
    ]


@shop_router.get("/shop/items", response_model=List[ShopItem])
async def get_shop_items(request: Request):
    db = request.app.state.db

    items = await db.shop_items.find(
        {"active": True, "in_stock": True},
        {"_id": 0},
    ).sort([("category", 1), ("name", 1)]).to_list(length=200)

    return [
        ShopItem(
            id=normalize_id(item.get("id")),
            name=item.get("name", ""),
            description=item.get("description", ""),
            payment_method=normalize_payment_method(item.get("payment_method")),
            price_zpts=item.get("price_zpts"),
            price_zwap=item.get("price_zwap"),
            price_stripe=item.get("price_stripe"),
            image_url=item.get("image_url"),
            category=normalize_legacy_category_id(item.get("category", "bundle-combos")),
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
        if normalize_id(item.get("id"))
    ]


@shop_router.post("/shop/purchase")
async def purchase_item(purchase: PurchaseRequest, request: Request):
    db = request.app.state.db

    email = normalize_email(purchase.email)
    item_id = normalize_id(purchase.item_id)
    payment_type = normalize_payment_method(purchase.payment_type)

    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    if not item_id:
        raise HTTPException(status_code=400, detail="Item id required")

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

    item_payment_method = normalize_payment_method(item.get("payment_method"))

    if payment_type != item_payment_method:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid payment type for this item. Expected {item_payment_method}.",
        )

    if item_payment_method == "stripe":
        raise HTTPException(
            status_code=501,
            detail="Stripe checkout must use the Stripe checkout flow.",
        )

    if item.get("plus_only") and user.get("tier") not in {"plus", "zitizen"}:
        raise HTTPException(status_code=403, detail="Zitizen required")

    if item_payment_method == "zpts":
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

    await db.shop_purchases.insert_one({
        "id": purchase_id,
        "email": email,
        "item_id": item_id,
        "item_name": item.get("name"),
        "price": price,
        "currency": item_payment_method,
        "created_at": now,
    })

    await db.activity_logs.insert_one({
        "id": str(uuid.uuid4()),
        "email": email,
        "type": "shop_purchase",
        "item_id": item_id,
        "item_name": item.get("name"),
        "zpts": -price if item_payment_method == "zpts" else 0,
        "zwap": -price if item_payment_method == "zwap" else 0,
        "message": f"Purchased {item.get('name')}",
        "priority": "normal",
        "completed": True,
        "created_at": now,
        "metadata": {
            "purchase_id": purchase_id,
            "currency": item_payment_method,
            "price": price,
            "category": normalize_legacy_category_id(item.get("category")),
        },
    })

    updated_user = await db.users.find_one({"email": email}, {"_id": 0})

    return {
        "success": True,
        "item": item.get("name"),
        "item_id": item_id,
        "price": price,
        "currency": item_payment_method,
        "zpts_balance": updated_user.get("zpts_balance", 0),
        "zwap_balance": updated_user.get("zwap_balance", 0),
    }


router = shop_router