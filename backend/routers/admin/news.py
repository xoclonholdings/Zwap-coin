from typing import Any, Dict

from fastapi import APIRouter, Depends, Request

import services.news_service as news_service

from .common import verify_admin, get_db

router = APIRouter()


@router.get("/news")
async def admin_list_news(
    request: Request,
    limit: int = 50,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await news_service.list_news(db, limit=limit)


@router.post("/news")
async def admin_create_news(
    item: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await news_service.create_news(db, item)


@router.delete("/news/{news_id}")
async def admin_delete_news(
    news_id: str,
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await news_service.delete_news(db, news_id)