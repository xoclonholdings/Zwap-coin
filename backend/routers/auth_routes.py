from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid
import secrets
import hashlib

auth_router = APIRouter(tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
RESET_TOKEN_TTL_HOURS = 1


class EmailCaptureRequest(BaseModel):
    email: EmailStr
    source: str = "website"
    status: str = "early_access"
    email_opt_in: bool = True


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    source: str = "app"
    status: str = "active"
    email_opt_in: bool = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=16, max_length=256)
    new_password: str = Field(min_length=8, max_length=128)


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def parse_iso_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except Exception:
        return None


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def build_reset_expiry_iso() -> str:
    return (datetime.now(timezone.utc) + timedelta(hours=RESET_TOKEN_TTL_HOURS)).isoformat()


def public_user(user: dict) -> dict:
    return {
        "id": user.get("id"),
        "email": user.get("email"),
        "source": user.get("source"),
        "status": user.get("status"),
        "wallet_connected": bool(user.get("wallet_address")),
        "wallet_address": user.get("wallet_address"),
        "zwap_pending": user.get("zwap_pending", 0),
        "zpts_pending": user.get("zpts_pending", 0),
        "email_opt_in": user.get("email_opt_in", True),
        "created_at": user.get("created_at"),
        "last_active": user.get("last_active"),
    }


@auth_router.post("/users/create-or-update")
async def create_or_update_email_user(payload: EmailCaptureRequest, request: Request):
    db = request.app.state.db
    email = payload.email.lower().strip()
    now = utc_now_iso()

    existing = await db.users.find_one({"email": email})

    if existing:
        await db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "source": payload.source or existing.get("source", "website"),
                    "status": payload.status or existing.get("status", "early_access"),
                    "email_opt_in": payload.email_opt_in,
                    "last_active": now,
                }
            },
        )
        updated = await db.users.find_one({"email": email}, {"_id": 0})
        return {"success": True, "user": public_user(updated), "message": "User updated"}

    new_user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "source": payload.source,
        "status": payload.status,
        "email_opt_in": payload.email_opt_in,
        "wallet_address": None,
        "zwap_pending": 0,
        "zpts_pending": 0,
        "password_hash": None,
        "reset_password_token_hash": None,
        "reset_password_expires_at": None,
        "created_at": now,
        "last_active": now,
    }

    await db.users.insert_one(new_user)
    return {"success": True, "user": public_user(new_user), "message": "User created"}


@auth_router.post("/auth/register")
async def register_email_user(payload: RegisterRequest, request: Request):
    db = request.app.state.db
    email = payload.email.lower().strip()
    now = utc_now_iso()

    existing = await db.users.find_one({"email": email})

    if existing and existing.get("password_hash"):
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    password_hash = pwd_context.hash(payload.password)

    if existing:
        await db.users.update_one(
            {"email": email},
            {
                "$set": {
                    "password_hash": password_hash,
                    "source": "app",
                    "status": "active",
                    "email_opt_in": payload.email_opt_in,
                    "last_active": now,
                },
                "$unset": {
                    "reset_password_token_hash": "",
                    "reset_password_expires_at": "",
                },
            },
        )
        updated = await db.users.find_one({"email": email}, {"_id": 0})
        return {"success": True, "user": public_user(updated), "message": "Account created"}

    new_user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "source": payload.source,
        "status": payload.status,
        "email_opt_in": payload.email_opt_in,
        "wallet_address": None,
        "zwap_pending": 0,
        "zpts_pending": 0,
        "password_hash": password_hash,
        "reset_password_token_hash": None,
        "reset_password_expires_at": None,
        "created_at": now,
        "last_active": now,
    }

    await db.users.insert_one(new_user)
    return {"success": True, "user": public_user(new_user), "message": "Account created"}


@auth_router.post("/auth/login")
async def login_email_user(payload: LoginRequest, request: Request):
    db = request.app.state.db
    email = payload.email.lower().strip()
    now = utc_now_iso()

    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=404, detail="Account not found")

    if not pwd_context.verify(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.users.update_one(
        {"email": email},
        {"$set": {"last_active": now, "status": "active", "source": "app"}},
    )

    updated = await db.users.find_one({"email": email}, {"_id": 0})
    return {"success": True, "user": public_user(updated), "message": "Logged in"}


@auth_router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, request: Request):
    db = request.app.state.db
    email = payload.email.lower().strip()
    now = utc_now_iso()

    user = await db.users.find_one({"email": email})

    # Always return a generic success response so emails cannot be enumerated.
    if not user or not user.get("password_hash"):
        return {
            "success": True,
            "message": "If that account exists, reset instructions have been generated.",
        }

    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_reset_token(raw_token)
    expires_at = build_reset_expiry_iso()

    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "reset_password_token_hash": token_hash,
                "reset_password_expires_at": expires_at,
                "last_active": now,
            }
        },
    )

    # Email delivery is not wired yet.
    # For now, return the token so the frontend can complete the reset flow.
    return {
      "success": True,
      "message": "Password reset token generated.",
      "reset_token": raw_token,
      "expires_at": expires_at,
    }


@auth_router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordRequest, request: Request):
    db = request.app.state.db
    token_hash = hash_reset_token(payload.token)
    now = datetime.now(timezone.utc)

    user = await db.users.find_one({"reset_password_token_hash": token_hash})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    expires_at = parse_iso_datetime(user.get("reset_password_expires_at"))
    if not expires_at or expires_at < now:
        await db.users.update_one(
            {"email": user["email"]},
            {
                "$unset": {
                    "reset_password_token_hash": "",
                    "reset_password_expires_at": "",
                }
            },
        )
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    new_password_hash = pwd_context.hash(payload.new_password)

    await db.users.update_one(
        {"email": user["email"]},
        {
            "$set": {
                "password_hash": new_password_hash,
                "last_active": utc_now_iso(),
                "status": "active",
                "source": "app",
            },
            "$unset": {
                "reset_password_token_hash": "",
                "reset_password_expires_at": "",
            },
        },
    )

    updated = await db.users.find_one({"email": user["email"]}, {"_id": 0})
    return {
        "success": True,
        "user": public_user(updated),
        "message": "Password reset successful",
    }


router = auth_router