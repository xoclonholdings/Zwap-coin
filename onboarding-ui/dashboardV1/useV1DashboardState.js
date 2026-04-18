import { useMemo, useState } from "react";

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function percent(part, whole) {
  const safeWhole = Math.max(1, toNumber(whole, 1));
  return clamp(toNumber(part, 0) / safeWhole) * 100;
}

function formatZpts(value) {
  return toNumber(value, 0).toLocaleString();
}

function deriveShopUnlocked({
  explicitShopUnlocked,
  user,
  lifetimeZpts,
}) {
  if (typeof explicitShopUnlocked === "boolean") return explicitShopUnlocked;
  if (typeof user?.shop_unlocked === "boolean") return user.shop_unlocked;
  if (typeof user?.shopUnlocked === "boolean") return user.shopUnlocked;

  return lifetimeZpts >= 1000;
}

function deriveGardenUnlocked({
  explicitGardenUnlocked,
  user,
  streakDays,
  fullLoopCompleted,
}) {
  if (typeof explicitGardenUnlocked === "boolean") return explicitGardenUnlocked;
  if (typeof user?.garden_unlocked === "boolean") return user.garden_unlocked;
  if (typeof user?.gardenUnlocked === "boolean") return user.gardenUnlocked;

  return streakDays >= 3 || fullLoopCompleted;
}

function deriveRarePlantUnlocked({
  explicitRarePlantUnlocked,
  user,
  streakDays,
}) {
  if (typeof explicitRarePlantUnlocked === "boolean") return explicitRarePlantUnlocked;
  if (typeof user?.rare_plant_unlocked === "boolean") return user.rare_plant_unlocked;
  if (typeof user?.rarePlantUnlocked === "boolean") return user.rarePlantUnlocked;

  return streakDays >= 30;
}

function deriveGrowthStage({
  explicitGrowthStage,
  user,
  streakDays,
  activeDays,
  fullLoopCompleted,
  rarePlantUnlocked,
}) {
  if (rarePlantUnlocked || streakDays >= 30) return "rare";

  const incoming =
    explicitGrowthStage ??
    user?.growth_stage ??
    user?.growthStage;

  if (incoming && incoming !== "seed") return incoming;
  if (streakDays >= 14 || (fullLoopCompleted && activeDays >= 10)) return "mature";
  if (streakDays >= 7 || activeDays >= 6) return "young";
  if (streakDays >= 3 || activeDays >= 3) return "sprout";
  return "seed";
}

function deriveHealthPercent({
  explicitHealthPercent,
  user,
  missedDays,
  fullLoopCompleted,
  streakDays,
  dailySteps,
  gamesPlayedToday,
  lessonsCompletedToday,
}) {
  const incoming = toNumber(
    explicitHealthPercent ??
      user?.health_percent ??
      user?.healthPercent,
    NaN
  );

  if (Number.isFinite(incoming)) {
    return clamp(incoming, 0, 100);
  }

  let health = 70;

  if (missedDays > 0) health -= missedDays * 10;
  if (fullLoopCompleted) health += 15;
  if (streakDays > 0) health += 5;
  if (dailySteps >= 5000) health += 5;

  if (
    dailySteps >= 3000 &&
    gamesPlayedToday > 0 &&
    lessonsCompletedToday > 0
  ) {
    health += 10;
  }

  return clamp(health, 0, 100);
}

function deriveDaysUntilNextBloom({
  explicitDaysUntilNextBloom,
  user,
  growthStage,
  streakDays,
}) {
  const incoming = toNumber(
    explicitDaysUntilNextBloom ??
      user?.days_until_next_bloom ??
      user?.daysUntilNextBloom,
    NaN
  );

  if (Number.isFinite(incoming)) {
    return Math.max(0, incoming);
  }

  if (growthStage === "seed") return Math.max(0, 3 - streakDays);
  if (growthStage === "sprout") return Math.max(0, 7 - streakDays);
  if (growthStage === "young") return Math.max(0, 14 - streakDays);
  return 0;
}

function deriveNextRareUnlock({
  explicitNextRareUnlock,
  user,
  streakDays,
  rarePlantUnlocked,
}) {
  const incoming =
    explicitNextRareUnlock ??
    user?.next_rare_unlock ??
    user?.nextRareUnlock;

  if (incoming != null) return incoming;

  if (rarePlantUnlocked && streakDays >= 90) return "Rare growth unlocked";
  if (streakDays < 30) return 30;
  if (streakDays < 60) return 60;
  if (streakDays < 90) return 90;
  return "Rare growth unlocked";
}

function deriveCompletedTaskCount({
  explicitCompletedTaskCount,
  user,
  gamesPlayedToday,
  dailySteps,
  fullLoopCompleted,
}) {
  if (explicitCompletedTaskCount != null) {
    return Math.max(0, toNumber(explicitCompletedTaskCount, 0));
  }

  const stored =
    user?.completed_task_count ??
    user?.completedTaskCount ??
    user?.daily_tasks_completed;

  if (stored != null) {
    return Math.max(0, toNumber(stored, 0));
  }

  let count = 1; // login assumed on active dashboard view

  if (dailySteps > 0) count += 1;
  if (gamesPlayedToday > 0) count += 1;
  if (fullLoopCompleted) count = Math.max(count, 4);

  return count;
}

function deriveTotalTaskCount({
  explicitTotalTaskCount,
  user,
}) {
  if (explicitTotalTaskCount != null) {
    return Math.max(1, toNumber(explicitTotalTaskCount, 4));
  }

  const stored =
    user?.total_task_count ??
    user?.totalTaskCount ??
    user?.daily_tasks_total;

  if (stored != null) {
    return Math.max(1, toNumber(stored, 4));
  }

  return 4;
}

function deriveBooleanFlag(explicitValue, userValues = [], fallback = false) {
  if (typeof explicitValue === "boolean") return explicitValue;

  for (const value of userValues) {
    if (typeof value === "boolean") return value;
  }

  return fallback;
}

function deriveSpendState({
  explicitCanSpendZpts,
  explicitShouldSaveZpts,
  user,
  zptsBalance,
  shopUnlocked,
}) {
  const canSpendZpts = deriveBooleanFlag(
    explicitCanSpendZpts,
    [user?.can_spend_zpts, user?.canSpendZpts],
    shopUnlocked && zptsBalance >= 100
  );

  const shouldSaveZpts = deriveBooleanFlag(
    explicitShouldSaveZpts,
    [user?.should_save_zpts, user?.shouldSaveZpts],
    shopUnlocked && zptsBalance < 500
  );

  return {
    canSpendZpts,
    shouldSaveZpts,
  };
}

function deriveZwapCopy({
  explicitZwapMode,
  explicitZwapMessage,
  explicitZwapHint,
  isSwapUnlocked,
  gardenUnlocked,
  streakDays,
  fullLoopCompleted,
  zptsBalance,
}) {
  if (explicitZwapMode || explicitZwapMessage || explicitZwapHint) {
    return {
      zwapMode: explicitZwapMode || "active",
      zwapMessage: explicitZwapMessage || "",
      zwapHint: explicitZwapHint || "",
    };
  }

  if (isSwapUnlocked) {
    return {
      zwapMode: "active",
      zwapMessage: "Swap access is ready when you are.",
      zwapHint: "",
    };
  }

  if (gardenUnlocked && streakDays >= 3) {
    return {
      zwapMode: "active",
      zwapMessage: "Your effort is starting to take shape.",
      zwapHint: "",
    };
  }

  if (fullLoopCompleted) {
    return {
      zwapMode: "active",
      zwapMessage: "You completed the loop.",
      zwapHint: "Keep that rhythm.",
    };
  }

  if (zptsBalance > 0) {
    return {
      zwapMode: "active",
      zwapMessage: "You just moved the system forward.",
      zwapHint: "",
    };
  }

  return {
    zwapMode: "idle",
    zwapMessage: "Earn, learn, and unlock swapping.",
    zwapHint: "",
  };
}

export default function useV1DashboardState({
  user,
  authUser,

  todaySteps,
  stepGoal = 10000,
  isMoveActive = false,

  gamesPlayedToday,
  playGoal = 1,
  isPlayActive = false,

  zptsBalance,
  zptsDailyCap = 300,
  lifetimeZpts,

  shopUnlocked: explicitShopUnlocked,
  gardenUnlocked: explicitGardenUnlocked,
  rarePlantUnlocked: explicitRarePlantUnlocked,

  isZwapAltView: explicitIsZwapAltView,
  isSwapUnlocked: explicitIsSwapUnlocked,

  streakDays,
  lessonsCompletedToday,
  lastActiveAt,
  fullLoopCompleted,

  healthPercent: explicitHealthPercent,
  growthStage: explicitGrowthStage,
  plantName,

  longestStreak,
  totalBlooms,
  activeDays,
  missedDays,
  daysUntilNextBloom: explicitDaysUntilNextBloom,
  nextRareUnlock: explicitNextRareUnlock,
  streakGraceDaysRemaining,

  completedTaskCount: explicitCompletedTaskCount,
  totalTaskCount: explicitTotalTaskCount,

  badgeVisibilityUnlocked: explicitBadgeVisibilityUnlocked,
  learnUnlocked: explicitLearnUnlocked,
  streamUnlocked: explicitStreamUnlocked,
  assistUnlocked: explicitAssistUnlocked,

  profileNeedsSetup: explicitProfileNeedsSetup,
  hasNewHighScore: explicitHasNewHighScore,
  canSpendZpts: explicitCanSpendZpts,
  shouldSaveZpts: explicitShouldSaveZpts,

  zwapMode: explicitZwapMode,
  zwapMessage: explicitZwapMessage,
  zwapHint: explicitZwapHint,
} = {}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [isZwapAltViewState, setIsZwapAltViewState] = useState(false);

  const openAccount = () => setAccountOpen(true);
  const closeAccount = () => setAccountOpen(false);

  const normalizedSteps = useMemo(() => {
    return toNumber(
      todaySteps ??
        user?.today_steps ??
        user?.daily_steps ??
        user?.steps_today,
      0
    );
  }, [todaySteps, user]);

  const normalizedStepGoal = useMemo(() => {
    return Math.max(
      1,
      toNumber(
        stepGoal ??
          user?.step_goal ??
          user?.daily_step_goal,
        10000
      )
    );
  }, [stepGoal, user]);

  const normalizedGamesPlayedToday = useMemo(() => {
    return toNumber(
      gamesPlayedToday ??
        user?.games_played_today ??
        user?.gamesPlayedToday,
      0
    );
  }, [gamesPlayedToday, user]);

  const normalizedPlayGoal = useMemo(() => {
    return Math.max(
      1,
      toNumber(
        playGoal ??
          user?.play_goal ??
          user?.daily_play_goal,
        1
      )
    );
  }, [playGoal, user]);

  const normalizedZptsBalance = useMemo(() => {
    return toNumber(
      zptsBalance ??
        user?.zpts_balance ??
        user?.zPtsBalance ??
        user?.zpts,
      0
    );
  }, [zptsBalance, user]);

  const normalizedLifetimeZpts = useMemo(() => {
    return toNumber(
      lifetimeZpts ??
        user?.lifetime_zpts ??
        user?.lifetimeZpts ??
        user?.total_zpts_earned,
      normalizedZptsBalance
    );
  }, [lifetimeZpts, user, normalizedZptsBalance]);

  const normalizedZptsDailyCap = useMemo(() => {
    return Math.max(
      1,
      toNumber(
        zptsDailyCap ??
          user?.daily_zpts_cap ??
          user?.zpts_daily_cap,
        300
      )
    );
  }, [zptsDailyCap, user]);

  const normalizedStreakDays = useMemo(() => {
    return toNumber(
      streakDays ??
        user?.streak_days ??
        user?.daily_streak,
      0
    );
  }, [streakDays, user]);

  const normalizedLessonsCompletedToday = useMemo(() => {
    return toNumber(
      lessonsCompletedToday ??
        user?.lessons_completed_today ??
        user?.lessonsCompletedToday,
      0
    );
  }, [lessonsCompletedToday, user]);

  const normalizedLastActiveAt = useMemo(() => {
    return (
      lastActiveAt ??
      user?.last_active_at ??
      user?.lastActiveAt ??
      null
    );
  }, [lastActiveAt, user]);

  const normalizedFullLoopCompleted = useMemo(() => {
    return Boolean(
      fullLoopCompleted ??
        user?.full_loop_completed ??
        user?.fullLoopCompleted
    );
  }, [fullLoopCompleted, user]);

  const normalizedActiveDays = useMemo(() => {
    return toNumber(
      activeDays ??
        user?.active_days ??
        user?.activeDays,
      normalizedStreakDays
    );
  }, [activeDays, user, normalizedStreakDays]);

  const normalizedMissedDays = useMemo(() => {
    return toNumber(
      missedDays ??
        user?.missed_days ??
        user?.missedDays,
      0
    );
  }, [missedDays, user]);

  const normalizedLongestStreak = useMemo(() => {
    return toNumber(
      longestStreak ??
        user?.longest_streak ??
        user?.longestStreak,
      normalizedStreakDays
    );
  }, [longestStreak, user, normalizedStreakDays]);

  const normalizedTotalBlooms = useMemo(() => {
    return toNumber(
      totalBlooms ??
        user?.total_blooms ??
        user?.totalBlooms,
      0
    );
  }, [totalBlooms, user]);

  const normalizedStreakGraceDaysRemaining = useMemo(() => {
    return Math.max(
      0,
      toNumber(
        streakGraceDaysRemaining ??
          user?.streak_grace_days_remaining ??
          user?.streakGraceDaysRemaining,
        Math.max(0, 3 - normalizedMissedDays)
      )
    );
  }, [streakGraceDaysRemaining, user, normalizedMissedDays]);

  const normalizedPlantName = useMemo(() => {
    return (
      plantName ??
      user?.plant_name ??
      user?.plantName ??
      "Garden"
    );
  }, [plantName, user]);

  const shopUnlocked = useMemo(() => {
    return deriveShopUnlocked({
      explicitShopUnlocked,
      user,
      lifetimeZpts: normalizedLifetimeZpts,
    });
  }, [explicitShopUnlocked, user, normalizedLifetimeZpts]);

  const gardenUnlocked = useMemo(() => {
    return deriveGardenUnlocked({
      explicitGardenUnlocked,
      user,
      streakDays: normalizedStreakDays,
      fullLoopCompleted: normalizedFullLoopCompleted,
    });
  }, [
    explicitGardenUnlocked,
    user,
    normalizedStreakDays,
    normalizedFullLoopCompleted,
  ]);

  const rarePlantUnlocked = useMemo(() => {
    return deriveRarePlantUnlocked({
      explicitRarePlantUnlocked,
      user,
      streakDays: normalizedStreakDays,
    });
  }, [explicitRarePlantUnlocked, user, normalizedStreakDays]);

  const resolvedGrowthStage = useMemo(() => {
    return deriveGrowthStage({
      explicitGrowthStage,
      user,
      streakDays: normalizedStreakDays,
      activeDays: normalizedActiveDays,
      fullLoopCompleted: normalizedFullLoopCompleted,
      rarePlantUnlocked,
    });
  }, [
    explicitGrowthStage,
    user,
    normalizedStreakDays,
    normalizedActiveDays,
    normalizedFullLoopCompleted,
    rarePlantUnlocked,
  ]);

  const resolvedHealthPercent = useMemo(() => {
    return deriveHealthPercent({
      explicitHealthPercent,
      user,
      missedDays: normalizedMissedDays,
      fullLoopCompleted: normalizedFullLoopCompleted,
      streakDays: normalizedStreakDays,
      dailySteps: normalizedSteps,
      gamesPlayedToday: normalizedGamesPlayedToday,
      lessonsCompletedToday: normalizedLessonsCompletedToday,
    });
  }, [
    explicitHealthPercent,
    user,
    normalizedMissedDays,
    normalizedFullLoopCompleted,
    normalizedStreakDays,
    normalizedSteps,
    normalizedGamesPlayedToday,
    normalizedLessonsCompletedToday,
  ]);

  const resolvedDaysUntilNextBloom = useMemo(() => {
    return deriveDaysUntilNextBloom({
      explicitDaysUntilNextBloom,
      user,
      growthStage: resolvedGrowthStage,
      streakDays: normalizedStreakDays,
    });
  }, [
    explicitDaysUntilNextBloom,
    user,
    resolvedGrowthStage,
    normalizedStreakDays,
  ]);

  const resolvedNextRareUnlock = useMemo(() => {
    return deriveNextRareUnlock({
      explicitNextRareUnlock,
      user,
      streakDays: normalizedStreakDays,
      rarePlantUnlocked,
    });
  }, [
    explicitNextRareUnlock,
    user,
    normalizedStreakDays,
    rarePlantUnlocked,
  ]);

  const resolvedCompletedTaskCount = useMemo(() => {
    return deriveCompletedTaskCount({
      explicitCompletedTaskCount,
      user,
      gamesPlayedToday: normalizedGamesPlayedToday,
      dailySteps: normalizedSteps,
      fullLoopCompleted: normalizedFullLoopCompleted,
    });
  }, [
    explicitCompletedTaskCount,
    user,
    normalizedGamesPlayedToday,
    normalizedSteps,
    normalizedFullLoopCompleted,
  ]);

  const resolvedTotalTaskCount = useMemo(() => {
    return deriveTotalTaskCount({
      explicitTotalTaskCount,
      user,
    });
  }, [explicitTotalTaskCount, user]);

  const badgeVisibilityUnlocked = useMemo(() => {
    return deriveBooleanFlag(
      explicitBadgeVisibilityUnlocked,
      [user?.badge_visibility_unlocked, user?.badgeVisibilityUnlocked],
      normalizedStreakDays >= 7 || normalizedTotalBlooms > 0
    );
  }, [explicitBadgeVisibilityUnlocked, user, normalizedStreakDays, normalizedTotalBlooms]);

  const learnUnlocked = useMemo(() => {
    return deriveBooleanFlag(
      explicitLearnUnlocked,
      [user?.learn_unlocked, user?.learnUnlocked],
      false
    );
  }, [explicitLearnUnlocked, user]);

  const streamUnlocked = useMemo(() => {
    return deriveBooleanFlag(
      explicitStreamUnlocked,
      [user?.stream_unlocked, user?.streamUnlocked],
      false
    );
  }, [explicitStreamUnlocked, user]);

  const assistUnlocked = useMemo(() => {
    return deriveBooleanFlag(
      explicitAssistUnlocked,
      [user?.assist_unlocked, user?.assistUnlocked],
      false
    );
  }, [explicitAssistUnlocked, user]);

  const profileNeedsSetup = useMemo(() => {
    return deriveBooleanFlag(
      explicitProfileNeedsSetup,
      [user?.profile_needs_setup, user?.profileNeedsSetup],
      !Boolean(user?.username || user?.display_name || user?.displayName)
    );
  }, [explicitProfileNeedsSetup, user]);

  const hasNewHighScore = useMemo(() => {
    return deriveBooleanFlag(
      explicitHasNewHighScore,
      [user?.has_new_high_score, user?.hasNewHighScore],
      false
    );
  }, [explicitHasNewHighScore, user]);

  const spendState = useMemo(() => {
    return deriveSpendState({
      explicitCanSpendZpts,
      explicitShouldSaveZpts,
      user,
      zptsBalance: normalizedZptsBalance,
      shopUnlocked,
    });
  }, [
    explicitCanSpendZpts,
    explicitShouldSaveZpts,
    user,
    normalizedZptsBalance,
    shopUnlocked,
  ]);

  const stepsPercent = useMemo(() => {
    return percent(normalizedSteps, normalizedStepGoal);
  }, [normalizedSteps, normalizedStepGoal]);

  const playPercent = useMemo(() => {
    return percent(normalizedGamesPlayedToday, normalizedPlayGoal);
  }, [normalizedGamesPlayedToday, normalizedPlayGoal]);

  const zptsPercent = useMemo(() => {
    return percent(normalizedZptsBalance, normalizedZptsDailyCap);
  }, [normalizedZptsBalance, normalizedZptsDailyCap]);

  const resolvedIsSwapUnlocked = useMemo(() => {
    if (typeof explicitIsSwapUnlocked === "boolean") return explicitIsSwapUnlocked;
    if (typeof user?.swap_unlocked === "boolean") return user.swap_unlocked;
    if (typeof user?.isSwapUnlocked === "boolean") return user.isSwapUnlocked;

    return false;
  }, [explicitIsSwapUnlocked, user]);

  const resolvedIsZwapAltView = useMemo(() => {
    if (typeof explicitIsZwapAltView === "boolean") {
      return explicitIsZwapAltView;
    }

    return isZwapAltViewState;
  }, [explicitIsZwapAltView, isZwapAltViewState]);

  const zwapCopy = useMemo(() => {
    return deriveZwapCopy({
      explicitZwapMode,
      explicitZwapMessage,
      explicitZwapHint,
      isSwapUnlocked: resolvedIsSwapUnlocked,
      gardenUnlocked,
      streakDays: normalizedStreakDays,
      fullLoopCompleted: normalizedFullLoopCompleted,
      zptsBalance: normalizedZptsBalance,
    });
  }, [
    explicitZwapMode,
    explicitZwapMessage,
    explicitZwapHint,
    resolvedIsSwapUnlocked,
    gardenUnlocked,
    normalizedStreakDays,
    normalizedFullLoopCompleted,
    normalizedZptsBalance,
  ]);

  return {
    accountOpen,
    setAccountOpen,
    openAccount,
    closeAccount,

    isMoveActive: Boolean(isMoveActive),
    isPlayActive: Boolean(isPlayActive),

    steps: normalizedSteps,
    dailySteps: normalizedSteps,
    stepGoal: normalizedStepGoal,
    stepsPercent,

    gamesPlayedToday: normalizedGamesPlayedToday,
    playGoal: normalizedPlayGoal,
    playPercent,

    zptsBalance: normalizedZptsBalance,
    zptsDisplay: formatZpts(normalizedZptsBalance),
    zptsPercent,
    zptsDailyCap: normalizedZptsDailyCap,

    completedTaskCount: resolvedCompletedTaskCount,
    totalTaskCount: resolvedTotalTaskCount,

    shopUnlocked,
    gardenUnlocked,
    rarePlantUnlocked,
    isSwapUnlocked: resolvedIsSwapUnlocked,

    badgeVisibilityUnlocked,
    learnUnlocked,
    streamUnlocked,
    assistUnlocked,

    profileNeedsSetup,
    hasNewHighScore,
    canSpendZpts: spendState.canSpendZpts,
    shouldSaveZpts: spendState.shouldSaveZpts,

    isZwapAltView: resolvedIsZwapAltView,
    setIsZwapAltView: setIsZwapAltViewState,

    streakDays: normalizedStreakDays,
    lessonsCompletedToday: normalizedLessonsCompletedToday,
    lastActiveAt: normalizedLastActiveAt,
    fullLoopCompleted: normalizedFullLoopCompleted,

    healthPercent: resolvedHealthPercent,
    growthStage: resolvedGrowthStage,
    plantName: normalizedPlantName,

    longestStreak: normalizedLongestStreak,
    totalBlooms: normalizedTotalBlooms,
    activeDays: normalizedActiveDays,
    missedDays: normalizedMissedDays,
    daysUntilNextBloom: resolvedDaysUntilNextBloom,
    nextRareUnlock: resolvedNextRareUnlock,
    streakGraceDaysRemaining: normalizedStreakGraceDaysRemaining,

    zwapMode: zwapCopy.zwapMode,
    zwapMessage: zwapCopy.zwapMessage,
    zwapHint: zwapCopy.zwapHint,

    user,
    authUser,
  };
}