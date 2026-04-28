"""
ZWAP! V1 Reward Service
=======================
Central reward logic for MOVE, PLAY, tier multipliers, conversion math,
daily caps, and reward validation.

V1 rules:
- Email is the primary user identity
- Privy wallet is optional metadata
- MOVE earns zPts
- PLAY earns zPts
- zPts convert internally at 1000:1
- no direct on-chain claim logic here
- no legacy game IDs
"""

from collections import defaultdict
from datetime import datetime, timezone
import time as _time
from typing import Dict, Optional


TIERS = {
    "zwapper": {
        "name": "Zwapper",
        "price": 0,
        "move": 1.0,
        "play": 1.0,
        "zwap_multiplier": 1.0,
        "daily_zpts_cap": 300,
        "daily_zwap_cap": 5.0,
        "monthly_zwap_cap": 150.0,
        "games": ["stackz", "breakerz", "pulze", "zap-man"],
        "features": ["move", "play", "shop"],
    },
    "zitizen": {
        "name": "Zitizen",
        "price": 9.99,
        "move": 1.5,
        "play": 1.5,
        "zwap_multiplier": 1.5,
        "daily_zpts_cap": 600,
        "daily_zwap_cap": 10.0,
        "monthly_zwap_cap": 300.0,
        "games": ["stackz", "breakerz", "pulze", "zap-man", "brainz", "triplez", "werdz"],
        "features": ["move", "play", "shop", "zitizen"],
    },
}

DAILY_REWARD_TABLE = {
    1: 10,
    2: 15,
    3: 20,
    4: 25,
    5: 30,
    6: 35,
    7: 100,
}

ZPTS_TO_ZWAP_RATE = 1000

STEP_CLAIM_COOLDOWN = 300
GAME_RESULT_COOLDOWN = 20
MIN_STEPS_PER_CLAIM = 10
MAX_STEPS_PER_CLAIM = 50000

MAX_GAME_SCORES = {
    "stackz": 10000,
    "breakerz": 5000,
    "pulze": 8000,
    "zap-man": 10000,
    "brainz": 50,
    "triplez": 10000,
    "werdz": 200,
}

_rate_limits = defaultdict(dict)


def _normalize_identity(value: Optional[str]) -> str:
    return str(value or "").lower().strip()


def _normalize_tier_key(tier: str) -> str:
    safe = str(tier or "").lower().strip()

    if safe in {"zitizen", "plus"}:
        return "zitizen"

    return "zwapper"


def _get_tier_config(tier: str) -> Dict:
    return TIERS[_normalize_tier_key(tier)]


def _normalize_game_id(game_type: str) -> str:
    return str(game_type or "").lower().strip()


def get_user_tier_config(tier: str) -> Dict:
    return _get_tier_config(tier)


def get_daily_reward(streak: int) -> int:
    safe_streak = max(1, min(int(streak or 1), 7))
    return DAILY_REWARD_TABLE.get(safe_streak, DAILY_REWARD_TABLE[7])


def check_rate_limit(identity: str, action: str, cooldown_seconds: int) -> bool:
    key = _normalize_identity(identity)
    now = _time.time()
    last = _rate_limits[key].get(action, 0)

    if now - last < cooldown_seconds:
        return True

    _rate_limits[key][action] = now
    return False


async def check_and_reset_daily_zpts(db, user: dict) -> dict:
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    current_day = now.date().isoformat()

    last_reset = user.get("last_zpts_reset")
    daily_zpts_date = user.get("daily_zpts_date")

    should_reset = False

    if daily_zpts_date and daily_zpts_date != current_day:
        should_reset = True
    elif last_reset:
        try:
            last_reset_dt = datetime.fromisoformat(str(last_reset).replace("Z", "+00:00"))
            should_reset = last_reset_dt.date() < now.date()
        except Exception:
            should_reset = True
    else:
        should_reset = True

    if should_reset:
        lookup = {"email": user["email"]} if user.get("email") else {"id": user["id"]}

        await db.users.update_one(
            lookup,
            {
                "$set": {
                    "daily_zpts_earned": 0,
                    "daily_zpts_date": current_day,
                    "last_zpts_reset": now_iso,
                    "updated_at": now_iso,
                }
            },
        )

        user["daily_zpts_earned"] = 0
        user["daily_zpts_date"] = current_day
        user["last_zpts_reset"] = now_iso
        user["updated_at"] = now_iso

    return user


async def calculate_play_reward(
    game_type: str,
    score: int,
    level: int,
    tier: str,
    blocks_destroyed: int = 0,
) -> Dict:
    if score < 0 or level < 1:
        raise ValueError("Invalid game data")

    normalized_game = _normalize_game_id(game_type)

    if normalized_game not in MAX_GAME_SCORES:
        raise ValueError("Unknown game type")

    max_score = MAX_GAME_SCORES[normalized_game]

    if score > max_score:
        raise ValueError("Invalid score")

    tier_config = _get_tier_config(tier)
    multiplier = float(tier_config["play"])
    difficulty_multiplier = 1 + (level - 1) * 0.1

    if normalized_game == "breakerz":
        base_zpts = min(blocks_destroyed + (score // 40), 40)
    elif normalized_game == "stackz":
        base_zpts = min((score // 80) + (level * 2), 50)
    elif normalized_game == "pulze":
        base_zpts = min((score // 12) + level, 35)
    elif normalized_game == "zap-man":
        base_zpts = min((score // 80) + (level * 2), 50)
    elif normalized_game == "brainz":
        base_zpts = min((score * 2) + level, 30)
    elif normalized_game == "triplez":
        base_zpts = min((score // 60) + (level * 2), 45)
    elif normalized_game == "werdz":
        base_zpts = min((score * 2) + (level * 2), 35)
    else:
        base_zpts = 0

    total_zpts = int(round(base_zpts * difficulty_multiplier * multiplier))

    return {
        "game_type": normalized_game,
        "zpts": max(total_zpts, 0),
    }


async def calculate_move_reward(
    steps: int,
    tier: str,
    daily_steps_so_far: int = 0,
) -> Dict:
    if steps < MIN_STEPS_PER_CLAIM:
        raise ValueError(f"Minimum {MIN_STEPS_PER_CLAIM} steps required")

    if steps > MAX_STEPS_PER_CLAIM:
        raise ValueError(f"Step count exceeds maximum ({MAX_STEPS_PER_CLAIM})")

    tier_config = _get_tier_config(tier)
    multiplier = float(tier_config["move"])

    if steps < 1000:
        base = steps * 0.02
    elif steps < 5000:
        base = 20 + (steps - 1000) * 0.03
    elif steps < 10000:
        base = 140 + (steps - 5000) * 0.04
    else:
        base = 340 + (steps - 10000) * 0.05

    total_zpts = int(round(base * multiplier))

    return {
        "zpts": max(total_zpts, 0),
    }


async def convert_zpts_to_zwap(zpts_amount: int, tier: str = "zwapper") -> Dict:
    if zpts_amount < ZPTS_TO_ZWAP_RATE:
        raise ValueError(f"Minimum {ZPTS_TO_ZWAP_RATE} zPts required")

    zwap = zpts_amount / ZPTS_TO_ZWAP_RATE

    return {
        "zwap": round(zwap, 4),
        "rate": float(ZPTS_TO_ZWAP_RATE),
    }


async def get_tier_multipliers(tier: str) -> Dict:
    tier_config = _get_tier_config(tier)

    return {
        "name": tier_config["name"],
        "move": tier_config["move"],
        "play": tier_config["play"],
        "zwap_multiplier": tier_config["zwap_multiplier"],
        "daily_zpts_cap": tier_config["daily_zpts_cap"],
        "daily_zwap_cap": tier_config["daily_zwap_cap"],
        "monthly_zwap_cap": tier_config["monthly_zwap_cap"],
        "games": tier_config["games"],
        "features": tier_config["features"],
    }


async def enforce_daily_caps(
    tier: str,
    earned_today: float,
    cap_type: str = "zpts",
    email: Optional[str] = None,
    wallet_address: Optional[str] = None,
) -> Dict:
    identity = _normalize_identity(email or wallet_address)

    if not identity:
        return {
            "capped": True,
            "remaining": 0,
            "reason": "identity_required",
        }

    tier_config = _get_tier_config(tier)

    if cap_type == "zwap":
        cap = float(tier_config["daily_zwap_cap"])
    else:
        cap = float(tier_config["daily_zpts_cap"])

    remaining = max(0.0, cap - float(earned_today or 0))

    return {
        "capped": remaining <= 0,
        "remaining": round(remaining, 2),
        "cap": cap,
        "identity": identity,
    }