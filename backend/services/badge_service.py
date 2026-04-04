"""
ZWAP! Badge Service
===================
Tracks badge progress counters and resolves the next badge target.
"""

from typing import Dict


BADGE_DEFS = {
    "starter": {
        "label": "Starter",
        "category": "Consistency",
        "goal": 3,
        "progress_field": "badge_login_days",
    },
    "finisher": {
        "label": "Finisher",
        "category": "Consistency",
        "goal": 7,
        "progress_field": "badge_full_loop_days",
    },
    "shaker": {
        "label": "Shaker",
        "category": "Movement",
        "goal": 5,
        "progress_field": "badge_step_days",
    },
    "mover": {
        "label": "Mover",
        "category": "Movement",
        "goal": 7,
        "progress_field": "badge_sustained_move_days",
    },
    "contributor": {
        "label": "Contributor",
        "category": "Behavior",
        "goal": 10,
        "progress_field": "badge_assists_sent",
    },
    "builder": {
        "label": "Builder",
        "category": "Behavior",
        "goal": 5,
        "progress_field": "badge_deep_engagement",
    },
    "earner": {
        "label": "Earner",
        "category": "Activity",
        "goal": 1000,
        "progress_field": "badge_zpts_earned",
    },
    "supporter": {
        "label": "Supporter",
        "category": "Activity",
        "goal": 3,
        "progress_field": "badge_referrals",
    },
    "learner": {
        "label": "Learner",
        "category": "Activity",
        "goal": 3,
        "progress_field": "badge_learn_completions",
    },
}

BADGE_ORDER = [
    "starter",
    "finisher",
    "shaker",
    "mover",
    "contributor",
    "builder",
    "earner",
    "supporter",
    "learner",
]


def _safe_int(value) -> int:
    return max(int(value or 0), 0)


def ensure_badge_fields(user: dict) -> dict:
    for badge_key, badge_def in BADGE_DEFS.items():
        progress_field = badge_def["progress_field"]
        completed_field = f"badge_{badge_key}_completed"

        if progress_field not in user:
            user[progress_field] = 0

        if completed_field not in user:
            user[completed_field] = False

    return user


def evaluate_badges(user: dict) -> dict:
    """
    Recompute badge completion flags from current progress fields.
    """
    ensure_badge_fields(user)

    updates = {}

    for badge_key, badge_def in BADGE_DEFS.items():
      progress_field = badge_def["progress_field"]
      completed_field = f"badge_{badge_key}_completed"

      progress = _safe_int(user.get(progress_field))
      goal = _safe_int(badge_def["goal"])
      completed = progress >= goal

      user[completed_field] = completed
      updates[completed_field] = completed

    return updates


def get_next_badge(user: dict) -> Dict:
    """
    Resolve the next incomplete badge in display order.
    """
    ensure_badge_fields(user)

    for badge_key in BADGE_ORDER:
        badge_def = BADGE_DEFS[badge_key]
        progress_field = badge_def["progress_field"]
        completed_field = f"badge_{badge_key}_completed"

        progress = _safe_int(user.get(progress_field))
        goal = _safe_int(badge_def["goal"])
        completed = bool(user.get(completed_field, False))

        if not completed:
            remaining = max(goal - progress, 0)
            return {
                "key": badge_key,
                "label": badge_def["label"],
                "category": badge_def["category"],
                "progress": min(progress, goal),
                "goal": goal,
                "completed": False,
                "hint": _build_badge_hint(badge_key, remaining),
            }

    last_key = BADGE_ORDER[-1]
    last_badge = BADGE_DEFS[last_key]
    return {
        "key": last_key,
        "label": last_badge["label"],
        "category": last_badge["category"],
        "progress": last_badge["goal"],
        "goal": last_badge["goal"],
        "completed": True,
        "hint": f"{last_badge['label']} completed.",
    }


def _build_badge_hint(badge_key: str, remaining: int) -> str:
    if badge_key == "starter":
        return f"{remaining} more daily login{'s' if remaining != 1 else ''} to reach Starter."
    if badge_key == "finisher":
        return f"{remaining} more full daily loop{'s' if remaining != 1 else ''} to reach Finisher."
    if badge_key == "shaker":
        return f"{remaining} more active step day{'s' if remaining != 1 else ''} to reach Shaker."
    if badge_key == "mover":
        return f"{remaining} more movement day{'s' if remaining != 1 else ''} to reach Mover."
    if badge_key == "contributor":
        return f"{remaining} more assist{'s' if remaining != 1 else ''} to reach Contributor."
    if badge_key == "builder":
        return f"{remaining} more deep engagement action{'s' if remaining != 1 else ''} to reach Builder."
    if badge_key == "earner":
        return f"{remaining} more zPts to reach Earner."
    if badge_key == "supporter":
        return f"{remaining} more referral{'s' if remaining != 1 else ''} to reach Supporter."
    if badge_key == "learner":
        return f"{remaining} more learn completion{'s' if remaining != 1 else ''} to reach Learner."
    return "Keep going."


async def persist_badge_updates(db, user_id: str, updates: dict):
    if not updates:
        return

    await db.users.update_one(
        {"id": user_id},
        {"$set": updates},
    )