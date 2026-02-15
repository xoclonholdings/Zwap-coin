from fastapi import APIRouter

swap_router = APIRouter(prefix="/swap", tags=["Swap"])

# Export canonical name expected by server.py
router = swap_router
