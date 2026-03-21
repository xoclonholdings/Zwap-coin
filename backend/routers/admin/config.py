from typing import Any, Dict

from fastapi import APIRouter, Depends, Request

import services.config_service as config_service

from .common import verify_admin, get_db

router = APIRouter()


@router.get("/config/system")
async def get_system_config(request: Request, _: None = Depends(verify_admin)):
    db = get_db(request)

    config = await db.configs.find_one({"key": "system_config"})

    if not config:
        default_config = {
            "maintenance_mode": False,
            "claims_paused": False,
        }

        await db.configs.update_one(
            {"key": "system_config"},
            {"$set": {"value": default_config}},
            upsert=True,
        )

        return default_config

    return config.get("value", {})


@router.put("/config/system")
async def update_system_config(
    config: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)

    await db.configs.update_one(
        {"key": "system_config"},
        {"$set": {"value": config}},
        upsert=True,
    )

    return config


@router.get("/config/walk")
async def get_walk_config(request: Request, _: None = Depends(verify_admin)):
    db = get_db(request)
    return await config_service.get_walk_to_earn_config(db)


@router.put("/config/walk")
async def update_walk_config(
    config: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await config_service.update_walk_to_earn_config(db, config)


@router.get("/config/games")
async def get_game_config(request: Request, _: None = Depends(verify_admin)):
    db = get_db(request)
    return await config_service.get_game_config(db)


@router.post("/config/games/{game_id}/toggle")
async def toggle_game_config(
    game_id: str,
    enabled: bool,
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await config_service.update_game_config(db, game_id, {"enabled": enabled})


@router.put("/config/games/{game_id}")
async def update_game_config(
    game_id: str,
    config: Dict[str, Any],
    request: Request,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await config_service.update_game_config(db, game_id, config)