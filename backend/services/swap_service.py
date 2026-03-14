from typing import Dict, List, Any


CONFIG_KEY = "swap_config"


def _default_tokens() -> Dict[str, List[Dict[str, Any]]]:
    return {
        "tokens": [
            {
                "token_symbol": "ZWAP",
                "enabled": True,
                "external_url": "https://jumper.exchange",
                "preferred_service": "1inch",
                "embedded_services": ["1inch", "quickswap"],
                "fallback_services": ["jumper"],
            },
            {
                "token_symbol": "MATIC",
                "enabled": True,
                "external_url": "https://jumper.exchange",
                "preferred_service": "1inch",
                "embedded_services": ["1inch", "quickswap"],
                "fallback_services": ["jumper"],
            },
            {
                "token_symbol": "USDC",
                "enabled": True,
                "external_url": "https://jumper.exchange",
                "preferred_service": "1inch",
                "embedded_services": ["1inch", "quickswap"],
                "fallback_services": ["jumper"],
            },
            {
                "token_symbol": "USDT",
                "enabled": True,
                "external_url": "https://jumper.exchange",
                "preferred_service": "1inch",
                "embedded_services": ["1inch", "quickswap"],
                "fallback_services": ["jumper"],
            },
            {
                "token_symbol": "WETH",
                "enabled": True,
                "external_url": "https://jumper.exchange",
                "preferred_service": "1inch",
                "embedded_services": ["1inch", "quickswap"],
                "fallback_services": ["jumper"],
            },
            {
                "token_symbol": "WBTC",
                "enabled": True,
                "external_url": "https://jumper.exchange",
                "preferred_service": "1inch",
                "embedded_services": ["1inch", "quickswap"],
                "fallback_services": ["jumper"],
            },
        ]
    }


async def get_swap_config(db) -> Dict[str, List[Dict[str, Any]]]:
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

    if not isinstance(tokens, list):
        return {"tokens": []}

    # Backfill missing fields for older saved configs without destroying existing data
    changed = False
    normalized_tokens = []

    for token in tokens:
        normalized = {
            "token_symbol": token.get("token_symbol"),
            "enabled": token.get("enabled", True),
            "external_url": token.get("external_url", "https://jumper.exchange"),
            "preferred_service": token.get("preferred_service", "1inch"),
            "embedded_services": token.get("embedded_services", ["1inch", "quickswap"]),
            "fallback_services": token.get("fallback_services", ["jumper"]),
        }

        if normalized != token:
            changed = True

        normalized_tokens.append(normalized)

    payload = {"tokens": normalized_tokens}

    if changed:
        await db.configs.update_one(
            {"key": CONFIG_KEY},
            {"$set": {"value": payload}},
            upsert=True,
        )

    return payload


async def update_swap_config(
    db, token_symbol: str, config: Dict[str, Any]
) -> Dict[str, List[Dict[str, Any]]]:
    existing = await db.configs.find_one({"key": CONFIG_KEY})
    current_value = existing.get("value", {}) if existing else {}
    current_tokens = current_value.get("tokens", [])

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
                "external_url": "https://jumper.exchange",
                "preferred_service": "1inch",
                "embedded_services": ["1inch", "quickswap"],
                "fallback_services": ["jumper"],
                **config,
            }
        )

    payload = {"tokens": new_tokens}

    await db.configs.update_one(
        {"key": CONFIG_KEY},
        {"$set": {"value": payload}},
        upsert=True,
    )

    return payload