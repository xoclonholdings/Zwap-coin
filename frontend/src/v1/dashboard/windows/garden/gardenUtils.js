export function clamp(value, min = 0, max = 100) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, num));
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

export function normalizeStage(stage, rarePlantUnlocked) {
  if (rarePlantUnlocked) return "rare";

  const safe = String(stage || "").toLowerCase();

  if (["seed", "sprout", "young", "mature", "rare"].includes(safe)) {
    return safe;
  }

  return "seed";
}

export function getHealthState(healthPercent = 0, missedDays = 0) {
  const health = clamp(healthPercent);

  if (health < 15 || missedDays >= 3) {
    return {
      key: "wilted",
      label: "Wilting",
      message: "Your garden needs attention.",
      accent: "#ff7aa8",
      glow: "rgba(255, 111, 145, 0.28)",
    };
  }

  if (health < 40 || missedDays >= 2) {
    return {
      key: "weak",
      label: "Weak",
      message: "A little movement would help.",
      accent: "#ffbc7a",
      glow: "rgba(255, 188, 122, 0.24)",
    };
  }

  if (health <= 75 || missedDays >= 1) {
    return {
      key: "stable",
      label: "Stable",
      message: "Growing steadily.",
      accent: "#a6ff6f",
      glow: "rgba(166, 255, 111, 0.2)",
    };
  }

  return {
    key: "healthy",
    label: "Healthy",
    message: "Your Garden is thriving!",
    accent: "#7cff5b",
    glow: "rgba(124, 255, 91, 0.28)",
  };
}

export function deriveHealth({
  healthPercent,
  streakDays,
  dailySteps,
  gamesPlayedToday,
  lessonsCompletedToday,
  fullLoopCompleted,
  missedDays,
}) {
  if (Number.isFinite(Number(healthPercent))) return clamp(healthPercent);

  let health = 50;

  if (Number(dailySteps || 0) >= 2000) health += 10;
  if (Number(dailySteps || 0) >= 5000) health += 10;
  if (Number(gamesPlayedToday || 0) > 0) health += 8;
  if (Number(lessonsCompletedToday || 0) > 0) health += 8;
  if (fullLoopCompleted) health += 15;
  if (Number(streakDays || 0) >= 3) health += 5;
  if (Number(streakDays || 0) >= 7) health += 5;

  health -= Number(missedDays || 0) * 10;

  return clamp(health);
}

export function deriveGrowthStage({
  growthStage,
  rarePlantUnlocked,
  streakDays,
  dailySteps,
  gamesPlayedToday,
  lessonsCompletedToday,
}) {
  const explicitStage = String(growthStage || "").toLowerCase();

  if (rarePlantUnlocked || explicitStage === "rare") return "rare";
  if (["seed", "sprout", "young", "mature"].includes(explicitStage)) {
    return explicitStage;
  }

  const streak = Number(streakDays || 0);
  const steps = Number(dailySteps || 0);
  const games = Number(gamesPlayedToday || 0);
  const lessons = Number(lessonsCompletedToday || 0);

  const activityScore =
    Math.min(steps / 1000, 8) + games * 1.5 + lessons * 2 + streak;

  if (streak >= 14 && activityScore >= 18) return "mature";
  if (streak >= 7 && activityScore >= 10) return "young";
  if (streak >= 3 || activityScore >= 4) return "sprout";

  return "seed";
}

export function getStageLabel(stage) {
  const labels = {
    seed: "Seed",
    sprout: "Sprout",
    young: "Young Plant",
    mature: "Blooming",
    rare: "Rare Growth",
  };

  return labels[stage] || "Seed";
}

export function getGardenMessage({ healthState, stage, rarePlantUnlocked, streakDays }) {
  if (rarePlantUnlocked || stage === "rare") {
    return {
      title: "Rare growth unlocked!",
      body: "Your consistency is turning into prestige.",
    };
  }

  if (healthState.key === "wilted") {
    return {
      title: "Your Garden needs attention.",
      body: "A small action today can help it recover.",
    };
  }

  if (healthState.key === "weak") {
    return {
      title: "Your Garden is fading.",
      body: "Move, play, or complete a task to restore it.",
    };
  }

  if (Number(streakDays || 0) >= 3) {
    return {
      title: "Your Garden is thriving!",
      body: "Nice streak. Keep it going to earn bonus rewards.",
    };
  }

  return {
    title: healthState.message,
    body: "Complete your daily tasks to keep your Garden healthy.",
  };
}