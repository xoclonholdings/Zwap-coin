export function clamp(value, min = 0, max = 100) {
  const num = Number(value);

  if (Number.isNaN(num)) return min;

  return Math.max(min, Math.min(max, num));
}

export function getHealthBand(healthPercent = 0, missedDays = 0) {
  const safeHealth = clamp(healthPercent);

  if (missedDays >= 3 || safeHealth < 15) return "wilted";
  if (missedDays === 2 || safeHealth < 40) return "weak";
  if (missedDays === 1) return "fading";
  if (safeHealth > 75) return "healthy";
  return "stable";
}

export function getGraceLabel(streakGraceDaysRemaining = 0) {
  if (streakGraceDaysRemaining <= 0) return "Grace spent";
  if (streakGraceDaysRemaining === 1) return "1 grace day left";
  return `${streakGraceDaysRemaining} grace days left`;
}

export function getGrowthStageLabel(growthStage = "seed", rarePlantUnlocked = false) {
  if (rarePlantUnlocked || growthStage === "rare") return "Rare";

  switch (growthStage) {
    case "seed":
      return "Seed";
    case "sprout":
      return "Sprout";
    case "young":
      return "Young";
    case "mature":
      return "Mature";
    default:
      return "Seed";
  }
}

export function getNextRareLabel(nextRareUnlock, streakDays = 0) {
  if (!nextRareUnlock) {
    if (streakDays < 30) return "30-day streak";
    if (streakDays < 60) return "60-day streak";
    if (streakDays < 90) return "90-day streak";
    return "Rare growth unlocked";
  }

  if (typeof nextRareUnlock === "number") {
    return `${nextRareUnlock}-day streak`;
  }

  return nextRareUnlock;
}

export function getDerivedGrowthStage({
  growthStage = "seed",
  streakDays = 0,
  activeDays = 0,
  fullLoopCompleted = false,
  rarePlantUnlocked = false,
}) {
  if (rarePlantUnlocked || streakDays >= 30) return "rare";
  if (growthStage && growthStage !== "seed") return growthStage;

  if (streakDays >= 14 || (fullLoopCompleted && activeDays >= 10)) return "mature";
  if (streakDays >= 7 || activeDays >= 6) return "young";
  if (streakDays >= 3 || activeDays >= 3) return "sprout";
  return "seed";
}

export function getStatusLine({
  healthBand = "stable",
  daysUntilNextBloom = 0,
  streakDays = 0,
  rarePlantUnlocked = false,
  dailySteps = 0,
  gamesPlayedToday = 0,
  lessonsCompletedToday = 0,
  missedDays = 0,
}) {
  if (rarePlantUnlocked) return "Rare growth unlocked.";
  if (daysUntilNextBloom === 1) return "One more day to bloom.";
  if (daysUntilNextBloom === 2) return "Two more days to bloom.";

  if (healthBand === "healthy" && streakDays >= 7) {
    return "Your streak is keeping this alive.";
  }

  if (
    healthBand === "healthy" &&
    (dailySteps > 0 || gamesPlayedToday > 0 || lessonsCompletedToday > 0)
  ) {
    return "Your plant is thriving.";
  }

  if (healthBand === "stable") return "Growing steadily.";
  if (healthBand === "fading") return "You kept it alive today.";
  if (healthBand === "weak" && missedDays > 0) return "Needs attention.";
  if (healthBand === "weak") return "A little movement would help.";
  return "Your garden misses you.";
}

export function getGardenRecoveryHint({
  missedDays = 0,
  healthPercent = 0,
  streakGraceDaysRemaining = 0,
}) {
  const safeHealth = clamp(healthPercent);

  if (missedDays <= 0 && safeHealth > 75) return "Steady care is working.";
  if (missedDays === 1) return "A small return day will help it recover.";
  if (missedDays === 2) return "A stronger day will help it lift again.";
  if (streakGraceDaysRemaining > 0) return "It can still recover with a return day.";
  return "Recovery will happen gradually.";
}

export function getHealthDeltaHint({
  fullLoopCompleted = false,
  dailySteps = 0,
  gamesPlayedToday = 0,
  lessonsCompletedToday = 0,
  missedDays = 0,
}) {
  const hasStrongMovement = dailySteps >= 5000;
  const hasCombinedDay =
    dailySteps >= 3000 &&
    gamesPlayedToday > 0 &&
    lessonsCompletedToday > 0;

  if (missedDays > 0) return "-10 inactive day";
  if (hasCombinedDay) return "+10 strong combined day";
  if (fullLoopCompleted) return "+15 full daily loop";
  if (hasStrongMovement) return "+5 strong movement day";
  if (gamesPlayedToday > 0 || lessonsCompletedToday > 0 || dailySteps > 0) {
    return "+5 streak maintained";
  }

  return "No change yet";
}

export function getNextMilestone({
  daysUntilNextBloom = 0,
  rarePlantUnlocked = false,
  growthStage = "seed",
}) {
  if (daysUntilNextBloom > 0) {
    return `${daysUntilNextBloom} day${daysUntilNextBloom === 1 ? "" : "s"} until next bloom`;
  }

  if (rarePlantUnlocked) return "Rare growth maintained";
  if (growthStage === "seed") return "Build early consistency";
  if (growthStage === "sprout") return "Keep the plant steady";
  if (growthStage === "young") return "Approach mature bloom";
  if (growthStage === "mature") return "Chase rare growth";
  return "Keep it glowing";
}