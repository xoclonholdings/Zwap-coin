export const GARDEN_VIEWS = {
  PLANT: "plant",
  STATS: "stats",
};

export const GARDEN_GROWTH_STAGES = {
  SEED: "seed",
  SPROUT: "sprout",
  YOUNG: "young",
  MATURE: "mature",
  RARE: "rare",
};

export const GARDEN_HEALTH_BANDS = {
  HEALTHY: "healthy",
  STABLE: "stable",
  FADING: "fading",
  WEAK: "weak",
  WILTED: "wilted",
};

export const GARDEN_THRESHOLDS = {
  HEALTH: {
    MIN: 0,
    MAX: 100,
    HEALTHY: 75,
    STABLE: 40,
    CRITICAL: 15,
  },
  MISSED_DAYS: {
    FADING: 1,
    WEAK: 2,
    WILTED: 3,
  },
  STREAKS: {
    UNLOCK: 3,
    RARE_30: 30,
    RARE_60: 60,
    RARE_90: 90,
  },
  ACTIVITY: {
    STRONG_MOVEMENT_STEPS: 5000,
    COMBINED_DAY_STEPS: 3000,
  },
};

export const GARDEN_STAGE_RULES = {
  SPROUT: {
    streakDays: 3,
    activeDays: 3,
  },
  YOUNG: {
    streakDays: 7,
    activeDays: 6,
  },
  MATURE: {
    streakDays: 14,
    activeDays: 10,
    fullLoopRequired: true,
  },
};

export const GARDEN_RARE_UNLOCKS = [30, 60, 90];

export const GARDEN_DEFAULTS = {
  plantName: "Garden",
  growthStage: GARDEN_GROWTH_STAGES.SEED,
  healthPercent: 100,
  streakDays: 0,
  dailySteps: 0,
  gamesPlayedToday: 0,
  lessonsCompletedToday: 0,
  longestStreak: 0,
  totalBlooms: 0,
  activeDays: 0,
  missedDays: 0,
  daysUntilNextBloom: 0,
  nextRareUnlock: 30,
  streakGraceDaysRemaining: 3,
  rarePlantUnlocked: false,
  fullLoopCompleted: false,
  lastActiveAt: null,
};

export const FUTURE_GARDEN_ITEMS = {
  waterToken: null,
  fertilizerPack: null,
  gardenRecoveryToken: null,
  rareSeedCapsule: null,
  potVariants: null,
  seasonalThemes: null,
  nightGarden: null,
  neonGarden: null,
};