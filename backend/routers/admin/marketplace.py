from typing import Any, Dict

from fastapi import APIRouter, Depends, Request

import services.marketplace_service as marketplace_service

from .common import verify_admin, get_db

router = APIRouter()


@router.get("/marketplace/items")
async def list_marketplace_items(request: Request, _: None = Depends(verify_admin)):
    db = get_db(request)
    return await marketplace_service.list_items(db)


@router.post("/marketplace/items")
async def create_marketplace_item(
    item: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await marketplace_service.create_item(db, item)


@router.put("/marketplace/items/{item_id}")
async def update_marketplace_item(
    item_id: str,
    item: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await marketplace_service.update_item(db, item_id, item)


@router.delete("/marketplace/items/{item_id}")
async def delete_marketplace_item(
    item_id: str,
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await marketplace_service.delete_item(db, item_id)


@router.get("/marketplace/orders")
async def list_marketplace_orders(
    request: Request,
    limit: int = 100,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await marketplace_service.list_orders(db, limit=limit)