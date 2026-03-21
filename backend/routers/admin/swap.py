from typing import Any, Dict

from fastapi import APIRouter, Depends, Request

import services.swap_service as swap_service

from .common import verify_admin, get_db

router = APIRouter()


@router.get("/config/swap")
async def get_swap_config(request: Request, _: None = Depends(verify_admin)):
    db = get_db(request)
    return await swap_service.get_swap_config(db)


@router.put("/config/swap/{token_symbol}")
async def update_swap_config(
    token_symbol: str,
    config: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await swap_service.update_swap_config(db, token_symbol, config)