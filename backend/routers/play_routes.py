from fastapi import APIRouter

play_router = APIRouter(prefix="/play", tags=["Play"])

# Export canonical name expected by server.py
router = play_router
