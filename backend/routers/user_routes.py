from datetime import datetime, timezone
from typing import Optional
import uuid

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict

from services.badge_service import evaluate_badges, persist_badge_updates
from services.leaderboard_service import generate_username

user_router = APIRouter(prefix="/users", tags=["User"])


class UserCreate(BaseModel):
    wallet_address: str


class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    wallet_address: str
    username: str
    zwap_balance: float = 0.0
    zpts_balance: int = 0
    daily_streak: int = 0
    last_daily_claim: Optional[str] = None
    tier: str = "starter"
    subscription_id: Optional[str] = None
    subscription_status: Optional[str] = None
    total_steps: int = 0
    daily_steps: int = 0
    daily_zpts_earned: int = 0
    last_zpts_reset: Optional[str] = None
    games_played: int = 0
    total_earned: float = 0.0
    created_at: str

    # enterprise anchor fields
    organization_id: Optional[str] = None
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    department_name: Optional[str] = None
    team_name: Optional[str] = None
    manager_id: Optional[str] = None
    member_role: Optional[str] = None
    employee_status: Optional[str] = None
    family_group_id: Optional[str] = None
    organization_joined_at: Optional[str] = None


class AssistSendRequest(BaseModel):
    sender_wallet: str
    recipient_wallet: str
    amount: int
    message: Optional[str] = None


class AssistAcceptRequest(BaseModel):
    assist_id: str
    recipient_wallet: str


class AssistOpportunityResponse(BaseModel):
    recipient_user_id: str
    recipient_wallet: str
    goal_label: str
    amount_zpts: int = 10


def get_assist_limits_for_tier(tier: str) -> dict:
    safe_tier = str(tier or "starter").lower()

    if safe_tier in ["plus", "zitizen"]:
        return {
            "send_cap": 10,
            "receive_cap": 10,
        }

    return {
        "send_cap": 5,
        "receive_cap": 5,
    }


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def ensure_username(user: dict) -> dict:
    if not user.get("username"):
        user["username"] = generate_username(user.get("wallet_address", ""))
    return user


async def persist_missing_username(db, user: dict) -> dict:
    if not user.get("username"):
        generated = generate_username(user.get("wallet_address", ""))
        await db.users.update_one(
            {"wallet_address": user["wallet_address"]},
            {"$set": {"username": generated}},
        )
        user["username"] = generated
    return user


async def check_and_reset_daily_assist_counts(db, user: dict) -> dict:
    now = datetime.now(timezone.utc)
    last_reset = user.get("last_assist_reset")

    if last_reset:
        last_reset_dt = datetime.fromisoformat(last_reset.replace("Z", "+00:00"))
        if last_reset_dt.date() < now.date():
            await db.users.update_one(
                {"wallet_address": user["wallet_address"]},
                {
                    "$set": {
                        "daily_assists_sent": 0,
                        "daily_assists_received": 0,
                        "daily_first_assist_bonus_claimed": False,
                        "last_assist_reset": now.isoformat(),
                    }
                },
            )
            user["daily_assists_sent"] = 0
            user["daily_assists_received"] = 0
            user["daily_first_assist_bonus_claimed"] = False
            user["last_assist_reset"] = now.isoformat()
    else:
        await db.users.update_one(
            {"wallet_address": user["wallet_address"]},
            {
                "$set": {
                    "daily_assists_sent": 0,
                    "daily_assists_received": 0,
                    "daily_first_assist_bonus_claimed": False,
                    "last_assist_reset": now.isoformat(),
                }
            },
        )
        user["daily_assists_sent"] = 0
        user["daily_assists_received"] = 0
        user["daily_first_assist_bonus_claimed"] = False
        user["last_assist_reset"] = now.isoformat()

    return user


@user_router.post("/connect", response_model=UserResponse)
async def connect_wallet(user_data: UserCreate, request: Request):
    """Connect wallet and create/get user."""
    db = request.app.state.db
    wallet = user_data.wallet_address.lower()

    try:
        existing = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
        if existing:
            existing = await persist_missing_username(db, existing)
            return UserResponse(**existing)

        now_iso = utc_now_iso()
        generated_username = generate_username(wallet)

        new_user = {
            "id": str(uuid.uuid4()),
            "wallet_address": wallet,
            "username": generated_username,
            "zwap_balance": 100.0,
            "zpts_balance": 0,
            "tier": "starter",
            "subscription_id": None,
            "subscription_status": None,
            "total_steps": 0,
            "daily_steps": 0,
            "daily_zpts_earned": 0,
            "daily_streak": 0,
            "last_daily_claim": None,
            "last_zpts_reset": now_iso,
            "games_played": 0,
            "games_played_today": 0,
            "total_earned": 100.0,
            "created_at": now_iso,

            # assist state
            "daily_assists_sent": 0,
            "daily_assists_received": 0,
            "daily_first_assist_bonus_claimed": False,
            "last_assist_reset": now_iso,

            # badge source counters
            "badge_login_days": 0,
            "badge_full_loop_days": 0,
            "badge_step_claims": 0,
            "badge_sustained_move_days": 0,
            "badge_assists_sent": 0,
            "badge_deep_engagement": 0,
            "badge_zpts_earned": 0,
            "badge_referrals": 0,
            "badge_learn_completions": 0,

            # badge round state
            "badge_starter_progress": 0,
            "badge_finisher_progress": 0,
            "badge_shaker_progress": 0,
            "badge_mover_progress": 0,
            "badge_contributor_progress": 0,
            "badge_builder_progress": 0,
            "badge_earner_progress": 0,
            "badge_supporter_progress": 0,
            "badge_learner_progress": 0,

            # badge levels
            "badge_starter_level": 0,
            "badge_finisher_level": 0,
            "badge_shaker_level": 0,
            "badge_mover_level": 0,
            "badge_contributor_level": 0,
            "badge_builder_level": 0,
            "badge_earner_level": 0,
            "badge_supporter_level": 0,
            "badge_learner_level": 0,

            # badge mastery
            "badge_starter_mastered": False,
            "badge_finisher_mastered": False,
            "badge_shaker_mastered": False,
            "badge_mover_mastered": False,
            "badge_contributor_mastered": False,
            "badge_builder_mastered": False,
            "badge_earner_mastered": False,
            "badge_supporter_mastered": False,
            "badge_learner_mastered": False,

            # badge completion flags
            "badge_starter_completed": False,
            "badge_finisher_completed": False,
            "badge_shaker_completed": False,
            "badge_mover_completed": False,
            "badge_contributor_completed": False,
            "badge_builder_completed": False,
            "badge_earner_completed": False,
            "badge_supporter_completed": False,
            "badge_learner_completed": False,

            # badge source snapshots
            "badge_starter_last_source": 0,
            "badge_finisher_last_source": 0,
            "badge_shaker_last_source": 0,
            "badge_mover_last_source": 0,
            "badge_contributor_last_source": 0,
            "badge_builder_last_source": 0,
            "badge_earner_last_source": 0,
            "badge_supporter_last_source": 0,
            "badge_learner_last_source": 0,

            # trophy state
            "badge_trophies": 0,
            "badge_trophy_bonus_percent": 0,
            "badge_current_round": 1,

            # movement daily marker
            "badge_last_move_day": None,

            # enterprise anchor fields
            "organization_id": None,
            "organization_name": None,
            "organization_type": None,
            "department_name": None,
            "team_name": None,
            "manager_id": None,
            "member_role": None,
            "employee_status": None,
            "family_group_id": None,
            "organization_joined_at": None,
        }

        await db.users.insert_one(new_user)
        return UserResponse(**new_user)

    except Exception:
        now_iso = utc_now_iso()
        generated_username = generate_username(wallet)

        fallback_user = {
            "id": str(uuid.uuid4()),
            "wallet_address": wallet,
            "username": generated_username,
            "zwap_balance": 100.0,
            "zpts_balance": 0,
            "tier": "starter",
            "subscription_id": None,
            "subscription_status": None,
            "total_steps": 0,
            "daily_steps": 0,
            "daily_zpts_earned": 0,
            "daily_streak": 0,
            "last_daily_claim": None,
            "last_zpts_reset": now_iso,
            "games_played": 0,
            "total_earned": 100.0,
            "created_at": now_iso,

            # enterprise anchor fields
            "organization_id": None,
            "organization_name": None,
            "organization_type": None,
            "department_name": None,
            "team_name": None,
            "manager_id": None,
            "member_role": None,
            "employee_status": None,
            "family_group_id": None,
            "organization_joined_at": None,
        }
        fallback_user = ensure_username(fallback_user)
        return UserResponse(**fallback_user)


@user_router.get("/assist/opportunity", response_model=Optional[AssistOpportunityResponse])
async def get_assist_opportunity(wallet_address: str, request: Request):
    db = request.app.state.db
    sender_wallet = wallet_address.lower()

    sender = await db.users.find_one({"wallet_address": sender_wallet})
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    sender = await persist_missing_username(db, sender)
    sender = await check_and_reset_daily_assist_counts(db, sender)
    sender_limits = get_assist_limits_for_tier(sender.get("tier", "starter"))

    if int(sender.get("daily_assists_sent", 0) or 0) >= sender_limits["send_cap"]:
        return None

    recipient = await db.users.find_one(
        {
            "wallet_address": {"$ne": sender_wallet},
            "daily_steps": {"$gt": 0},
        }
    )

    if not recipient:
        return None

    recipient = await persist_missing_username(db, recipient)
    recipient = await check_and_reset_daily_assist_counts(db, recipient)
    recipient_limits = get_assist_limits_for_tier(recipient.get("tier", "starter"))

    if int(recipient.get("daily_assists_received", 0) or 0) >= recipient_limits["receive_cap"]:
        return None

    existing_pending = await db.assists.find_one(
        {
            "sender_wallet": sender_wallet,
            "recipient_wallet": recipient["wallet_address"],
            "status": "pending",
        }
    )
    if existing_pending:
        return None

    return AssistOpportunityResponse(
        recipient_user_id=recipient["id"],
        recipient_wallet=recipient["wallet_address"],
        goal_label="daily movement goal",
        amount_zpts=10,
    )


@user_router.get("/{wallet_address}", response_model=UserResponse)
async def get_user(wallet_address: str, request: Request):
    db = request.app.state.db
    wallet = wallet_address.lower()

    user = await db.users.find_one({"wallet_address": wallet}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user = await persist_missing_username(db, user)
    return UserResponse(**user)


@user_router.post("/assist/send")
async def send_assist(payload: AssistSendRequest, request: Request):
    db = request.app.state.db

    sender_wallet = payload.sender_wallet.lower()
    recipient_wallet = payload.recipient_wallet.lower()
    amount = int(payload.amount)

    if sender_wallet == recipient_wallet:
        raise HTTPException(status_code=400, detail="Cannot send Assist to yourself")

    if amount < 10 or amount > 100:
        raise HTTPException(status_code=400, detail="Assist amount must be between 10 and 100 zPts")

    sender = await db.users.find_one({"wallet_address": sender_wallet})
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    recipient = await db.users.find_one({"wallet_address": recipient_wallet})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    sender = await persist_missing_username(db, sender)
    recipient = await persist_missing_username(db, recipient)

    sender = await check_and_reset_daily_assist_counts(db, sender)
    recipient = await check_and_reset_daily_assist_counts(db, recipient)

    sender_limits = get_assist_limits_for_tier(sender.get("tier", "starter"))
    recipient_limits = get_assist_limits_for_tier(recipient.get("tier", "starter"))

    if int(sender.get("daily_assists_sent", 0) or 0) >= sender_limits["send_cap"]:
        raise HTTPException(status_code=429, detail="Daily Assist send cap reached")

    if int(recipient.get("daily_assists_received", 0) or 0) >= recipient_limits["receive_cap"]:
        raise HTTPException(status_code=429, detail="Recipient daily Assist receive cap reached")

    if int(sender.get("zpts_balance", 0) or 0) < amount:
        raise HTTPException(status_code=400, detail="Sender does not have enough zPts")

    existing_pending = await db.assists.find_one(
        {
            "sender_wallet": sender_wallet,
            "recipient_wallet": recipient_wallet,
            "status": "pending",
        }
    )
    if existing_pending:
        raise HTTPException(status_code=400, detail="A pending Assist already exists for this recipient")

    assist_doc = {
        "id": str(uuid.uuid4()),
        "sender_wallet": sender_wallet,
        "recipient_wallet": recipient_wallet,
        "amount": amount,
        "message": (payload.message or "").strip()[:180],
        "status": "pending",
        "created_at": utc_now_iso(),
        "accepted_at": None,
    }

    await db.assists.insert_one(assist_doc)

    return {
        "success": True,
        "assist_id": assist_doc["id"],
        "status": "pending",
        "message": "Assist request sent",
        "amount": amount,
    }


@user_router.post("/assist/accept")
async def accept_assist(payload: AssistAcceptRequest, request: Request):
    db = request.app.state.db
    recipient_wallet = payload.recipient_wallet.lower()

    assist = await db.assists.find_one({"id": payload.assist_id})
    if not assist:
        raise HTTPException(status_code=404, detail="Assist not found")

    if assist.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Assist is no longer pending")

    if assist.get("recipient_wallet") != recipient_wallet:
        raise HTTPException(status_code=403, detail="This Assist does not belong to this recipient")

    sender_wallet = assist["sender_wallet"]
    amount = int(assist["amount"])

    sender = await db.users.find_one({"wallet_address": sender_wallet})
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    recipient = await db.users.find_one({"wallet_address": recipient_wallet})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    sender = await persist_missing_username(db, sender)
    recipient = await persist_missing_username(db, recipient)

    sender = await check_and_reset_daily_assist_counts(db, sender)
    recipient = await check_and_reset_daily_assist_counts(db, recipient)

    sender_limits = get_assist_limits_for_tier(sender.get("tier", "starter"))
    recipient_limits = get_assist_limits_for_tier(recipient.get("tier", "starter"))

    if int(sender.get("daily_assists_sent", 0) or 0) >= sender_limits["send_cap"]:
        raise HTTPException(status_code=429, detail="Sender daily Assist send cap reached")

    if int(recipient.get("daily_assists_received", 0) or 0) >= recipient_limits["receive_cap"]:
        raise HTTPException(status_code=429, detail="Recipient daily Assist receive cap reached")

    if int(sender.get("zpts_balance", 0) or 0) < amount:
        raise HTTPException(status_code=400, detail="Sender no longer has enough zPts")

    sender_first_bonus = 0
    if not bool(sender.get("daily_first_assist_bonus_claimed", False)):
        sender_first_bonus = 25

    accepted_at = utc_now_iso()

    await db.users.update_one(
        {"wallet_address": sender_wallet},
        {
            "$inc": {
                "zpts_balance": -amount + sender_first_bonus,
                "daily_assists_sent": 1,
                "badge_assists_sent": 1,
                "badge_zpts_earned": sender_first_bonus,
            },
            "$set": {
                "daily_first_assist_bonus_claimed": True,
                "updated_at": accepted_at,
            },
        },
    )

    await db.users.update_one(
        {"wallet_address": recipient_wallet},
        {
            "$inc": {
                "zpts_balance": amount,
                "daily_assists_received": 1,
            },
            "$set": {
                "updated_at": accepted_at,
            },
        },
    )

    await db.assists.update_one(
        {"id": payload.assist_id},
        {
            "$set": {
                "status": "accepted",
                "accepted_at": accepted_at,
            }
        },
    )

    updated_sender = await db.users.find_one({"wallet_address": sender_wallet})
    sender_badge_result = evaluate_badges(updated_sender)
    await persist_badge_updates(db, updated_sender["id"], sender_badge_result["updates"])

    updated_recipient = await db.users.find_one({"wallet_address": recipient_wallet})

    return {
        "success": True,
        "assist_id": payload.assist_id,
        "amount_received": amount,
        "sender_first_assist_bonus": sender_first_bonus,
        "recipient_new_balance": int(updated_recipient.get("zpts_balance", 0)),
        "message": "Assist accepted",
    }


# Export canonical name expected by server.py
router = user_router