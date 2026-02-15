from fastapi import APIRouter
learn_router = APIRouter(prefix="/learn", tags=["Learn"])

# Export canonical name expected by server.py
router = learn_router
