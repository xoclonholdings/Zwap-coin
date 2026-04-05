from datetime import datetime, timezone
import asyncio

from services.leaderboard_reward_service import process_leaderboard_rewards


_leaderboard_task = None


async def leaderboard_reward_loop(db):
    """
    Daily leaderboard payout loop.
    Runs once every 24 hours.
    """
    while True:
        try:
            print(
                f"[scheduler] Running leaderboard rewards at {datetime.now(timezone.utc).isoformat()}"
            )
            result = await process_leaderboard_rewards(db, category="zpts")
            print(f"[scheduler] Leaderboard rewards complete: {result}")
        except Exception as e:
            print(f"[scheduler] Leaderboard reward loop error: {e}")

        await asyncio.sleep(60 * 60 * 24)


def start_scheduler(app):
    """
    Starts background scheduler task.
    """
    global _leaderboard_task

    if _leaderboard_task is None:
        _leaderboard_task = asyncio.create_task(
            leaderboard_reward_loop(app.state.db)
        )


async def stop_scheduler():
    """
    Stops background scheduler task.
    """
    global _leaderboard_task

    if _leaderboard_task:
        _leaderboard_task.cancel()
        try:
            await _leaderboard_task
        except Exception:
            pass
        _leaderboard_task = None