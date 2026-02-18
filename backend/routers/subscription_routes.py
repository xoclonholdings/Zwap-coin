from fastapi import APIRouter

subscription_router = APIRouter(prefix="/subscription", tags=["Subscription"])

# Export canonical name expected by server.py
router = subscription_router
