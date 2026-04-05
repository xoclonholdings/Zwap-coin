from fastapi import APIRouter

news_router = APIRouter(prefix="/news", tags=["News"])
router = news_router


@news_router.get("")
async def list_news():
    return {"ok": True, "items": []}


@news_router.get("/ticker")
async def get_news_ticker(limit: int = 10):
    limit = max(1, min(limit, 20))

    items = [
        {
            "title": "Bitcoin continues to see institutional inflows",
            "url": "https://www.coindesk.com/",
            "source": "CoinDesk",
            "category": "CRYPTO_MARKET",
        },
        {
            "title": "Global markets react to new economic data",
            "url": "https://www.reuters.com/",
            "source": "Reuters",
            "category": "CURRENT_EVENTS",
        },
        {
            "title": "New Web3 gaming platforms are gaining traction",
            "url": "https://decrypt.co/",
            "source": "Decrypt",
            "category": "ENTERTAINMENT",
        },
        {
            "title": "Polygon ecosystem expands with new integrations",
            "url": "https://polygon.technology/",
            "source": "Polygon",
            "category": "CRYPTO_MARKET",
        },
    ]

    return items[:limit]