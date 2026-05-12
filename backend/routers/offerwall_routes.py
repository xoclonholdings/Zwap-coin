"""
ZWAP! V1 Offerwall Router
=========================

Receives verified offerwall / sponsored challenge callbacks and credits
a user's cash Tip Jar after server-side validation.

V1 behavior:
- Frontend never awards cash directly
- Provider callbacks are validated before reward credit
- Duplicate transactions are ignored
- Cash rewards stay separate from zPts and ZWAP
- This does not bypass reward_service
- This does not affect zPts caps
"""

import hashlib
import hmac
import os
import time
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel, Field


router = APIRouter(prefix="/offerwall", tags=["Offerwall"])


OFFERWALL_SECRET = os.getenv("OFFERWALL_CALLBACK_SECRET", "")
OFFERWALL_PROVIDER_NAME = os.getenv("OFFERWALL_PROVIDER_NAME", "tapjoy")


class OfferwallCallback(BaseModel):
    provider: str = Field(default=OFFERWALL_PROVIDER_NAME)
    user_id: str
    offer_id: str
    campaign_id: Optional[str] = ""
    transaction_id: str
    reward_amount: float
    reward_currency: str = "USD"
    status: str = "completed"
    raw_payload: dict[str, Any] = Field(default_factory=dict)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_status(value: str) -> str:
    return str(value or "").strip().lower()


def safe_float(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def get_database(request: Request):
    """
    Supports common FastAPI Mongo attachment patterns without forcing a rewrite.

    Preferred:
    - request.app.database

    Fallbacks:
    - request.app.state.db
    - request.app.mongodb
    """
    db = getattr(request.app, "database", None)

    if db is not None:
        return db

    state = getattr(request.app, "state", None)

    if state is not None:
      db = getattr(state, "db", None)

      if db is not None:
          return db

    db = getattr(request.app, "mongodb", None)

    if db is not None:
        return db

    raise HTTPException(
        status_code=500,
        detail="Database connection is not available for offerwall callbacks.",
    )


def build_signature_base(payload: dict[str, Any]) -> str:
    """
    Creates a deterministic signing base from callback fields.

    Provider callback formats differ. This gives ZWAP! a stable internal
    validation format for providers that allow custom signed payloads.
    """
    keys = [
        "user_id",
        "offer_id",
        "campaign_id",
        "transaction_id",
        "reward_amount",
        "reward_currency",
        "status",
    ]

    return "|".join(str(payload.get(key, "") or "") for key in keys)


def verify_signature(payload: dict[str, Any], signature: Optional[str]) -> bool:
    if not OFFERWALL_SECRET:
        return False

    if not signature:
        return False

    base = build_signature_base(payload)
    expected = hmac.new(
        OFFERWALL_SECRET.encode("utf-8"),
        base.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(expected, str(signature))


async def find_user(db, user_id: str):
    return await db.users.find_one(
        {
            "$or": [
                {"_id": user_id},
                {"id": user_id},
                {"user_id": user_id},
                {"email": user_id},
            ]
        }
    )


async def credit_tip_jar(
    db,
    *,
    user_id: str,
    transaction_id: str,
    amount: float,
    currency: str,
    provider: str,
):
    await db.cash_reward_wallets.update_one(
        {"user_id": user_id},
        {
            "$inc": {
                "tip_jar_balance": amount,
                "lifetime_cash_rewards": amount,
            },
            "$set": {
                "currency": currency,
                "updated_at": utc_now(),
                "last_provider": provider,
                "last_transaction_id": transaction_id,
            },
            "$setOnInsert": {
                "user_id": user_id,
                "created_at": utc_now(),
            },
        },
        upsert=True,
    )


@router.post("/callback")
async def receive_offerwall_callback(
    request: Request,
    callback: OfferwallCallback,
    signature: Optional[str] = Query(default=None),
):
    db = get_database(request)

    status = normalize_status(callback.status)
    amount = safe_float(callback.reward_amount)

    payload = callback.model_dump()

    if status not in {"completed", "approved", "rewarded"}:
        raise HTTPException(
            status_code=400,
            detail="Offerwall callback status is not rewardable.",
        )

    if amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Offerwall reward amount must be greater than zero.",
        )

    if not verify_signature(payload, signature):
        raise HTTPException(
            status_code=401,
            detail="Invalid offerwall callback signature.",
        )

    existing_transaction = await db.offerwall_transactions.find_one(
        {"transaction_id": callback.transaction_id}
    )

    if existing_transaction:
        return {
            "ok": True,
            "duplicate": True,
            "message": "Transaction already processed.",
        }

    user = await find_user(db, callback.user_id)

    if not user:
        await db.offerwall_transactions.insert_one(
            {
                **payload,
                "status": "rejected",
                "rejection_reason": "user_not_found",
                "created_at": utc_now(),
                "received_at": utc_now(),
            }
        )

        raise HTTPException(
            status_code=404,
            detail="User not found for offerwall reward.",
        )

    await db.offerwall_transactions.insert_one(
        {
            **payload,
            "status": "credited",
            "credited_amount": amount,
            "credited_currency": callback.reward_currency,
            "created_at": utc_now(),
            "received_at": utc_now(),
            "credited_at": utc_now(),
        }
    )

    await credit_tip_jar(
        db,
        user_id=callback.user_id,
        transaction_id=callback.transaction_id,
        amount=amount,
        currency=callback.reward_currency,
        provider=callback.provider,
    )

    return {
        "ok": True,
        "credited": True,
        "user_id": callback.user_id,
        "amount": amount,
        "currency": callback.reward_currency,
        "transaction_id": callback.transaction_id,
    }


@router.get("/wallet/{user_id}")
async def get_cash_reward_wallet(request: Request, user_id: str):
    db = get_database(request)

    wallet = await db.cash_reward_wallets.find_one(
        {"user_id": user_id},
        {"_id": 0},
    )

    if not wallet:
        return {
            "user_id": user_id,
            "tip_jar_balance": 0,
            "lifetime_cash_rewards": 0,
            "currency": "USD",
        }

    return wallet


@router.get("/health")
async def offerwall_health():
    return {
        "ok": True,
        "provider": OFFERWALL_PROVIDER_NAME,
        "signature_required": True,
        "timestamp": int(time.time()),
    }