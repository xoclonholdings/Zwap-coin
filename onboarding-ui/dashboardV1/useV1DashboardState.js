import { useMemo, useState } from "react";

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clampRatio(value) {
  return Math.min(Math.max(value, 0), 1);
}

function clampPercent(value) {
  return Math.min(Math.max(toNumber(value, 0), 0), 100);
}

function percent(part, whole) {
  const safeWhole = Math.max(1, toNumber(whole, 1));
  return clampRatio(toNumber(part, 0) / safeWhole) * 100;
}

function formatZpts(value) {
  return toNumber(value, 0).toLocaleString();
}

function firstBoolean(...values) {
  for (const value of values) {
    if (typeof value === "boolean") return value;
  }
  return undefined;
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function deriveUnlocks({
  user,
  lifetimeZpts,
  streakDays,
  fullLoopCompleted,
  explicitShopUnlocked,
  explicitGardenUnlocked,
  explicitRarePlantUnlocked,
  explicitBadgeVisibilityUnlocked,
  explicitLearnUnlocked,
  explicitStreamUnlocked,
  explicitAssistUnlocked,
  explicitIsSwapUnlocked,
}) {
  const shopUnlocked =
    firstBoolean(
      explicitShopUnlocked,
      user?.shop_unlocked,
      user?.shopUnlocked
    ) ?? lifetimeZpts >= 1000;

  const gardenUnlocked =
    firstBoolean(
      explicitGardenUnlocked,
      user?.garden_unlocked,
      user?.gardenUnlocked
    ) ?? (streakDays >= 3 || fullLoopCompleted);

  const rarePlantUnlocked =
    firstBoolean(
      explicitRarePlantUnlocked,
      user?.rare_plant_unlocked,
      user?.rarePlantUnlocked
    ) ?? streakDays >= 30;

  const badgeVisibilityUnlocked =
    firstBoolean(
      explicitBadgeVisibilityUnlocked,
      user?.badge_visibility_unlocked,
      user?.badgeVisibilityUnlocked
    ) ?? streakDays >= 7;

  const learnUnlocked =
    firstBoolean(
      explicitLearnUnlocked,
      user?.learn_unlocked,
      user?.learnUnlocked
    ) ?? false;

  const streamUnlocked =
    firstBoolean(
      explicitStreamUnlocked,
      user?.stream_unlocked,
      user?.streamUnlocked
    ) ?? false;

  const assistUnlocked =
    firstBoolean(
      explicitAssistUnlocked,
      user?.assist_unlocked,
      user?.assistUnlocked
    ) ?? false;

  const isSwapUnlocked =
    firstBoolean(
      explicitIsSwapUnlocked,
      user?.swap_unlocked,
      user?.isSwapUnlocked
    ) ?? false;

  return {
    shopUnlocked,
    gardenUnlocked,
    rarePlantUnlocked,
    badgeVisibilityUnlocked,
    learnUnlocked,
    streamUnlocked,
    assistUnlocked,
    isSwapUnlocked,
  };
}

function deriveGardenState({
  user,
  explicitGrowthStage,
  explicitHealthPercent,
  explicitDaysUntilNextBloom,
  explicitNextRareUnlock,
  streakDays,
  activeDays,
  fullLoopCompleted,
  rarePlantUnlocked,
  missedDays,
  dailySteps,
  gamesPlayedToday,
  lessonsCompletedToday,
}) {
  const growthStageInput = firstDefined(
    explicitGrowthStage,
    user?.growth_stage,
    user?.growthStage
  );

  const growthStage = (() => {
    if (rarePlantUnlocked || streakDays >= 30) return "rare";
    if (growthStageInput && growthStageInput !== "seed") return growthStageInput;
    if (streakDays >= 14 || (fullLoopCompleted && activeDays >= 10)) return "mature";
    if (streakDays >= 7 || activeDays >= 6) return "young";
    if (streakDays >= 3 || activeDays >= 3) return "sprout";
    return "seed";
  })();

  const incomingHealth = toNumber(
    firstDefined(
      explicitHealthPercent,
      user?.health_percent,
      user?.healthPercent
    ),
    NaN
  );

  const healthPercent = (() => {
    if (Number.isFinite(incomingHealth)) {
      return clampPercent(incomingHealth);
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

    return clampPercent(health);
  })();

  const daysUntilNextBloom = (() => {
    const incoming = toNumber(
      firstDefined(
        explicitDaysUntilNextBloom,
        user?.days_until_next_bloom,
        user?.daysUntilNextBloom
      ),
      NaN
    );

    if (Number.isFinite(incoming)) return Math.max(0, incoming);
    if (growthStage === "seed") return Math.max(0, 3 - streakDays);
    if (growthStage === "sprout") return Math.max(0, 7 - streakDays);
    if (growthStage === "young") return Math.max(0, 14 - streakDays);
    return 0;
  })();

  const nextRareUnlock = (() => {
    const incoming = firstDefined(
      explicitNextRareUnlock,
      user?.next_rare_unlock,
      user?.nextRareUnlock
    );

    if (incoming != null) return incoming;
    if (rarePlantUnlocked && streakDays >= 90) return "Rare growth unlocked";
    if (streakDays < 30) return 30;
    if (streakDays < 60) return 60;
    if (streakDays < 90) return 90;
    return "Rare growth unlocked";
  })();

  return {
    growthStage,
    healthPercent,
    daysUntilNextBloom,
    nextRareUnlock,
  };
}

function deriveTaskState({
  user,
  explicitCompletedTaskCount,
  explicitTotalTaskCount,
  dailySteps,
  gamesPlayedToday,
  fullLoopCompleted,
  learnUnlocked,
}) {
  const totalTaskCount = Math.max(
    1,
    toNumber(
      firstDefined(
        explicitTotalTaskCount,
        user?.total_task_count,
        user?.totalTaskCount,
        user?.daily_tasks_total
      ),
      4
    )
  );

  const completedTaskCount = (() => {
    const explicit = firstDefined(
      explicitCompletedTaskCount,
      user?.completed_task_count,
      user?.completedTaskCount,
      user?.daily_tasks_completed
    );

    if (explicit != null) {
      return Math.max(0, Math.min(toNumber(explicit, 0), totalTaskCount));
    }

    let count = 1;
    if (dailySteps > 0) count += 1;
    if (gamesPlayedToday > 0) count += 1;
    if (learnUnlocked) {
      if (fullLoopCompleted) count = Math.max(count, 4);
    } else {
      if (fullLoopCompleted) count = Math.max(count, 4);
    }

    return Math.max(0, Math.min(count, totalTaskCount));
  })();

  return {
    completedTaskCount,
    totalTaskCount,
  };
}

function deriveNudges({
  user,
  explicitProfileNeedsSetup,
  explicitHasNewHighScore,
  explicitCanSpendZpts,
  explicitShouldSaveZpts,
  shopUnlocked,
  zptsBalance,
}) {
  const profileNeedsSetup =
    firstBoolean(
      explicitProfileNeedsSetup,
      user?.profile_needs_setup,
      user?.profileNeedsSetup
    ) ?? !Boolean(user?.username || user?.display_name || user?.displayName);

  const hasNewHighScore =
    firstBoolean(
      explicitHasNewHighScore,
      user?.has_new_high_score,
      user?.hasNewHighScore
    ) ?? false;

  const canSpendZpts =
    firstBoolean(
      explicitCanSpendZpts,
      user?.can_spend_zpts,
      user?.canSpendZpts
    ) ?? (shopUnlocked && zptsBalance >= 100);

  const shouldSaveZpts =
    firstBoolean(
      explicitShouldSaveZpts,
      user?.should_save_zpts,
      user?.shouldSaveZpts
    ) ?? (shopUnlocked && zptsBalance < 500);

  return {
    profileNeedsSetup,
    hasNewHighScore,
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

  const normalizedSteps = useMemo(
    () =>
      toNumber(
        firstDefined(
          todaySteps,
          user?.today_steps,
          user?.daily_steps,
          user?.steps_today
        ),
        0
      ),
    [todaySteps, user]
  );

  const normalizedStepGoal = useMemo(
    () =>
      Math.max(
        1,
        toNumber(
          firstDefined(
            stepGoal,
            user?.step_goal,
            user?.daily_step_goal
          ),
          10000
        )
      ),
    [stepGoal, user]
  );

  const normalizedGamesPlayedToday = useMemo(
    () =>
      toNumber(
        firstDefined(
          gamesPlayedToday,
          user?.games_played_today,
          user?.gamesPlayedToday
        ),
        0
      ),
    [gamesPlayedToday, user]
  );

  const normalizedPlayGoal = useMemo(
    () =>
      Math.max(
        1,
        toNumber(
          firstDefined(
            playGoal,
            user?.play_goal,
            user?.daily_play_goal
          ),
          1
        )
      ),
    [playGoal, user]
  );

  const normalizedZptsBalance = useMemo(
    () =>
      toNumber(
        firstDefined(
          zptsBalance,
          user?.zpts_balance,
          user?.zPtsBalance,
          user?.zpts
        ),
        0
      ),
    [zptsBalance, user]
  );

  const normalizedLifetimeZpts = useMemo(
    () =>
      toNumber(
        firstDefined(
          lifetimeZpts,
          user?.lifetime_zpts,
          user?.lifetimeZpts,
          user?.total_zpts_earned
        ),
        normalizedZptsBalance
      ),
    [lifetimeZpts, user, normalizedZptsBalance]
  );

  const normalizedZptsDailyCap = useMemo(
    () =>
      Math.max(
        1,
        toNumber(
          firstDefined(
            zptsDailyCap,
            user?.daily_zpts_cap,
            user?.zpts_daily_cap
          ),
          300
        )
      ),
    [zptsDailyCap, user]
  );

  const normalizedStreakDays = useMemo(
    () =>
      toNumber(
        firstDefined(
          streakDays,
          user?.streak_days,
          user?.daily_streak
        ),
        0
      ),
    [streakDays, user]
  );

  const normalizedLessonsCompletedToday = useMemo(
    () =>
      toNumber(
        firstDefined(
          lessonsCompletedToday,
          user?.lessons_completed_today,
          user?.lessonsCompletedToday
        ),
        0
      ),
    [lessonsCompletedToday, user]
  );

  const normalizedLastActiveAt = useMemo(
    () =>
      firstDefined(
        lastActiveAt,
        user?.last_active_at,
        user?.lastActiveAt,
        null
      ),
    [lastActiveAt, user]
  );

  const normalizedFullLoopCompleted = useMemo(
    () =>
      Boolean(
        firstDefined(
          fullLoopCompleted,
          user?.full_loop_completed,
          user?.fullLoopCompleted,
          false
        )
      ),
    [fullLoopCompleted, user]
  );

  const normalizedActiveDays = useMemo(
    () =>
      toNumber(
        firstDefined(
          activeDays,
          user?.active_days,
          user?.activeDays
        ),
        normalizedStreakDays
      ),
    [activeDays, user, normalizedStreakDays]
  );

  const normalizedMissedDays = useMemo(
    () =>
      toNumber(
        firstDefined(
          missedDays,
          user?.missed_days,
          user?.missedDays
        ),
        0
      ),
    [missedDays, user]
  );

  const normalizedLongestStreak = useMemo(
    () =>
      toNumber(
        firstDefined(
          longestStreak,
          user?.longest_streak,
          user?.longestStreak
        ),
        normalizedStreakDays
      ),
    [longestStreak, user, normalizedStreakDays]
  );

  const normalizedTotalBlooms = useMemo(
    () =>
      toNumber(
        firstDefined(
          totalBlooms,
          user?.total_blooms,
          user?.totalBlooms
        ),
        0
      ),
    [totalBlooms, user]
  );

  const normalizedStreakGraceDaysRemaining = useMemo(
    () =>
      Math.max(
        0,
        toNumber(
          firstDefined(
            streakGraceDaysRemaining,
            user?.streak_grace_days_remaining,
            user?.streakGraceDaysRemaining
          ),
          Math.max(0, 3 - normalizedMissedDays)
        )
      ),
    [streakGraceDaysRemaining, user, normalizedMissedDays]
  );

  const normalizedPlantName = useMemo(
    () =>
      firstDefined(
        plantName,
        user?.plant_name,
        user?.plantName,
        "Garden"
      ),
    [plantName, user]
  );

  const unlocks = useMemo(
    () =>
      deriveUnlocks({
        user,
        lifetimeZpts: normalizedLifetimeZpts,
        streakDays: normalizedStreakDays,
        fullLoopCompleted: normalizedFullLoopCompleted,
        explicitShopUnlocked,
        explicitGardenUnlocked,
        explicitRarePlantUnlocked,
        explicitBadgeVisibilityUnlocked,
        explicitLearnUnlocked,
        explicitStreamUnlocked,
        explicitAssistUnlocked,
        explicitIsSwapUnlocked,
      }),
    [
      user,
      normalizedLifetimeZpts,
      normalizedStreakDays,
      normalizedFullLoopCompleted,
      explicitShopUnlocked,
      explicitGardenUnlocked,
      explicitRarePlantUnlocked,
      explicitBadgeVisibilityUnlocked,
      explicitLearnUnlocked,
      explicitStreamUnlocked,
      explicitAssistUnlocked,
      explicitIsSwapUnlocked,
    ]
  );

  const gardenState = useMemo(
    () =>
      deriveGardenState({
        user,
        explicitGrowthStage,
        explicitHealthPercent,
        explicitDaysUntilNextBloom,
        explicitNextRareUnlock,
        streakDays: normalizedStreakDays,
        activeDays: normalizedActiveDays,
        fullLoopCompleted: normalizedFullLoopCompleted,
        rarePlantUnlocked: unlocks.rarePlantUnlocked,
        missedDays: normalizedMissedDays,
        dailySteps: normalizedSteps,
        gamesPlayedToday: normalizedGamesPlayedToday,
        lessonsCompletedToday: normalizedLessonsCompletedToday,
      }),
    [
      user,
      explicitGrowthStage,
      explicitHealthPercent,
      explicitDaysUntilNextBloom,
      explicitNextRareUnlock,
      normalizedStreakDays,
      normalizedActiveDays,
      normalizedFullLoopCompleted,
      unlocks.rarePlantUnlocked,
      normalizedMissedDays,
      normalizedSteps,
      normalizedGamesPlayedToday,
      normalizedLessonsCompletedToday,
    ]
  );

  const taskState = useMemo(
    () =>
      deriveTaskState({
        user,
        explicitCompletedTaskCount,
        explicitTotalTaskCount,
        dailySteps: normalizedSteps,
        gamesPlayedToday: normalizedGamesPlayedToday,
        fullLoopCompleted: normalizedFullLoopCompleted,
        learnUnlocked: unlocks.learnUnlocked,
      }),
    [
      user,
      explicitCompletedTaskCount,
      explicitTotalTaskCount,
      normalizedSteps,
      normalizedGamesPlayedToday,
      normalizedFullLoopCompleted,
      unlocks.learnUnlocked,
    ]
  );

  const nudges = useMemo(
    () =>
      deriveNudges({
        user,
        explicitProfileNeedsSetup,
        explicitHasNewHighScore,
        explicitCanSpendZpts,
        explicitShouldSaveZpts,
        shopUnlocked: unlocks.shopUnlocked,
        zptsBalance: normalizedZptsBalance,
      }),
    [
      user,
      explicitProfileNeedsSetup,
      explicitHasNewHighScore,
      explicitCanSpendZpts,
      explicitShouldSaveZpts,
      unlocks.shopUnlocked,
      normalizedZptsBalance,
    ]
  );

  const stepsPercent = useMemo(
    () => percent(normalizedSteps, normalizedStepGoal),
    [normalizedSteps, normalizedStepGoal]
  );

  const playPercent = useMemo(
    () => percent(normalizedGamesPlayedToday, normalizedPlayGoal),
    [normalizedGamesPlayedToday, normalizedPlayGoal]
  );

  const zptsPercent = useMemo(
    () => percent(normalizedZptsBalance, normalizedZptsDailyCap),
    [normalizedZptsBalance, normalizedZptsDailyCap]
  );

  const resolvedIsZwapAltView = useMemo(() => {
    if (typeof explicitIsZwapAltView === "boolean") {
      return explicitIsZwapAltView;
    }

    return isZwapAltViewState;
  }, [explicitIsZwapAltView, isZwapAltViewState]);

  const zwapCopy = useMemo(
    () =>
      deriveZwapCopy({
        explicitZwapMode,
        explicitZwapMessage,
        explicitZwapHint,
        isSwapUnlocked: unlocks.isSwapUnlocked,
        gardenUnlocked: unlocks.gardenUnlocked,
        streakDays: normalizedStreakDays,
        fullLoopCompleted: normalizedFullLoopCompleted,
        zptsBalance: normalizedZptsBalance,
      }),
    [
      explicitZwapMode,
      explicitZwapMessage,
      explicitZwapHint,
      unlocks.isSwapUnlocked,
      unlocks.gardenUnlocked,
      normalizedStreakDays,
      normalizedFullLoopCompleted,
      normalizedZptsBalance,
    ]
  );

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

    completedTaskCount: taskState.completedTaskCount,
    totalTaskCount: taskState.totalTaskCount,

    shopUnlocked: unlocks.shopUnlocked,
    gardenUnlocked: unlocks.gardenUnlocked,
    rarePlantUnlocked: unlocks.rarePlantUnlocked,
    isSwapUnlocked: unlocks.isSwapUnlocked,

    badgeVisibilityUnlocked: unlocks.badgeVisibilityUnlocked,
    learnUnlocked: unlocks.learnUnlocked,
    streamUnlocked: unlocks.streamUnlocked,
    assistUnlocked: unlocks.assistUnlocked,

    profileNeedsSetup: nudges.profileNeedsSetup,
    hasNewHighScore: nudges.hasNewHighScore,
    canSpendZpts: nudges.canSpendZpts,
    shouldSaveZpts: nudges.shouldSaveZpts,

    isZwapAltView: resolvedIsZwapAltView,
    setIsZwapAltView: setIsZwapAltViewState,

    streakDays: normalizedStreakDays,
    lessonsCompletedToday: normalizedLessonsCompletedToday,
    lastActiveAt: normalizedLastActiveAt,
    fullLoopCompleted: normalizedFullLoopCompleted,

    healthPercent: gardenState.healthPercent,
    growthStage: gardenState.growthStage,
    plantName: normalizedPlantName,

    longestStreak: normalizedLongestStreak,
    totalBlooms: normalizedTotalBlooms,
    activeDays: normalizedActiveDays,
    missedDays: normalizedMissedDays,
    daysUntilNextBloom: gardenState.daysUntilNextBloom,
    nextRareUnlock: gardenState.nextRareUnlock,
    streakGraceDaysRemaining: normalizedStreakGraceDaysRemaining,

    zwapMode: zwapCopy.zwapMode,
    zwapMessage: zwapCopy.zwapMessage,
    zwapHint: zwapCopy.zwapHint,

    user,
    authUser,
  };
}