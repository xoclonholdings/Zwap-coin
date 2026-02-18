from fastapi import APIRouter

move_router = APIRouter(prefix="/move", tags=["Move"])

# Export canonical name expected by server.py
router = move_router
