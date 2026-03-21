from fastapi import APIRouter

from .dashboard import router as dashboard_router
from .users import router as users_router

admin_router = APIRouter(prefix="/admin", tags=["Admin"])
admin_router.include_router(dashboard_router)
admin_router.include_router(users_router)

router = admin_router