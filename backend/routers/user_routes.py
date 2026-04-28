from datetime import datetime, timezone
from typing import Optional, Dict, Any
import uuid

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict

from services.daily_task_service import (
    check_and_reset_daily_task_state,
    get_daily_task_state,
)

user_router = APIRouter(prefix="/users", tags=["User"])

SHOP_UNLOCK_THRESHOLD = 1000
GARDEN_STREAK_UNLOCK_DAYS = 3

ADJECTIVES = [
    "Nova",
    "Pixel",
    "Quantum",
    "Echo",
    "Neon",
    "Solar",
    "Cyber",
    "Hyper",
    "Shadow",
    "Turbo",
]

NOUNS = [
    "Runner",
    "Walker",
    "Strider",
    "Pilot",
    "Glider",
    "Breaker",
    "Phantom",
    "Rider",
    "Explorer",
    "Voyager",
]


class UserCreate(BaseModel):
    email: str
    wallet_address: Optional[str] = None
    username: Optional[str] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    email: str
    wallet_address: Optional[str] = None
    username: str

    zwap_balance: float = 0.0
    zpts_balance: int = 0
    lifetime_zpts: int = 0
    total_earned: float = 0.0

    daily_streak: int = 0
    last_daily_claim: Optional[str] = None

    tier: str = "zwapper"
    subscription_id: Optional[str] = None
    subscription_status: Optional[str] = None

    total_steps: int = 0
    daily_steps: int = 0
    daily_zpts_earned: int = 0
    daily_zpts_date: Optional[str] = None
    last_zpts_reset: Optional[str] = None

    games_played: int = 0
    games_played_today: int = 0

    lessons_completed_today: int = 0
    daily_learn_completed: bool = False
    daily_full_loop_completed: bool = False
    last_daily_task_reset: Optional[str] = None

    completed_task_count: int = 0
    total_task_count: int = 4
    full_loop_completed: bool = False
    task_state: Dict[str, Any] = {}

    shop_unlocked: bool = False
    garden_unlocked: bool = False
    rare_plant_unlocked: bool = False
    badge_visibility_unlocked: bool = False
    learn_unlocked: bool = False
    stream_unlocked: bool = False
    assist_unlocked: bool = False
    swap_unlocked: bool = False

    garden_health_percent: int = 100
    garden_growth_stage: str = "seed"
    garden_plant_name: str = "Garden"

    badge_login_days: int = 0
    badge_full_loop_days: int = 0
    badge_step_claims: int = 0
    badge_sustained_move_days: int = 0
    badge_assists_sent: int = 0
    badge_deep_engagement: int = 0
    badge_zpts_earned: int = 0
    badge_referrals: int = 0
    badge_learn_completions: int = 0

    badge_starter_level: int = 0
    badge_finisher_level: int = 0
    badge_shaker_level: int = 0
    badge_mover_level: int = 0
    badge_contributor_level: int = 0
    badge_builder_level: int = 0
    badge_earner_level: int = 0
    badge_supporter_level: int = 0
    badge_learner_level: int = 0

    badge_starter_mastered: bool = False
    badge_finisher_mastered: bool = False
    badge_shaker_mastered: bool = False
    badge_mover_mastered: bool = False
    badge_contributor_mastered: bool = False
    badge_builder_mastered: bool = False
    badge_earner_mastered: bool = False
    badge_supporter_mastered: bool = False
    badge_learner_mastered: bool = False

    badge_trophies: int = 0
    badge_trophy_bonus_percent: int = 0
    badge_current_round: int = 1

    created_at: str
    updated_at: Optional[str] = None


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_now_iso() -> str:
    return utc_now().isoformat()


def today_key() -> str:
    return utc_now().date().isoformat()


def normalize_email(email: Optional[str]) -> str:
    return str(email or "").lower().strip()


def normalize_wallet(wallet_address: Optional[str]) -> Optional[str]:
    wallet = str(wallet_address or "").strip()
    return wallet or None


def safe_int(value: Any, fallback: int = 0) -> int:
    try:
        return int(value or fallback)
    except Exception:
        return fallback


def safe_float(value: Any, fallback: float = 0.0) -> float:
    try:
        return float(value or fallback)
    except Exception:
        return fallback


def safe_bool(value: Any, fallback: bool = False) -> bool:
    if isinstance(value, bool):
        return value

    if value in {"true", "True", "1", 1}:
        return True

    if value in {"false", "False", "0", 0}:
        return False

    return fallback


def hash_string(value: str = "") -> int:
    hash_value = 0
    safe_value = str(value or "").lower().strip()

    for char in safe_value:
        hash_value = ((hash_value << 5) - hash_value) + ord(char)
        hash_value = hash_value & 0xFFFFFFFF

        if hash_value >= 0x80000000:
            hash_value -= 0x100000000

    return abs(hash_value)


def generate_username(
    email: str = "",
    wallet_address: Optional[str] = None,
    username: Optional[str] = None,
) -> str:
    saved_username = str(username or "").strip()
    if saved_username:
        return saved_username

    safe_email = normalize_email(email)
    safe_wallet = normalize_wallet(wallet_address) or ""

    seed_source = safe_email or safe_wallet

    if not seed_source:
        return ""

    if safe_wallet.startswith("0x") and len(safe_wallet) >= 10:
        try:
            seed = int(safe_wallet[2:10], 16)
        except Exception:
            seed = hash_string(seed_source)
    else:
        seed = hash_string(seed_source)

    safe_seed = abs(seed)
    adjective = ADJECTIVES[safe_seed % len(ADJECTIVES)]
    noun = NOUNS[(safe_seed // 7) % len(NOUNS)]
    number = safe_seed % 999

    return f"{adjective}{noun}{number}"


async def persist_missing_identity_fields(db, user: dict) -> dict:
    updates: Dict[str, Any] = {}

    email = normalize_email(user.get("email"))
    wallet = normalize_wallet(user.get("wallet_address"))

    if email and user.get("email") != email:
        updates["email"] = email
        user["email"] = email

    if "wallet_address" not in user:
        updates["wallet_address"] = wallet
        user["wallet_address"] = wallet

    if not user.get("username"):
        generated = generate_username(
            email=email,
            wallet_address=wallet,
            username=user.get("username"),
        )
        updates["username"] = generated
        user["username"] = generated

    if not user.get("tier"):
        updates["tier"] = "zwapper"
        user["tier"] = "zwapper"

    if updates and email:
        updates["updated_at"] = utc_now_iso()
        await db.users.update_one(
            {"email": email},
            {"$set": updates},
        )

    return user


def build_new_user(
    email: str,
    wallet_address: Optional[str] = None,
    username: Optional[str] = None,
) -> dict:
    now_iso = utc_now_iso()
    current_day = today_key()
    wallet = normalize_wallet(wallet_address)

    return {
        "id": str(uuid.uuid4()),
        "email": email,
        "wallet_address": wallet,
        "username": generate_username(
            email=email,
            wallet_address=wallet,
            username=username,
        ),

        "zwap_balance": 0.0,
        "zpts_balance": 0,
        "lifetime_zpts": 0,
        "total_earned": 0.0,

        "tier": "zwapper",
        "subscription_id": None,
        "subscription_status": None,

        "total_steps": 0,
        "daily_steps": 0,
        "daily_zpts_earned": 0,
        "daily_zpts_date": current_day,
        "last_zpts_reset": now_iso,

        "games_played": 0,
        "games_played_today": 0,

        "lessons_completed_today": 0,
        "daily_learn_completed": False,
        "daily_full_loop_completed": False,
        "last_daily_task_reset": current_day,

        "daily_streak": 0,
        "last_daily_claim": None,

        "shop_unlocked": False,
        "garden_unlocked": False,
        "rare_plant_unlocked": False,
        "badge_visibility_unlocked": False,
        "learn_unlocked": False,
        "stream_unlocked": False,
        "assist_unlocked": False,
        "swap_unlocked": False,

        "garden_health_percent": 100,
        "garden_growth_stage": "seed",
        "garden_plant_name": "Garden",

        "badge_login_days": 0,
        "badge_full_loop_days": 0,
        "badge_step_claims": 0,
        "badge_sustained_move_days": 0,
        "badge_assists_sent": 0,
        "badge_deep_engagement": 0,
        "badge_zpts_earned": 0,
        "badge_referrals": 0,
        "badge_learn_completions": 0,

        "badge_starter_progress": 0,
        "badge_finisher_progress": 0,
        "badge_shaker_progress": 0,
        "badge_mover_progress": 0,
        "badge_contributor_progress": 0,
        "badge_builder_progress": 0,
        "badge_earner_progress": 0,
        "badge_supporter_progress": 0,
        "badge_learner_progress": 0,

        "badge_starter_level": 0,
        "badge_finisher_level": 0,
        "badge_shaker_level": 0,
        "badge_mover_level": 0,
        "badge_contributor_level": 0,
        "badge_builder_level": 0,
        "badge_earner_level": 0,
        "badge_supporter_level": 0,
        "badge_learner_level": 0,

        "badge_starter_mastered": False,
        "badge_finisher_mastered": False,
        "badge_shaker_mastered": False,
        "badge_mover_mastered": False,
        "badge_contributor_mastered": False,
        "badge_builder_mastered": False,
        "badge_earner_mastered": False,
        "badge_supporter_mastered": False,
        "badge_learner_mastered": False,

        "badge_trophies": 0,
        "badge_trophy_bonus_percent": 0,
        "badge_current_round": 1,

        "created_at": now_iso,
        "updated_at": now_iso,
    }


def apply_unlock_state(user: dict, task_state: Dict[str, Any]) -> dict:
    zpts_balance = safe_int(user.get("zpts_balance"), 0)
    lifetime_zpts = safe_int(user.get("lifetime_zpts"), 0)
    badge_full_loop_days = safe_int(user.get("badge_full_loop_days"), 0)
    daily_streak = safe_int(user.get("daily_streak"), 0)

    total_progress_zpts = max(zpts_balance, lifetime_zpts)

    completed_task_count = safe_int(task_state.get("completed_count"), 0)
    total_task_count = safe_int(task_state.get("total_tasks"), 4)
    full_loop_completed = bool(task_state.get("full_loop_complete", False))

    shop_unlocked = (
        safe_bool(user.get("shop_unlocked"), False)
        or total_progress_zpts >= SHOP_UNLOCK_THRESHOLD
    )

    garden_unlocked = (
        safe_bool(user.get("garden_unlocked"), False)
        or daily_streak >= GARDEN_STREAK_UNLOCK_DAYS
        or badge_full_loop_days >= 1
        or full_loop_completed
    )

    badge_visibility_unlocked = (
        safe_bool(user.get("badge_visibility_unlocked"), False)
        or daily_streak >= 7
        or badge_full_loop_days >= 2
        or safe_int(user.get("badge_starter_level"), 0) > 0
        or safe_int(user.get("badge_finisher_level"), 0) > 0
    )

    user["completed_task_count"] = completed_task_count
    user["total_task_count"] = total_task_count
    user["full_loop_completed"] = full_loop_completed
    user["task_state"] = task_state

    user["shop_unlocked"] = shop_unlocked
    user["garden_unlocked"] = garden_unlocked
    user["badge_visibility_unlocked"] = badge_visibility_unlocked

    user["rare_plant_unlocked"] = safe_bool(user.get("rare_plant_unlocked"), False)
    user["learn_unlocked"] = safe_bool(user.get("learn_unlocked"), False)
    user["stream_unlocked"] = safe_bool(user.get("stream_unlocked"), False)
    user["assist_unlocked"] = safe_bool(user.get("assist_unlocked"), False)
    user["swap_unlocked"] = safe_bool(user.get("swap_unlocked"), False)

    user["daily_steps"] = safe_int(user.get("daily_steps"), 0)
    user["games_played_today"] = safe_int(user.get("games_played_today"), 0)
    user["lessons_completed_today"] = safe_int(
        user.get("lessons_completed_today"),
        1 if safe_bool(user.get("daily_learn_completed"), False) else 0,
    )

    user["zpts_balance"] = zpts_balance
    user["lifetime_zpts"] = lifetime_zpts
    user["zwap_balance"] = safe_float(user.get("zwap_balance"), 0.0)
    user["total_earned"] = safe_float(user.get("total_earned"), 0.0)

    user["tier"] = user.get("tier") or "zwapper"
    user["garden_health_percent"] = safe_int(user.get("garden_health_percent"), 100)
    user["garden_growth_stage"] = user.get("garden_growth_stage") or "seed"
    user["garden_plant_name"] = user.get("garden_plant_name") or "Garden"

    return user


async def enrich_user_for_dashboard(db, user: dict) -> dict:
    user = await persist_missing_identity_fields(db, user)
    user = await check_and_reset_daily_task_state(db, user)

    task_state = get_daily_task_state(user)
    user = apply_unlock_state(user, task_state)

    return user


@user_router.post("/connect", response_model=UserResponse)
async def connect_user(user_data: UserCreate, request: Request):
    db = request.app.state.db

    email = normalize_email(user_data.email)
    wallet = normalize_wallet(user_data.wallet_address)

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    existing = await db.users.find_one({"email": email}, {"_id": 0})

    if existing:
        updates: Dict[str, Any] = {}

        if wallet and not existing.get("wallet_address"):
            updates["wallet_address"] = wallet
            existing["wallet_address"] = wallet

        incoming_username = str(user_data.username or "").strip()
        if incoming_username and incoming_username != existing.get("username"):
            updates["username"] = incoming_username
            existing["username"] = incoming_username

        if updates:
            updates["updated_at"] = utc_now_iso()
            await db.users.update_one({"email": email}, {"$set": updates})
            existing.update(updates)

        existing = await enrich_user_for_dashboard(db, existing)
        return UserResponse(**existing)

    new_user = build_new_user(
        email=email,
        wallet_address=wallet,
        username=user_data.username,
    )

    await db.users.insert_one(dict(new_user))

    enriched_user = await enrich_user_for_dashboard(db, new_user)
    return UserResponse(**enriched_user)


@user_router.get("/{email}", response_model=UserResponse)
async def get_user(email: str, request: Request):
    db = request.app.state.db
    normalized_email = normalize_email(email)

    if not normalized_email:
        raise HTTPException(status_code=400, detail="Email is required")

    user = await db.users.find_one({"email": normalized_email}, {"_id": 0})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user = await enrich_user_for_dashboard(db, user)
    return UserResponse(**user)


router = user_router