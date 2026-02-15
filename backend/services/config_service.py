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
    return await get_config(db, "game_config")

async def update_game_config(db, value):
    return await update_config(db, "game_config", value)
