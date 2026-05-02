from typing import Any, Dict, List

CONFIG_KEY = "swap_config"


def _default_config() -> Dict[str, Any]:
    return {
        "version": 3,

        # VISIBILITY / PROGRESSION CONTROL
        "status": {
            "swap_visible": True,
            "swap_unlocked": False,
            "unlock_phase": "phase_c",
            "unlock_reason": "Swap unlocks after consistent progress is established.",
        },

        # CONVERSION (zPts → claimable ZWAP)
        "conversion": {
            "enabled": True,
            "rate_zpts_per_zwap": 1000,
            "minimum_zpts": 1000,
            "source": "zPts",
            "destination": "claimable_ZWAP",
        },

        # CLAIM (claimable ZWAP → wallet ZWAP)
        "claim": {
            "enabled": True,
            "wallet_provider": "privy",
            "requires_wallet": True,
            "requires_signature": True,
            "source": "claimable_ZWAP",
            "destination": "wallet_ZWAP",
        },

        # SWAP (wallet ZWAP → external assets via LI.FI)
        "swap": {
            "enabled": True,
            "locked": True,
            "wallet_provider": "privy",
            "route_provider": "lifi",
            "mode": "embedded",
            "requires_wallet": True,
            "requires_signature": True,
            "external_redirect": False,
        },

        # FEATURED SWAP ROUTES (UI + routing separation)
        "featured_swaps": [
            {
                "id": "zwap-btc",
                "from_token": "ZWAP",
                "to_token": "BTC",

                # USER DISPLAY
                "display_symbol": "BTC",
                "display_name": "Bitcoin",
                "display_label": "Bitcoin (BTC)",

                # ROUTING
                "route_token_symbol": "WBTC",
                "network": "polygon",

                "enabled": True,
                "locked": True,
            },
            {
                "id": "zwap-eth",
                "from_token": "ZWAP",
                "to_token": "ETH",

                "display_symbol": "ETH",
                "display_name": "Ethereum",
                "display_label": "Ethereum (ETH)",

                "route_token_symbol": "WETH",
                "network": "polygon",

                "enabled": True,
                "locked": True,
            },
            {
                "id": "zwap-pol",
                "from_token": "ZWAP",
                "to_token": "POL",

                "display_symbol": "POL",
                "display_name": "Polygon",
                "display_label": "Polygon (POL)",

                "route_token_symbol": "POL",
                "network": "polygon",

                "enabled": True,
                "locked": True,
            },
            {
                "id": "zwap-usdc",
                "from_token": "ZWAP",
                "to_token": "USDC",

                "display_symbol": "USDC",
                "display_name": "USD Coin",
                "display_label": "USD Coin (USDC)",

                "route_token_symbol": "USDC",
                "network": "polygon",

                "enabled": True,
                "locked": True,
            },
        ],
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
    section: str,
    updates: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Admin update for sections:
    - status
    - conversion
    - claim
    - swap
    """
    config = await get_swap_config(db)

    if section not in config:
        return config

    updated_section = {
        **config.get(section, {}),
        **updates,
    }

    config[section] = updated_section

    await db.configs.update_one(
        {"key": CONFIG_KEY},
        {"$set": {"value": config}},
        upsert=True,
    )

    return config


async def update_featured_swap(
    db,
    swap_id: str,
    updates: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Admin update for a specific featured swap route.
    """
    config = await get_swap_config(db)

    swaps: List[Dict[str, Any]] = config.get("featured_swaps", [])
    updated_swaps: List[Dict[str, Any]] = []

    found = False

    for swap in swaps:
        if swap.get("id") == swap_id:
            merged = {
                **swap,
                **updates,
                "id": swap_id,
            }
            updated_swaps.append(merged)
            found = True
        else:
            updated_swaps.append(swap)

    if not found:
        updated_swaps.append({
            "id": swap_id,
            **updates,
        })

    config["featured_swaps"] = updated_swaps

    await db.configs.update_one(
        {"key": CONFIG_KEY},
        {"$set": {"value": config}},
        upsert=True,
    )

    return config