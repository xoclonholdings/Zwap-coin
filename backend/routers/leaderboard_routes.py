from fastapi import APIRouter

leaderboard_router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

# Export canonical name expected by server.py
router = leaderboard_router
