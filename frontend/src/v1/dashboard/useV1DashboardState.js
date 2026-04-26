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
      0
    );

    const longestStreak = getFirstNumber(user, ["longestStreak"], 0);
    const totalBlooms = getFirstNumber(user, ["totalBlooms"], 0);
    const activeDays = getFirstNumber(user, ["activeDays"], 0);
    const missedDays = getFirstNumber(user, ["missedDays"], 0);
    const daysUntilNextBloom = getFirstNumber(user, ["daysUntilNextBloom"], 0);

    const displayName = buildDisplayName({ user, authUser });

    const shopUnlocked =
      zptsBalance >= 1000 ||
      getFirstBoolean(user, ["shopUnlocked", "shop_unlocked"], false);

    const gardenUnlocked =
      getFirstBoolean(user, ["gardenUnlocked", "garden_unlocked"], false) ||
      streakDays >= 3 ||
      completedTaskCount >= totalTaskCount;

    const badgeVisibilityUnlocked =
      getFirstBoolean(
        user,
        ["badgeVisibilityUnlocked", "badge_visibility_unlocked"],
        false
      ) || streakDays >= 7;

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

    const fullLoopCompleted =
      getFirstBoolean(user, ["fullLoopCompleted", "full_loop_completed"], false) ||
      completedTaskCount >= totalTaskCount;

    const rarePlantUnlocked = getFirstBoolean(
      user,
      ["rarePlantUnlocked", "rare_plant_unlocked"],
      false
    );

    const profileNeedsSetup = !displayName;
    const hasNewHighScore = getFirstBoolean(user, ["hasNewHighScore"], false);
    const canSpendZpts = zptsBalance > 0;
    const shouldSaveZpts = zptsBalance < 1000;

    return {
      user,
      authUser,

      displayName,

      zptsBalance,

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
      growthStage: user?.growthStage || user?.garden_growth_stage || "Seed",
      plantName: user?.plantName || user?.garden_plant_name || "Garden",

      longestStreak,
      totalBlooms,
      activeDays,
      missedDays,
      daysUntilNextBloom,
      nextRareUnlock: user?.nextRareUnlock || "Next bloom",
      streakGraceDaysRemaining: getFirstNumber(
        user,
        ["streakGraceDaysRemaining", "streak_grace_days_remaining"],
        0
      ),

      zwapMode: user?.zwapMode || user?.zwap_mode || "voice",
      zwapMessage:
        user?.zwapMessage ||
        user?.zwap_message ||
        "Ready when you are.",
      zwapHint:
        user?.zwapHint ||
        user?.zwap_hint ||
        "Complete actions to build today’s progress.",
    };
  }, [user, authUser, isZwapAltView]);
}