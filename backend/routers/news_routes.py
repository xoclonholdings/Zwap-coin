from fastapi import APIRouter

news_router = APIRouter(prefix="/news", tags=["News"])
router = news_router

@news_router.get("")
async def list_news():
    return {"ok": True, "items": []}
