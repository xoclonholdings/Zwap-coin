from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional


wallet_router = APIRouter(prefix="/wallet", tags=["Wallet"])


CONVERSION_RATE_ZPTS_PER_ZWAP = 1000


class ConvertZPtsPayload(BaseModel):
    email: Optional[str] = None
    walletAddress: Optional[str] = None
    wallet_address: Optional[str] = None
    zpts_amount: Optional[int] = None


class ClaimZwapPayload(BaseModel):
    email: Optional[str] = None
    walletAddress: Optional[str] = None
    wallet_address: Optional[str] = None
    zwap_amount: Optional[float] = None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _normalize_email(value: Optional[str]) -> str:
    return str(value or "").strip().lower()


def _normalize_wallet(value: Optional[str]) -> str:
    return str(value or "").strip().lower()


def _get_payload_wallet(payload) -> str:
    return _normalize_wallet(
        getattr(payload, "walletAddress", None)
        or getattr(payload, "wallet_address", None)
    )


async def _find_user(db, email: str = "", wallet_address: str = ""):
    if email:
      user = await db.users.find_one(
          {
              "$or": [
                  {"email": email},
                  {"email_address": email},
              ]
          }
      )
      if user:
          return user

    if wallet_address:
        return await db.users.find_one(
            {
                "$or": [
                    {"wallet_address": wallet_address},
                    {"walletAddress": wallet_address},
                ]
            }
        )

    return None


@wallet_router.get("/swap-config")
async def get_wallet_swap_config(request: Request):
    """
    Public config for the V1 Swap page.

    This keeps the app-facing model aligned with:
    Convert | Claim | Swap

    User-facing symbols stay simple.
    Route symbols stay Polygon-correct.
    """
    return {
        "version": 3,
        "status": {
            "swap_visible": True,
            "swap_unlocked": False,
            "unlock_phase": "phase_c",
            "unlock_reason": "Swap unlocks when the system is ready.",
        },
        "conversion": {
            "enabled": True,
            "rate_zpts_per_zwap": CONVERSION_RATE_ZPTS_PER_ZWAP,
            "minimum_zpts": CONVERSION_RATE_ZPTS_PER_ZWAP,
            "source": "zPts",
            "destination": "claimable_ZWAP",
        },
        "claim": {
            "enabled": True,
            "wallet_provider": "privy",
            "requires_wallet": True,
            "requires_signature": True,
            "source": "claimable_ZWAP",
            "destination": "wallet_ZWAP",
        },
        "swap": {
            "enabled": True,
            "locked": True,
            "wallet_provider": "privy",
            "route_provider": "lifi",
            "mode": "embedded",
            "requires_wallet": True,
            "requires_signature": True,
            "external_redirect": False,
        },
        "featured_swaps": [
            {
                "id": "zwap-btc",
                "from_token": "ZWAP",
                "to_token": "BTC",
                "display_symbol": "BTC",
                "display_name": "Bitcoin",
                "display_label": "Bitcoin (BTC)",
                "route_token_symbol": "WBTC",
                "network": "polygon",
                "enabled": True,
                "locked": True,
            },
            {
                "id": "zwap-eth",
                "from_token": "ZWAP",
                "to_token": "ETH",
                "display_symbol": "ETH",
                "display_name": "Ethereum",
                "display_label": "Ethereum (ETH)",
                "route_token_symbol": "WETH",
                "network": "polygon",
                "enabled": True,
                "locked": True,
            },
            {
                "id": "zwap-pol",
                "from_token": "ZWAP",
                "to_token": "POL",
                "display_symbol": "POL",
                "display_name": "Polygon",
                "display_label": "Polygon (POL)",
                "route_token_symbol": "POL",
                "network": "polygon",
                "enabled": True,
                "locked": True,
            },
            {
                "id": "zwap-usdc",
                "from_token": "ZWAP",
                "to_token": "USDC",
                "display_symbol": "USDC",
                "display_name": "USD Coin",
                "display_label": "USD Coin (USDC)",
                "route_token_symbol": "USDC",
                "network": "polygon",
                "enabled": True,
                "locked": True,
            },
        ],
    }


@wallet_router.post("/convert-zpts")
async def convert_zpts(request: Request, payload: ConvertZPtsPayload):
    """
    Converts zPts into claimable ZWAP.

    This does NOT send ZWAP to wallet.
    This does NOT increase wallet-held ZWAP.

    Flow:
    zPts -> claimable_zwap
    """
    db = request.app.state.db

    email = _normalize_email(payload.email)
    wallet = _get_payload_wallet(payload)

    user = await _find_user(db, email=email, wallet_address=wallet)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    current_zpts = int(user.get("zpts_balance", 0) or 0)

    requested_amount = payload.zpts_amount
    if requested_amount is None:
        requested_amount = current_zpts

    zpts_amount = int(requested_amount or 0)

    if zpts_amount < CONVERSION_RATE_ZPTS_PER_ZWAP:
        raise HTTPException(
            status_code=400,
            detail="Minimum conversion is 1000 zPts",
        )

    if current_zpts < CONVERSION_RATE_ZPTS_PER_ZWAP:
        raise HTTPException(
            status_code=400,
            detail="Insufficient zPts",
        )

    zwap_delta = zpts_amount // CONVERSION_RATE_ZPTS_PER_ZWAP
    zpts_spent = zwap_delta * CONVERSION_RATE_ZPTS_PER_ZWAP

    if zwap_delta <= 0 or zpts_spent <= 0:
        raise HTTPException(
            status_code=400,
            detail="Conversion amount is too low",
        )

    if current_zpts < zpts_spent:
        raise HTTPException(
            status_code=400,
            detail="Insufficient zPts",
        )

    user_id = user.get("_id")

    result = await db.users.update_one(
        {
            "_id": user_id,
            "zpts_balance": {"$gte": zpts_spent},
        },
        {
            "$inc": {
                "zpts_balance": -zpts_spent,
                "claimable_zwap": zwap_delta,
            },
            "$set": {
                "updated_at": _now_iso(),
            },
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Conversion failed")

    await db.ledger.insert_one(
        {
            "type": "CONVERT_ZPTS_TO_CLAIMABLE_ZWAP",
            "user_id": str(user_id),
            "email": email or user.get("email") or user.get("email_address") or "",
            "wallet_address": wallet
            or user.get("wallet_address")
            or user.get("walletAddress")
            or "",
            "zpts_delta": -zpts_spent,
            "claimable_zwap_delta": zwap_delta,
            "rate": CONVERSION_RATE_ZPTS_PER_ZWAP,
            "created_at": _now_iso(),
        }
    )

    user_after = await db.users.find_one({"_id": user_id})

    return {
        "success": True,
        "zpts_after": user_after.get("zpts_balance", 0),
        "new_zpts_balance": user_after.get("zpts_balance", 0),
        "claimable_zwap": user_after.get("claimable_zwap", 0),
        "zpts_spent": zpts_spent,
        "zwap_claimable_received": zwap_delta,
        "rate": CONVERSION_RATE_ZPTS_PER_ZWAP,
    }


@wallet_router.post("/claim-zwap")
async def claim_zwap(request: Request, payload: ClaimZwapPayload):
    """
    Prepares the claim step.

    This route does NOT fake an on-chain transfer.
    Privy + contract claim wiring must complete the actual wallet transaction.

    Current purpose:
    - validate user
    - validate wallet
    - validate claimable balance
    - return claim-ready data for frontend / future contract integration
    """
    db = request.app.state.db

    email = _normalize_email(payload.email)
    wallet = _get_payload_wallet(payload)

    if not wallet:
        raise HTTPException(status_code=400, detail="Missing walletAddress")

    user = await _find_user(db, email=email, wallet_address=wallet)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    claimable = float(user.get("claimable_zwap", 0) or 0)

    requested_amount = payload.zwap_amount
    if requested_amount is None:
        requested_amount = claimable

    zwap_amount = float(requested_amount or 0)

    if zwap_amount <= 0:
        raise HTTPException(status_code=400, detail="Nothing to claim")

    if claimable < zwap_amount:
        raise HTTPException(status_code=400, detail="Insufficient claimable ZWAP")

    await db.ledger.insert_one(
        {
            "type": "CLAIM_ZWAP_REQUESTED",
            "user_id": str(user.get("_id")),
            "email": email or user.get("email") or user.get("email_address") or "",
            "wallet_address": wallet,
            "claimable_zwap_requested": zwap_amount,
            "wallet_provider": "privy",
            "status": "pending_contract_integration",
            "created_at": _now_iso(),
        }
    )

    return {
        "success": True,
        "claim_ready": True,
        "requires_wallet": True,
        "requires_signature": True,
        "wallet_provider": "privy",
        "wallet_address": wallet,
        "claimable_zwap": claimable,
        "zwap_amount": zwap_amount,
        "status": "pending_contract_integration",
        "message": "Claim is ready. Contract transaction wiring is required before moving ZWAP to wallet.",
    }


router = wallet_router