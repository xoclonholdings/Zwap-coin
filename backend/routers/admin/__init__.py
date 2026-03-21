from fastapi import APIRouter

from .dashboard import router as dashboard_router
from .users import router as users_router
from .marketplace import router as marketplace_router
from .swap import router as swap_router
from .treasury import router as treasury_router
from .news import router as news_router
from .analytics import router as analytics_router

admin_router = APIRouter(prefix="/admin", tags=["Admin"])

admin_router.include_router(dashboard_router)
admin_router.include_router(users_router)
admin_router.include_router(marketplace_router)
admin_router.include_router(swap_router)
admin_router.include_router(treasury_router)
admin_router.include_router(news_router)
admin_router.include_router(analytics_router)

# Keep legacy admin routes active while we continue splitting
from routers import admin_routes  # noqa: F401

router = admin_router