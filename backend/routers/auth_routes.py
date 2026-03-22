from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from datetime import datetime, timezone
from typing import Optional
import uuid

auth_router = APIRouter(tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
    now = datetime.now(timezone.utc).isoformat()

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
        "created_at": now,
        "last_active": now,
    }

    await db.users.insert_one(new_user)
    return {"success": True, "user": public_user(new_user), "message": "User created"}


@auth_router.post("/auth/register")
async def register_email_user(payload: RegisterRequest, request: Request):
    db = request.app.state.db
    email = payload.email.lower().strip()
    now = datetime.now(timezone.utc).isoformat()

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
                }
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
        "created_at": now,
        "last_active": now,
    }

    await db.users.insert_one(new_user)
    return {"success": True, "user": public_user(new_user), "message": "Account created"}


@auth_router.post("/auth/login")
async def login_email_user(payload: LoginRequest, request: Request):
    db = request.app.state.db
    email = payload.email.lower().strip()
    now = datetime.now(timezone.utc).isoformat()

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


router = auth_router