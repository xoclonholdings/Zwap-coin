from fastapi import APIRouter

shop_router = APIRouter(prefix="/shop", tags=["Shop"])

# Export canonical name expected by server.py
router = shop_router
