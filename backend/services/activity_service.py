def build_personal_bests(user: Dict[str, Any]) -> List[Dict[str, Any]]:
    bests = []

    # ---------------------------
    # Movement-based bests
    # ---------------------------

    best_steps = safe_int(user.get("best_steps"))
    if best_steps > 0:
        bests.append(
            {
                "type": "steps",
                "label": "Most Steps",
                "value": best_steps,
                "date": user.get("best_steps_date"),
            }
        )

    best_calories = safe_int(user.get("best_calories"))
    if best_calories > 0:
        bests.append(
            {
                "type": "calories",
                "label": "Most Calories",
                "value": best_calories,
                "date": user.get("best_calories_date"),
            }
        )

    best_active_time = user.get("best_active_time")
    if best_active_time:
        bests.append(
            {
                "type": "time",
                "label": "Longest Active",
                "value": best_active_time,
                "date": user.get("best_active_time_date"),
            }
        )

    # ---------------------------
    # 🎮 GAME PERSONAL BESTS (CRITICAL FIX)
    # ---------------------------

    GAME_IDS = [
        "stackz",
        "breakerz",
        "pulze",
        "zap-man",
    ]

    for game_id in GAME_IDS:
        field = f"personal_best_{game_id.replace('-', '_')}"
        score = safe_int(user.get(field))

        if score > 0:
            bests.append(
                {
                    "type": "game",
                    "gameId": game_id,
                    "label": f"{game_id.upper()} High Score",
                    "value": score,
                }
            )

    return bests