from typing import Dict, List, Any

CONFIG_KEY = "swap_config"


def _default_config() -> Dict[str, Any]:
    return {
        "tokens": [
            {
                "token_symbol": "ZWAP",
                "enabled": True,
                "display_name": "ZWAP",
                "route_group": "source",
            },
            {
                "token_symbol": "POL",
                "enabled": True,
                "display_name": "POL",
                "route_group": "destination",
            },
            {
                "token_symbol": "ETH",
                "enabled": True,
                "display_name": "ETH",
                "route_group": "destination",
            },
            {
                "token_symbol": "USDC",
                "enabled": True,
                "display_name": "USDC",
                "route_group": "destination",
            },
        ],
        "provider": {
            "id": "jumper",
            "name": "Swap",
            "external_url": "https://jumper.exchange",
            "mode": "external",
            "wallet_required": True,
        },
    }


async def get_swap_config(db) -> Dict[str, Any]:
    """
    Returns swap configuration.
    Seeds defaults if missing.
    """
    config = await db.configs.find_one({"key": CONFIG_KEY})

    if not config:
        defaults = _default_config()
        await db.configs.update_one(
            {"key": CONFIG_KEY},
            {"$set": {"value": defaults}},
            upsert=True,
        )
        return defaults

    return config.get("value", _default_config())


async def update_swap_config(
    db,
    token_symbol: str,
    updates: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Admin update for a single token.
    """
    config = await get_swap_config(db)

    tokens = config.get("tokens", [])
    updated_tokens: List[Dict[str, Any]] = []

    found = False

    for token in tokens:
        if token.get("token_symbol") == token_symbol:
            merged = {
                **token,
                **updates,
                "token_symbol": token_symbol,
            }
            updated_tokens.append(merged)
            found = True
        else:
            updated_tokens.append(token)

    if not found:
        updated_tokens.append({
            "token_symbol": token_symbol,
            "enabled": True,
            "display_name": token_symbol,
            "route_group": "destination",
            **updates,
        })

    payload = {
        "tokens": updated_tokens,
        "provider": config.get("provider", _default_config()["provider"]),
    }

    await db.configs.update_one(
        {"key": CONFIG_KEY},
        {"$set": {"value": payload}},
        upsert=True,
    )

    return payload