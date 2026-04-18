from fastapi import APIRouter

router = APIRouter(prefix="/enterprise", tags=["enterprise"])


@router.get("/health")
async def enterprise_health():
    return {
        "status": "ok",
        "message": "Enterprise foundation routes are active."
    }