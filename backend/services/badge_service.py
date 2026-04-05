"""
ZWAP! Badge Service
===================
Level-based badge progression + trophy reset system.

Core behavior:
- Each badge has Level I, II, III
- Completing a level grants zPts bonus
- Completing Level III masters that badge for the round
- When all 9 badges are mastered, user earns a Trophy
- Trophy increases permanent reward bonus
- Badge levels and round mastery reset for the next round

Locked from spec:
- 9 badges
- 3 levels each
- Trophy bonus caps at +10%
- Trophies do not reset
"""

from typing import Dict, Any, List


LEVEL_REWARDS = {
    1: 10,
    2: 20,
    3: 30,
}

MASTERY_BONUS = 15

TROPHY_BONUS_BY_COUNT = {
    1: 2,
    2: 4,
    3: 6,
    4: 8,
    5: 10,
}

BADGE_DEFS = {
    "starter": {
        "label": "Starter",
        "category": "Consistency",
        "progress_field": "badge_login_days",
        "levels": {1: 3, 2: 7, 3: 14},
    },
    "finisher": {
        "label": "Finisher",
        "category": "Consistency",
        "progress_field": "badge_full_loop_days",
        "levels": {1: 3, 2: 7, 3: 14},
    },
    "shaker": {
        "label": "Shaker",
        "category": "Movement",
        "progress_field": "badge_step_claims",
        "levels": {1: 10, 2: 25, 3: 50},
    },
    "mover": {
        "label": "Mover",
        "category": "Movement",
        "progress_field": "badge_sustained_move_days",
        "levels": {1: 7, 2: 21, 3: 45},
    },
    "contributor": {
        "label": "Contributor",
        "category": "Behavior",
        "progress_field": "badge_assists_sent",
        "levels": {1: 10, 2: 25, 3: 50},
    },
    "builder": {
        "label": "Builder",
        "category": "Behavior",
        "progress_field": "badge_deep_engagement",
        "levels": {1: 5, 2: 12, 3: 25},
    },
    "earner": {
        "label": "Earner",
        "category": "Activity",
        "progress_field": "badge_zpts_earned",
        "levels": {1: 1000, 2: 5000, 3: 15000},
    },
    "supporter": {
        "label": "Supporter",
        "category": "Activity",
        "progress_field": "badge_referrals",
        "levels": {1: 3, 2: 7, 3: 15},
    },
    "learner": {
        "label": "Learner",
        "category": "Activity",
        "progress_field": "badge_learn_completions",
        "levels": {1: 3, 2: 8, 3: 20},
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


def _trophy_bonus_for_count(trophy_count: int) -> int:
    safe_count = _safe_int(trophy_count)
    if safe_count >= 5:
        return 10
    return TROPHY_BONUS_BY_COUNT.get(safe_count, 0)


def _level_field(badge_key: str) -> str:
    return f"badge_{badge_key}_level"


def _mastered_field(badge_key: str) -> str:
    return f"badge_{badge_key}_mastered"


def _completed_field(badge_key: str) -> str:
    return f"badge_{badge_key}_completed"


def ensure_badge_fields(user: dict) -> dict:
    for badge_key, badge_def in BADGE_DEFS.items():
        progress_field = badge_def["progress_field"]
        level_field = _level_field(badge_key)
        mastered_field = _mastered_field(badge_key)
        completed_field = _completed_field(badge_key)

        if progress_field not in user:
            user[progress_field] = 0

        if level_field not in user:
            user[level_field] = 0

        if mastered_field not in user:
            user[mastered_field] = False

        if completed_field not in user:
            user[completed_field] = False

    if "badge_trophies" not in user:
        user["badge_trophies"] = 0

    if "badge_trophy_bonus_percent" not in user:
        user["badge_trophy_bonus_percent"] = 0

    if "badge_current_round" not in user:
        user["badge_current_round"] = 1

    return user


def evaluate_badges(user: dict) -> Dict[str, Any]:
    """
    Evaluate all badge levels from current cumulative progress.
    Returns a dict containing:
    - updates to persist
    - events for level-ups / mastery / trophy
    - bonus zPts awarded from level completions
    """
    ensure_badge_fields(user)

    updates: Dict[str, Any] = {}
    events: List[Dict[str, Any]] = []
    total_bonus_zpts = 0

    for badge_key in BADGE_ORDER:
        badge_def = BADGE_DEFS[badge_key]
        progress_field = badge_def["progress_field"]
        level_field = _level_field(badge_key)
        mastered_field = _mastered_field(badge_key)
        completed_field = _completed_field(badge_key)

        progress = _safe_int(user.get(progress_field))
        current_level = _safe_int(user.get(level_field))

        new_level = current_level
        for level, threshold in badge_def["levels"].items():
            if progress >= threshold:
                new_level = max(new_level, level)

        if new_level > current_level:
            for level in range(current_level + 1, new_level + 1):
                total_bonus_zpts += LEVEL_REWARDS.get(level, 0)
                events.append({
                    "type": "badge_level_up",
                    "badge_key": badge_key,
                    "badge_label": badge_def["label"],
                    "badge_category": badge_def["category"],
                    "new_level": level,
                    "reward_zpts": LEVEL_REWARDS.get(level, 0),
                })

            updates[level_field] = new_level
            user[level_field] = new_level

        is_mastered = new_level >= 3
        if is_mastered and not bool(user.get(mastered_field, False)):
            total_bonus_zpts += MASTERY_BONUS
            updates[mastered_field] = True
            user[mastered_field] = True
            events.append({
                "type": "badge_mastered",
                "badge_key": badge_key,
                "badge_label": badge_def["label"],
                "badge_category": badge_def["category"],
                "reward_zpts": MASTERY_BONUS,
            })

        completed = is_mastered
        updates[completed_field] = completed
        user[completed_field] = completed

    if total_bonus_zpts > 0:
        updates["zpts_balance"] = _safe_int(user.get("zpts_balance")) + total_bonus_zpts
        updates["badge_zpts_earned"] = _safe_int(user.get("badge_zpts_earned")) + total_bonus_zpts
        user["zpts_balance"] = updates["zpts_balance"]
        user["badge_zpts_earned"] = updates["badge_zpts_earned"]

    all_mastered = all(bool(user.get(_mastered_field(badge_key), False)) for badge_key in BADGE_ORDER)

    if all_mastered:
        current_trophies = _safe_int(user.get("badge_trophies"))
        new_trophies = current_trophies + 1
        new_bonus_percent = _trophy_bonus_for_count(new_trophies)

        updates["badge_trophies"] = new_trophies
        updates["badge_trophy_bonus_percent"] = new_bonus_percent
        updates["badge_current_round"] = _safe_int(user.get("badge_current_round", 1)) + 1

        user["badge_trophies"] = new_trophies
        user["badge_trophy_bonus_percent"] = new_bonus_percent
        user["badge_current_round"] = updates["badge_current_round"]

        events.append({
            "type": "badge_trophy_awarded",
            "trophy_count": new_trophies,
            "trophy_name": get_trophy_name(new_trophies),
            "reward_bonus_percent": new_bonus_percent,
        })

        # reset round-only badge state, keep cumulative progress + trophies
        for badge_key in BADGE_ORDER:
            level_field = _level_field(badge_key)
            mastered_field = _mastered_field(badge_key)
            completed_field = _completed_field(badge_key)

            updates[level_field] = 0
            updates[mastered_field] = False
            updates[completed_field] = False

            user[level_field] = 0
            user[mastered_field] = False
            user[completed_field] = False

    return {
        "updates": updates,
        "events": events,
        "bonus_zpts_awarded": total_bonus_zpts,
    }


def get_next_badge(user: dict) -> Dict[str, Any]:
    """
    Returns the next badge that should be shown in the dashboard.
    """
    ensure_badge_fields(user)

    for badge_key in BADGE_ORDER:
        badge_def = BADGE_DEFS[badge_key]
        progress_field = badge_def["progress_field"]
        level_field = _level_field(badge_key)

        progress = _safe_int(user.get(progress_field))
        level = _safe_int(user.get(level_field))

        if level < 3:
            next_level = level + 1
            goal = badge_def["levels"][next_level]

            return {
                "key": badge_key,
                "label": badge_def["label"],
                "category": badge_def["category"],
                "level": level,
                "next_level": next_level,
                "progress": min(progress, goal),
                "goal": goal,
                "completed": False,
                "hint": _build_badge_hint(badge_key, max(goal - progress, 0), next_level),
            }

    trophy_count = _safe_int(user.get("badge_trophies"))
    return {
        "key": "trophy",
        "label": get_trophy_name(trophy_count),
        "category": "Trophy",
        "level": trophy_count,
        "next_level": trophy_count + 1,
        "progress": 9,
        "goal": 9,
        "completed": True,
        "hint": "All badges mastered for this round. Trophy progression is active.",
    }


def get_trophy_name(trophy_count: int) -> str:
    safe_count = _safe_int(trophy_count)

    if safe_count <= 0:
        return "No Trophy"
    if safe_count == 1:
        return "Bronze Trophy"
    if safe_count == 2:
        return "Silver Trophy"
    if safe_count == 3:
        return "Gold Trophy"
    if safe_count == 4:
        return "Diamond Trophy"
    return "Ascendant Trophy"


def _build_badge_hint(badge_key: str, remaining: int, next_level: int) -> str:
    level_label = f"Level {next_level}"

    if badge_key == "starter":
        return f"{remaining} more daily login{'s' if remaining != 1 else ''} to reach Starter {level_label}."
    if badge_key == "finisher":
        return f"{remaining} more full daily loop{'s' if remaining != 1 else ''} to reach Finisher {level_label}."
    if badge_key == "shaker":
        return f"{remaining} more movement claim{'s' if remaining != 1 else ''} to reach Shaker {level_label}."
    if badge_key == "mover":
        return f"{remaining} more active movement day{'s' if remaining != 1 else ''} to reach Mover {level_label}."
    if badge_key == "contributor":
        return f"{remaining} more assist{'s' if remaining != 1 else ''} to reach Contributor {level_label}."
    if badge_key == "builder":
        return f"{remaining} more deep engagement action{'s' if remaining != 1 else ''} to reach Builder {level_label}."
    if badge_key == "earner":
        return f"{remaining} more zPts to reach Earner {level_label}."
    if badge_key == "supporter":
        return f"{remaining} more referral{'s' if remaining != 1 else ''} to reach Supporter {level_label}."
    if badge_key == "learner":
        return f"{remaining} more learn completion{'s' if remaining != 1 else ''} to reach Learner {level_label}."
    return "Keep going."


async def persist_badge_updates(db, user_id: str, updates: Dict[str, Any]):
    if not updates:
        return

    await db.users.update_one(
        {"id": user_id},
        {"$set": updates},
    )