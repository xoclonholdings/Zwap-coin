from fastapi import APIRouter

user_router = APIRouter(prefix="/user", tags=["User"])

# Export canonical name expected by server.py
router = user_router
