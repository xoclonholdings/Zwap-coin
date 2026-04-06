from typing import Dict, List, Any


CONFIG_KEY = "swap_config"


def _default_tokens() -> Dict[str, List[Dict[str, Any]]]:
    return {
        "tokens": [
            {
                "token_symbol": "ZWAP",
                "enabled": True,
                "display_name": "ZWAP",
                "swappable": True,
                "requires_wallet_balance": True,
                "route_group": "source",
            },
            {
                "token_symbol": "POL",
                "enabled": True,
                "display_name": "POL",
                "swappable": True,
                "requires_wallet_balance": False,
                "route_group": "destination",
            },
            {
                "token_symbol": "BTC",
                "enabled": True,
                "display_name": "BTC",
                "swappable": True,
                "requires_wallet_balance": False,
                "route_group": "destination",
            },
            {
                "token_symbol": "ETH",
                "enabled": True,
                "display_name": "ETH",
                "swappable": True,
                "requires_wallet_balance": False,
                "route_group": "destination",
            },
            {
                "token_symbol": "USDC",
                "enabled": True,
                "display_name": "USDC",
                "swappable": True,
                "requires_wallet_balance": False,
                "route_group": "destination",
            },
        ],
        "provider": {
            "id": "embedded_swap",
            "name": "ZWAP Swap Flow",
            "external_url": "https://jumper.exchange",
            "mode": "embedded_overlay",
            "wallet_required": True,
            "claim_required": True,
        },
    }


async def get_swap_config(db) -> Dict[str, Any]:
    config = await db.configs.find_one({"key": CONFIG_KEY})

    if not config:
        defaults = _default_tokens()
        await db.configs.update_one(
            {"key": CONFIG_KEY},
            {"$set": {"value": defaults}},
            upsert=True,
        )
        return defaults

    value = config.get("value", {})
    tokens = value.get("tokens", [])
    provider = value.get("provider", {})

    if not isinstance(tokens, list):
        tokens = []

    normalized_tokens = []
    changed = False

    for token in tokens:
        normalized = {
            "token_symbol": token.get("token_symbol"),
            "enabled": token.get("enabled", True),
            "display_name": token.get("display_name", token.get("token_symbol")),
            "swappable": token.get("swappable", True),
            "requires_wallet_balance": token.get("requires_wallet_balance", False),
            "route_group": token.get("route_group", "destination"),
        }

        if normalized != token:
            changed = True

        normalized_tokens.append(normalized)

    normalized_provider = {
        "id": provider.get("id", "embedded_swap"),
        "name": provider.get("name", "ZWAP Swap Flow"),
        "external_url": provider.get("external_url", "https://jumper.exchange"),
        "mode": provider.get("mode", "embedded_overlay"),
        "wallet_required": provider.get("wallet_required", True),
        "claim_required": provider.get("claim_required", True),
    }

    if normalized_provider != provider:
        changed = True

    payload = {
        "tokens": normalized_tokens,
        "provider": normalized_provider,
    }

    if changed:
        await db.configs.update_one(
            {"key": CONFIG_KEY},
            {"$set": {"value": payload}},
            upsert=True,
        )

    return payload


async def update_swap_config(
    db,
    token_symbol: str,
    config: Dict[str, Any],
) -> Dict[str, Any]:
    existing = await db.configs.find_one({"key": CONFIG_KEY})
    current_value = existing.get("value", {}) if existing else _default_tokens()

    current_tokens = current_value.get("tokens", [])
    provider = current_value.get("provider", {})

    updated = False
    new_tokens = []

    for token in current_tokens:
        if token.get("token_symbol") == token_symbol:
            merged = {
                **token,
                **config,
                "token_symbol": token_symbol,
            }
            new_tokens.append(merged)
            updated = True
        else:
            new_tokens.append(token)

    if not updated:
        new_tokens.append(
            {
                "token_symbol": token_symbol,
                "enabled": True,
                "display_name": token_symbol,
                "swappable": True,
                "requires_wallet_balance": False,
                "route_group": "destination",
                **config,
            }
        )

    payload = {
        "tokens": new_tokens,
        "provider": {
            "id": provider.get("id", "embedded_swap"),
            "name": provider.get("name", "ZWAP Swap Flow"),
            "external_url": provider.get("external_url", "https://jumper.exchange"),
            "mode": provider.get("mode", "embedded_overlay"),
            "wallet_required": provider.get("wallet_required", True),
            "claim_required": provider.get("claim_required", True),
        },
    }

    await db.configs.update_one(
        {"key": CONFIG_KEY},
        {"$set": {"value": payload}},
        upsert=True,
    )

    return payload