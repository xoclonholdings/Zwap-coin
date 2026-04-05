from fastapi import APIRouter, Request
from services.news_service import list_news

news_router = APIRouter(prefix="/news", tags=["News"])
router = news_router


@news_router.get("")
async def list_news_route(request: Request, limit: int = 50):
    db = request.app.state.db
    items = await list_news(db, limit=limit)
    return {"ok": True, "items": items}


@news_router.get("/ticker")
async def get_news_ticker(request: Request, limit: int = 10):
    db = request.app.state.db
    limit = max(1, min(limit, 20))

    items = await list_news(db, limit=limit)

    return items