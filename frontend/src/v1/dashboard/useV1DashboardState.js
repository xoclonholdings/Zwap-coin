import { useMemo, useState } from "react";

function asNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function asBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function getFirstNumber(user, keys, fallback = 0) {
  for (const key of keys) {
    const value = user?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return asNumber(value, fallback);
    }
  }

  return fallback;
}

function getFirstBoolean(user, keys, fallback = false) {
  for (const key of keys) {
    const value = user?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return asBoolean(value, fallback);
    }
  }

  return fallback;
}

function buildDisplayName({ user, authUser }) {
  return (
    user?.username ||
    user?.displayName ||
    user?.display_name ||
    user?.name ||
    authUser?.username ||
    authUser?.displayName ||
    authUser?.display_name ||
    authUser?.email?.address?.split("@")[0] ||
    authUser?.email?.split("@")[0] ||
    ""
  );
}

export default function useV1DashboardState({ user, authUser } = {}) {
  const [isZwapAltView, setIsZwapAltView] = useState(false);

  return useMemo(() => {
    const zptsBalance = getFirstNumber(
      user,
      ["zptsBalance", "zpts_balance", "zPts", "zpts"],
      0
    );

    const lifetimeZpts = getFirstNumber(
      user,
      ["lifetimeZpts", "lifetime_zpts"],
      zptsBalance
    );

    const dailySteps = getFirstNumber(
      user,
      ["dailySteps", "daily_steps", "todaySteps", "stepsToday", "steps"],
      0
    );

    const gamesPlayedToday = getFirstNumber(
      user,
      ["gamesPlayedToday", "games_played_today", "gamesPlayed"],
      0
    );

    const lessonsCompletedToday = getFirstNumber(
      user,
      ["lessonsCompletedToday", "lessons_completed_today"],
      0
    );

    const completedTaskCount = getFirstNumber(
      user,
      ["completedTaskCount", "completed_task_count"],
      0
    );

    const totalTaskCount = getFirstNumber(
      user,
      ["totalTaskCount", "total_task_count"],
      4
    );

    const streakDays = getFirstNumber(user, ["streakDays", "daily_streak"], 0);

    const healthPercent = getFirstNumber(
      user,
      ["healthPercent", "garden_health_percent"],
      100
    );

    const longestStreak = getFirstNumber(
      user,
      ["longestStreak", "longest_streak"],
      0
    );

    const totalBlooms = getFirstNumber(
      user,
      ["totalBlooms", "total_blooms"],
      0
    );

    const activeDays = getFirstNumber(
      user,
      ["activeDays", "active_days"],
      0
    );

    const missedDays = getFirstNumber(
      user,
      ["missedDays", "missed_days"],
      0
    );

    const daysUntilNextBloom = getFirstNumber(
      user,
      ["daysUntilNextBloom", "days_until_next_bloom"],
      0
    );

    const displayName = buildDisplayName({ user, authUser });

    const shopUnlocked = getFirstBoolean(
      user,
      ["shopUnlocked", "shop_unlocked"],
      lifetimeZpts >= 1000
    );

    const gardenUnlocked = getFirstBoolean(
      user,
      ["gardenUnlocked", "garden_unlocked"],
      false
    );

    const rarePlantUnlocked = getFirstBoolean(
      user,
      ["rarePlantUnlocked", "rare_plant_unlocked"],
      false
    );

    const badgeVisibilityUnlocked = getFirstBoolean(
      user,
      ["badgeVisibilityUnlocked", "badge_visibility_unlocked"],
      false
    );

    const learnUnlocked = getFirstBoolean(
      user,
      ["learnUnlocked", "learn_unlocked"],
      false
    );

    const streamUnlocked = getFirstBoolean(
      user,
      ["streamUnlocked", "stream_unlocked"],
      false
    );

    const assistUnlocked = getFirstBoolean(
      user,
      ["assistUnlocked", "assist_unlocked"],
      false
    );

    const isSwapUnlocked = getFirstBoolean(
      user,
      ["isSwapUnlocked", "swapUnlocked", "swap_unlocked"],
      false
    );

    const fullLoopCompleted = getFirstBoolean(
      user,
      ["fullLoopCompleted", "full_loop_completed"],
      false
    );

    const profileNeedsSetup = !displayName;
    const hasNewHighScore = getFirstBoolean(
      user,
      ["hasNewHighScore", "has_new_high_score"],
      false
    );

    const canSpendZpts = zptsBalance > 0;
    const shouldSaveZpts = !shopUnlocked;

    return {
      user,
      authUser,

      displayName,

      zptsBalance,
      lifetimeZpts,

      isZwapAltView,
      setIsZwapAltView,

      shopUnlocked,
      gardenUnlocked,
      rarePlantUnlocked,
      isSwapUnlocked,

      badgeVisibilityUnlocked,
      learnUnlocked,
      streamUnlocked,
      assistUnlocked,

      profileNeedsSetup,
      hasNewHighScore,
      canSpendZpts,
      shouldSaveZpts,

      completedTaskCount,
      totalTaskCount,

      streakDays,
      dailySteps,
      gamesPlayedToday,
      lessonsCompletedToday,
      lastActiveAt: user?.lastActiveAt || user?.last_active_at || null,
      fullLoopCompleted,

      healthPercent,
      growthStage: user?.growthStage || user?.garden_growth_stage || "seed",
      plantName: user?.plantName || user?.garden_plant_name || "Garden",

      longestStreak,
      totalBlooms,
      activeDays,
      missedDays,
      daysUntilNextBloom,
      nextRareUnlock:
        user?.nextRareUnlock || user?.next_rare_unlock || "Next bloom",
      streakGraceDaysRemaining: getFirstNumber(
        user,
        ["streakGraceDaysRemaining", "streak_grace_days_remaining"],
        0
      ),

      zwapMode: user?.zwapMode || user?.zwap_mode || "voice",
      zwapMessage: user?.zwapMessage || user?.zwap_message || "",
      zwapHint: user?.zwapHint || user?.zwap_hint || "",
    };
  }, [user, authUser, isZwapAltView]);
}