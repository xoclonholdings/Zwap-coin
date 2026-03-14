from typing import Dict, List, Any


CONFIG_KEY = "swap_config"


def _default_tokens() -> Dict[str, List[Dict[str, Any]]]:
    return {
        "tokens": [
            {
                "token_symbol": "ZWAP",
                "enabled": True,
                "external_url": "https://jumper.exchange",
            },
            {
                "token_symbol": "MATIC",
                "enabled": True,
                "external_url": "https://jumper.exchange",
            },
            {
                "token_symbol": "USDC",
                "enabled": True,
                "external_url": "https://jumper.exchange",
            },
            {
                "token_symbol": "USDT",
                "enabled": True,
                "external_url": "https://jumper.exchange",
            },
            {
                "token_symbol": "WETH",
                "enabled": True,
                "external_url": "https://jumper.exchange",
            },
            {
                "token_symbol": "WBTC",
                "enabled": True,
                "external_url": "https://jumper.exchange",
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

    if isinstance(tokens, list):
        return {"tokens": tokens}

    return {"tokens": []}


async def update_swap_config(db, token_symbol: str, config: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    existing = await db.configs.find_one({"key": CONFIG_KEY})
    current_value = existing.get("value", {}) if existing else {}
    current_tokens = current_value.get("tokens", [])

    updated = False
    new_tokens = []

    for token in current_tokens:
        if token.get("token_symbol") == token_symbol:
            merged = {**token, **config}
            merged["token_symbol"] = token_symbol
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