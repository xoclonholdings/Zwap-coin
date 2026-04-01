from fastapi import APIRouter, Query, Request
from .activity_service import (
    get_activity_stream_for_user,
    build_activity_event,
    create_activity_event,
)

router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("/stream/{wallet_address}")
async def get_activity_stream(
    request: Request,
    wallet_address: str,
    limit: int = Query(default=8, ge=1, le=20),
):
    db = request.app.state.db

    return await get_activity_stream_for_user(
        db=db,
        wallet_address=wallet_address,
        limit=limit,
    )


@router.post("/seed")
async def seed_activity_event(request: Request):
    db = request.app.state.db

    event = build_activity_event(
        event_type="BADGE_MILESTONE",
        message="Nova just became a Finisher",
        actor_user_id="seed_user_1",
        actor_display="Nova",
        actor_badge="Finisher",
        region_key="us-oh-springfield",
        local_key="springfield-core",
        metadata={"source": "seed"},
    )

    event_id = await create_activity_event(db=db, event=event)

    return {
        "status": "ok",
        "event_id": event_id,
        "message": "Seed activity event created",
    }