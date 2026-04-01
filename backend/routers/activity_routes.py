from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("/stream/{wallet_address}")
async def get_activity_stream(
    wallet_address: str,
    limit: int = Query(default=8, ge=1, le=20)
):
    """
    V1 placeholder endpoint for Activity Stream.
    Returns Local / Region / Global buckets.
    Real DB wiring comes next.
    """

    now = datetime.now(timezone.utc).isoformat()

    return {
        "local": [
            {
                "id": "local_1",
                "event_type": "RING_COMPLETION",
                "message": "A Zwapper nearby just completed their rings",
                "reaction_counts": {
                    "heart": 0,
                    "fire": 0,
                    "clap": 0
                },
                "created_at": now
            }
        ],
        "region": [
            {
                "id": "region_1",
                "event_type": "MOVEMENT_ACTIVITY",
                "message": "3 people are active in this region",
                "reaction_counts": {
                    "heart": 0,
                    "fire": 0,
                    "clap": 0
                },
                "created_at": now
            }
        ],
        "global": [
            {
                "id": "global_1",
                "event_type": "BADGE_MILESTONE",
                "message": "Someone just became a Finisher",
                "reaction_counts": {
                    "heart": 0,
                    "fire": 0,
                    "clap": 0
                },
                "created_at": now
            }
        ]
    }