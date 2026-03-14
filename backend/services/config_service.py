from typing import Dict


async def get_config(db, key: str) -> Dict:
    """
    Retrieves system config by key.
    """
    return await db.configs.find_one({"key": key})


async def update_config(db, key: str, value) -> Dict:
    """
    Updates or creates a system config.
    """
    await db.configs.update_one(
        {"key": key},
        {"$set": {"value": value}},
        upsert=True
    )
    return {"key": key, "value": value}


# Walk-to-earn and game-specific config helpers
async def get_walk_to_earn_config(db):
    return await get_config(db, "walk_to_earn")


async def update_walk_to_earn_config(db, value):
    return await update_config(db, "walk_to_earn", value)


from typing import Dict


async def get_config(db, key: str) -> Dict:
    """
    Retrieves system config by key.
    """
    return await db.configs.find_one({"key": key})


async def update_config(db, key: str, value) -> Dict:
    """
    Updates or creates a system config.
    """
    await db.configs.update_one(
        {"key": key},
        {"$set": {"value": value}},
        upsert=True
    )
    return {"key": key, "value": value}


# Walk-to-earn and game-specific config helpers
async def get_walk_to_earn_config(db):
    return await get_config(db, "walk_to_earn")


async def update_walk_to_earn_config(db, value):
    return await update_config(db, "walk_to_earn", value)


async def get_game_config(db):
    config = await get_config(db, "game_config")
    print("GAME CONFIG RAW:", config)

    if not config:
        return {"games": []}

    value = config.get("value", {})
    games = value.get("games", [])

    if isinstance(games, list):
        return {"games": games}

    return {"games": []}


async def update_game_config(db, game_id, value):
    config = await get_config(db, "game_config")

    current_value = config.get("value", {}) if config else {}
    current_games = current_value.get("games", [])

    updated = False
    new_games = []

    for game in current_games:
        if game.get("game_id") == game_id:
            merged = {**game, **value}
            merged["game_id"] = game_id
            new_games.append(merged)
            updated = True
        else:
            new_games.append(game)

    if not updated:
        new_games.append({"game_id": game_id, **value})

    return await update_config(db, "game_config", {"games": new_games})


async def update_game_config(db, game_id, value):
    config = await get_config(db, "game_config")

    current_value = config.get("value", {}) if config else {}
    current_games = current_value.get("games", [])

    updated = False
    new_games = []

    for game in current_games:
        if game.get("game_id") == game_id:
            merged = {**game, **value}
            merged["game_id"] = game_id
            new_games.append(merged)
            updated = True
        else:
            new_games.append(game)

    if not updated:
        new_games.append({"game_id": game_id, **value})

    return await update_config(db, "game_config", {"games": new_games})