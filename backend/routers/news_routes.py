from fastapi import APIRouter, Query
from app.services.news_service import get_ticker_items

news_router = APIRouter(prefix="/news", tags=["News"])


@news_router.get("/ticker")
async def get_news_ticker(limit: int = Query(10, ge=1, le=20)):
    items = await get_ticker_items(limit=limit)
    return items