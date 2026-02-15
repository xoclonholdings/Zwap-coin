import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import anyio


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


async def create_checkout_session(
    db,
    stripe_client,   # inject stripe module or a wrapper
    *,
    wallet_address: str,
    price_id: str,
    success_url: str,
    cancel_url: str,
    customer_email: Optional[str] = None,
    metadata: Optional[Dict[str, str]] = None,
    idempotency_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Creates a Stripe Checkout Session for subscription.

    - stripe_client: typically the `stripe` module already configured with api_key,
      OR a wrapper exposing `checkout.Session.create(...)`.

    Stores a record in MongoDB for traceability.
    """
    if not wallet_address or not price_id or not success_url or not cancel_url:
        raise ValueError("wallet_address, price_id, success_url, cancel_url are required")

    meta = metadata.copy() if metadata else {}
    meta["wallet_address"] = wallet_address.lower()

    def _create_session_sync():
        kwargs = {
            "mode": "subscription",
            "line_items": [{"price": price_id, "quantity": 1}],
            "success_url": success_url,
            "cancel_url": cancel_url,
            "metadata": meta,
        }
        if customer_email:
            kwargs["customer_email"] = customer_email

        # Idempotency prevents double sessions on retries
        if idempotency_key:
            return stripe_client.checkout.Session.create(**kwargs, idempotency_key=idempotency_key)
        return stripe_client.checkout.Session.create(**kwargs)

    session = await anyio.to_thread.run_sync(_create_session_sync)

    # Persist transaction
    await db.payment_transactions.insert_one({
        "provider": "stripe",
        "type": "checkout_session",
        "wallet_address": wallet_address.lower(),
        "session_id": session.get("id"),
        "status": session.get("status"),
        "created_at": _utc_now(),
        "raw": dict(session),
    })

    return {
        "session_id": session.get("id"),
        "url": session.get("url"),
        "status": session.get("status"),
    }


async def get_checkout_session_status(
    db,
    stripe_client,
    *,
    session_id: str,
) -> Dict[str, Any]:
    """
    Fetches checkout session status from Stripe, updates DB record.
    """
    if not session_id:
        raise ValueError("session_id is required")

    def _retrieve_sync():
        return stripe_client.checkout.Session.retrieve(session_id)

    session = await anyio.to_thread.run_sync(_retrieve_sync)

    await db.payment_transactions.update_one(
        {"provider": "stripe", "session_id": session_id},
        {"$set": {
            "status": session.get("status"),
            "payment_status": session.get("payment_status"),
            "updated_at": _utc_now(),
            "raw": dict(session),
        }},
        upsert=True,
    )

    return {
        "session_id": session_id,
        "status": session.get("status"),
        "payment_status": session.get("payment_status"),
        "customer": session.get("customer"),
        "subscription": session.get("subscription"),
    }


async def activate_plus_for_wallet(
    db,
    *,
    wallet_address: str,
    source: str,
    source_ref: Optional[str] = None,
    expires_at: Optional[datetime] = None,
) -> Dict[str, Any]:
    """
    Marks a wallet/user as Plus tier.

    - Called after verified payment success (checkout status or webhook).
    - "expires_at" optional. If you run recurring subscriptions, you can store
      current period end from Stripe subscription.
    """
    if not wallet_address:
        raise ValueError("wallet_address is required")

    update = {
        "subscription": {
            "tier": "plus",
            "active": True,
            "source": source,
            "source_ref": source_ref,
            "activated_at": _utc_now(),
            "expires_at": expires_at,
        }
    }

    await db.users.update_one(
        {"wallet_address": wallet_address.lower()},
        {"$set": update},
        upsert=False,
    )

    await db.payment_transactions.insert_one({
        "provider": "stripe" if source == "stripe" else source,
        "type": "subscription_activation",
        "wallet_address": wallet_address.lower(),
        "source_ref": source_ref,
        "created_at": _utc_now(),
        "details": update["subscription"],
    })

    return {"wallet_address": wallet_address.lower(), "tier": "plus", "active": True}


async def handle_stripe_webhook(
    db,
    stripe_client,
    *,
    payload_bytes: bytes,
    sig_header: str,
    webhook_secret: str,
) -> Dict[str, Any]:
    """
    Verifies and handles Stripe webhook events.

    This function:
      - Verifies signature
      - Stores raw event (idempotent)
      - Activates Plus tier when appropriate events indicate paid/active subscription

    Routes pass raw body + Stripe-Signature header + secret from env.
    """
    if not payload_bytes or not sig_header or not webhook_secret:
        raise ValueError("payload_bytes, sig_header, webhook_secret are required")

    def _construct_event_sync():
        return stripe_client.Webhook.construct_event(
            payload=payload_bytes,
            sig_header=sig_header,
            secret=webhook_secret,
        )

    event = await anyio.to_thread.run_sync(_construct_event_sync)
    event_id = event.get("id")
    event_type = event.get("type")

    # Idempotency: store once
    existing = await db.payment_transactions.find_one({"provider": "stripe", "type": "webhook", "event_id": event_id})
    if existing:
        return {"received": True, "duplicate": True, "event_id": event_id, "type": event_type}

    await db.payment_transactions.insert_one({
        "provider": "stripe",
        "type": "webhook",
        "event_id": event_id,
        "event_type": event_type,
        "created_at": _utc_now(),
        "raw": dict(event),
    })

    # Event handling (expand as needed; keep logic, don’t shrink)
    obj = (event.get("data") or {}).get("object") or {}
    metadata = obj.get("metadata") or {}
    wallet = (metadata.get("wallet_address") or "").lower() or None

    # Common “good” signals:
    # - checkout.session.completed (mode=subscription)
    # - invoice.paid
    # - customer.subscription.updated (status active)
    # - customer.subscription.created (status active)
    activated = False
    activation_ref = None

    if event_type == "checkout.session.completed":
        # Checkout session object may carry subscription id + metadata
        if wallet:
            activation_ref = obj.get("id")
            await activate_plus_for_wallet(
                db,
                wallet_address=wallet,
                source="stripe",
                source_ref=activation_ref,
                expires_at=None,  # can be populated from subscription fetch if desired
            )
            activated = True

    elif event_type == "invoice.paid":
        # invoice object often has subscription + customer; metadata may be on subscription instead
        if wallet:
            activation_ref = obj.get("id")
            await activate_plus_for_wallet(
                db,
                wallet_address=wallet,
                source="stripe",
                source_ref=activation_ref,
                expires_at=None,
            )
            activated = True

    elif event_type in ("customer.subscription.created", "customer.subscription.updated"):
        status = obj.get("status")
        # Stripe subscription "active" / "trialing" can be treated as active tier.
        if wallet and status in ("active", "trialing"):
            activation_ref = obj.get("id")
            # current_period_end is a unix timestamp
            cpe = obj.get("current_period_end")
            expires_at = None
            if cpe:
                try:
                    expires_at = datetime.fromtimestamp(int(cpe), tz=timezone.utc)
                except Exception:
                    expires_at = None

            await activate_plus_for_wallet(
                db,
                wallet_address=wallet,
                source="stripe",
                source_ref=activation_ref,
                expires_at=expires_at,
            )
            activated = True

    # You can also implement downgrade on subscription.canceled, invoice.payment_failed, etc.
    # without removing capability. (Kept as explicit extension point.)

    return {
        "received": True,
        "event_id": event_id,
        "type": event_type,
        "wallet_address": wallet,
        "activated_plus": activated,
        "activation_ref": activation_ref,
    }
