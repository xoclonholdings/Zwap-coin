from fastapi import APIRouter, Depends, Request

import services.subscription_service as subscription_service

from .common import verify_admin, get_db

router = APIRouter()


# ===========================
# SUBSCRIPTIONS
# ===========================
@router.get("/subscriptions")
async def admin_list_subscriptions(
    request: Request,
    skip: int = 0,
    limit: int = 50,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await subscription_service.list_subscriptions(db, skip=skip, limit=limit)