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
        # 🔵 YOU (priority, always first)
        {
            "title": "YOU: Someone just sent you an Assist. Accept it to keep going.",
            "url": "/assist",
            "source": "ZWAP",
            "category": "YOU",
        },
        {
            "title": "YOU: You received an Assist and gained zPts. Keep the momentum.",
            "url": "/move",
            "source": "ZWAP",
            "category": "YOU",
        },

        # 🟣 CRYPTO MARKET
        {
            "title": "Bitcoin continues to see institutional inflows",
            "url": "https://www.coindesk.com/",
            "source": "CoinDesk",
            "category": "CRYPTO_MARKET",
        },
        {
            "title": "Polygon ecosystem expands with new integrations",
            "url": "https://polygon.technology/",
            "source": "Polygon",
            "category": "CRYPTO_MARKET",
        },

        # 🟡 CURRENT EVENTS
        {
            "title": "Global markets react to new economic data",
            "url": "https://www.reuters.com/",
            "source": "Reuters",
            "category": "CURRENT_EVENTS",
        },

        # 🔷 WEB3 (NOT entertainment)
        {
            "title": "New Web3 gaming platforms are gaining traction",
            "url": "https://decrypt.co/",
            "source": "Decrypt",
            "category": "WEB3",
        },

        # 🟢 ENTERTAINMENT (REAL WORLD)
        {
            "title": "Major artists announce upcoming global tour",
            "url": "https://www.billboard.com/",
            "source": "Billboard",
            "category": "ENTERTAINMENT",
        },
    ]

    return items[:limit]