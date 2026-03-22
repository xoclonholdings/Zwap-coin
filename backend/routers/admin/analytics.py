from typing import Dict, Optional
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Request

import services.analytics_service as analytics_service

from .common import verify_admin, get_db

router = APIRouter()


def _parse_dt(value) -> Optional[datetime]:
    if not value:
        return None

    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)

    if isinstance(value, str):
        try:
            value = value.replace("Z", "+00:00")
            parsed = datetime.fromisoformat(value)
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except Exception:
            return None

    return None


# ===========================
# ANALYTICS OVERVIEW
# ===========================
@router.get("/analytics/overview")
async def analytics_overview(
    request: Request,
    days: int = 30,
    _: None = Depends(verify_admin),
):
    db = get_db(request)
    return await analytics_service.get_overview(db, days=days)


# ===========================
# PURCHASE ANALYTICS
# ===========================
@router.get("/analytics/purchases")
async def purchase_analytics(
    request: Request,
    days: int = 30,
    _: None = Depends(verify_admin),
):
    db = get_db(request)

    purchases = await db.purchases.find({}, {"_id": 0}).to_list(length=None)

    total_purchases = len(purchases)

    total_zwap_spent = sum(
        p.get("price", 0)
        for p in purchases
        if (p.get("currency") or "").lower() == "zwap" and not p.get("refunded", False)
    )

    total_zpts_spent = sum(
        p.get("price", 0)
        for p in purchases
        if (p.get("currency") or "").lower() == "zpts" and not p.get("refunded", False)
    )

    item_counts: Dict[str, int] = {}
    for purchase in purchases:
        if purchase.get("refunded", False):
            continue
        item_name = purchase.get("item_name") or "Unknown Item"
        item_counts[item_name] = item_counts.get(item_name, 0) + 1

    top_items = sorted(
        [{"item_name": name, "count": count} for name, count in item_counts.items()],
        key=lambda x: x["count"],
        reverse=True,
    )[:10]

    # ---------- Daily series for chart ----------
    safe_days = max(1, min(days, 365))
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=safe_days - 1)

    daily_map: Dict[str, Dict[str, float]] = {}
    for i in range(safe_days):
        day = (start + timedelta(days=i)).date().isoformat()
        daily_map[day] = {
            "date": day,
            "count": 0,
            "zwap_spent": 0.0,
            "zpts_spent": 0.0,
        }

    for purchase in purchases:
        if purchase.get("refunded", False):
            continue

        purchase_dt = (
            _parse_dt(purchase.get("created_at"))
            or _parse_dt(purchase.get("timestamp"))
            or _parse_dt(purchase.get("purchased_at"))
            or _parse_dt(purchase.get("updated_at"))
        )

        if not purchase_dt:
            continue

        if purchase_dt < start:
            continue

        day_key = purchase_dt.date().isoformat()
        if day_key not in daily_map:
            continue

        daily_map[day_key]["count"] += 1

        currency = (purchase.get("currency") or "").lower()
        price = float(purchase.get("price", 0) or 0)

        if currency == "zwap":
            daily_map[day_key]["zwap_spent"] += price
        elif currency == "zpts":
            daily_map[day_key]["zpts_spent"] += price

    daily_series = list(daily_map.values())

    return {
        "total_purchases": total_purchases,
        "total_zwap_spent": total_zwap_spent,
        "total_zpts_spent": total_zpts_spent,
        "top_items": top_items,
        "daily_series": daily_series,
        "days": safe_days,
    }