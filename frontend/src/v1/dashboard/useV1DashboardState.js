import { useMemo, useState } from "react";

const ADMIN_PREVIEW_ZPTS = 5000;

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

function buildTaskStates({
  isAuthenticated = false,
  isAdminPreviewUser = false,
  dailySteps = 0,
  gamesPlayedToday = 0,
  shopUnlocked = false,
}) {
  return [
    {
      label: "Login",
      completed: Boolean(isAuthenticated || isAdminPreviewUser),
    },
    {
      label: "Move",
      completed: Boolean(isAdminPreviewUser || dailySteps > 0),
    },
    {
      label: "Play",
      completed: Boolean(isAdminPreviewUser || gamesPlayedToday > 0),
    },
    {
      label: shopUnlocked ? "Shop" : "Learn",
      completed: Boolean(shopUnlocked),
    },
  ];
}

export default function useV1DashboardState({
  user,
  authUser,
  isAuthenticated = false,
  isAdminPreviewUser = false,
} = {}) {
  const [isZwapAltView, setIsZwapAltView] = useState(false);

  return useMemo(() => {
    const baseZptsBalance = getFirstNumber(
      user,
      ["zptsBalance", "zpts_balance", "zPts", "zpts"],
      0
    );

    const zptsBalance = isAdminPreviewUser
      ? Math.max(baseZptsBalance, ADMIN_PREVIEW_ZPTS)
      : baseZptsBalance;

    const lifetimeZpts = isAdminPreviewUser
      ? Math.max(
          getFirstNumber(user, ["lifetimeZpts", "lifetime_zpts"], zptsBalance),
          ADMIN_PREVIEW_ZPTS
        )
      : getFirstNumber(user, ["lifetimeZpts", "lifetime_zpts"], zptsBalance);

    const dailySteps = isAdminPreviewUser
      ? Math.max(
          getFirstNumber(
            user,
            ["dailySteps", "daily_steps", "todaySteps", "stepsToday", "steps"],
            0
          ),
          20
        )
      : getFirstNumber(
          user,
          ["dailySteps", "daily_steps", "todaySteps", "stepsToday", "steps"],
          0
        );

    const gamesPlayedToday = isAdminPreviewUser
      ? Math.max(
          getFirstNumber(
            user,
            ["gamesPlayedToday", "games_played_today", "gamesPlayed"],
            0
          ),
          1
        )
      : getFirstNumber(
          user,
          ["gamesPlayedToday", "games_played_today", "gamesPlayed"],
          0
        );

    const lessonsCompletedToday = getFirstNumber(
      user,
      ["lessonsCompletedToday", "lessons_completed_today"],
      0
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

    const activeDays = getFirstNumber(user, ["activeDays", "active_days"], 0);
    const missedDays = getFirstNumber(user, ["missedDays", "missed_days"], 0);

    const daysUntilNextBloom = getFirstNumber(
      user,
      ["daysUntilNextBloom", "days_until_next_bloom"],
      0
    );

    const displayName = buildDisplayName({ user, authUser });

    const shopUnlocked =
      isAdminPreviewUser ||
      getFirstBoolean(
        user,
        ["shopUnlocked", "shop_unlocked"],
        lifetimeZpts >= 1000
      );

    const gardenUnlocked =
      isAdminPreviewUser ||
      getFirstBoolean(user, ["gardenUnlocked", "garden_unlocked"], false);

    const rarePlantUnlocked =
      isAdminPreviewUser ||
      getFirstBoolean(
        user,
        ["rarePlantUnlocked", "rare_plant_unlocked"],
        false
      );

    const badgeVisibilityUnlocked =
      isAdminPreviewUser ||
      getFirstBoolean(
        user,
        ["badgeVisibilityUnlocked", "badge_visibility_unlocked"],
        false
      );

    const learnUnlocked =
      isAdminPreviewUser ||
      getFirstBoolean(user, ["learnUnlocked", "learn_unlocked"], false);

    const streamUnlocked =
      isAdminPreviewUser ||
      getFirstBoolean(user, ["streamUnlocked", "stream_unlocked"], false);

    const assistUnlocked =
      isAdminPreviewUser ||
      getFirstBoolean(user, ["assistUnlocked", "assist_unlocked"], false);

    const isSwapUnlocked =
      isAdminPreviewUser ||
      getFirstBoolean(
        user,
        ["isSwapUnlocked", "swapUnlocked", "swap_unlocked"],
        false
      );

    const fullLoopCompleted = getFirstBoolean(
      user,
      ["fullLoopCompleted", "full_loop_completed"],
      false
    );

    const taskStates = buildTaskStates({
      isAuthenticated,
      isAdminPreviewUser,
      dailySteps,
      gamesPlayedToday,
      shopUnlocked,
    });

    const completedTaskCount = taskStates.filter((task) => task.completed).length;
    const totalTaskCount = taskStates.length;

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
      taskStates,

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
  }, [user, authUser, isAuthenticated, isAdminPreviewUser, isZwapAltView]);
}
