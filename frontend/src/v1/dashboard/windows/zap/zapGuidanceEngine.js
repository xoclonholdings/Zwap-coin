function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function formatNumber(value) {
  return toNumber(value, 0).toLocaleString();
}

function getNextUnlock({
  zptsBalance = 0,
  shopUnlocked = false,
  learnUnlocked = false,
  swapUnlocked = false,
}) {
  const safeZpts = toNumber(zptsBalance, 0);

  if (!shopUnlocked) {
    return {
      label: "Shop",
      remaining: Math.max(0, 1000 - safeZpts),
    };
  }

  if (!learnUnlocked) {
    return {
      label: "Learn",
      remaining: Math.max(0, 1500 - safeZpts),
    };
  }

  if (!swapUnlocked) {
    return {
      label: "Swap",
      remaining: Math.max(0, 3000 - safeZpts),
    };
  }

  return {
    label: "Next reward",
    remaining: 0,
  };
}

function normalizeActivitySignal(activitySignal) {
  if (!activitySignal || typeof activitySignal !== "object") return null;

  return {
    type: activitySignal.type || activitySignal.activityType || "",
    message: activitySignal.message || "",
    priority: activitySignal.priority || "normal",
  };
}

function makeGuidance(headline, detail, action) {
  return {
    headline,
    detail,
    action,
    text: [headline, detail, action].filter(Boolean).join("\n"),
  };
}

export function buildZapGuidance({
  systemMessage = "",
  nextStep = "",
  eventType = "",
  activitySignal = null,

  zptsBalance = 0,

  completedTaskCount = 0,
  totalTaskCount = 4,

  dailySteps = 0,
  stepGoal = 10000,

  gamesPlayedToday = 0,
  playGoal = 1,

  lessonsCompletedToday = 0,

  shopUnlocked = false,
  learnUnlocked = false,
  swapUnlocked = false,
}) {
  const safeZpts = toNumber(zptsBalance, 0);
  const safeCompleted = toNumber(completedTaskCount, 0);
  const safeTotal = Math.max(1, toNumber(totalTaskCount, 4));

  const safeSteps = toNumber(dailySteps, 0);
  const safeStepGoal = Math.max(1, toNumber(stepGoal, 10000));

  const safeGames = toNumber(gamesPlayedToday, 0);
  const safePlayGoal = Math.max(1, toNumber(playGoal, 1));

  const safeLessons = toNumber(lessonsCompletedToday, 0);

  const loopComplete = safeCompleted >= safeTotal;
  const moveComplete = safeSteps >= safeStepGoal;
  const playComplete = safeGames >= safePlayGoal;

  const signal = normalizeActivitySignal(activitySignal);
  const signalType = signal?.type || eventType;

  const nextUnlock = getNextUnlock({
    zptsBalance: safeZpts,
    shopUnlocked,
    learnUnlocked,
    swapUnlocked,
  });

  if (systemMessage) {
    return makeGuidance(systemMessage, nextStep, "");
  }

  if (nextStep) {
    return makeGuidance(nextStep, "", "");
  }

  if (swapUnlocked) {
    return makeGuidance(
      "Swap is ready.",
      `${formatNumber(safeZpts)} zPts available.`,
      "Spend, hold, or swap with intention."
    );
  }

  if (loopComplete) {
    return makeGuidance(
      "Daily loop complete.",
      `${formatNumber(safeZpts)} zPts earned so far.`,
      "Check your next unlock."
    );
  }

  if (signalType === "milestone") {
    return makeGuidance(
      "Milestone reached.",
      `${formatNumber(safeZpts)} zPts stacked.`,
      `Keep building toward ${nextUnlock.label}.`
    );
  }

  if (signalType === "play_complete" || safeGames > 0) {
    if (!moveComplete && safeSteps === 0) {
      return makeGuidance(
        "Play counted.",
        `${safeGames} of ${safePlayGoal} play goals done.`,
        "Add movement next."
      );
    }

    return makeGuidance(
      "Play counted.",
      `${safeGames} of ${safePlayGoal} play goals done.`,
      "Keep the loop moving."
    );
  }

  if (signalType === "move_progress" || safeSteps > 0) {
    if (!playComplete) {
      return makeGuidance(
        "Move is active.",
        `${formatNumber(safeSteps)} steps logged.`,
        "Play 1 game next."
      );
    }

    return makeGuidance(
      "Move is active.",
      `${formatNumber(safeSteps)} steps logged.`,
      "Keep earning zPts."
    );
  }

  if (shopUnlocked && safeZpts < 500) {
    return makeGuidance(
      "Shop is open.",
      `${formatNumber(safeZpts)} zPts available.`,
      "Save before spending."
    );
  }

  if (shopUnlocked) {
    return makeGuidance(
      "Shop is open.",
      `${formatNumber(safeZpts)} zPts available.`,
      "Spend with a plan."
    );
  }

  if (learnUnlocked && safeLessons === 0) {
    return makeGuidance(
      "Learn is open.",
      `${formatNumber(safeZpts)} zPts available.`,
      "Try one lesson next."
    );
  }

  if (safeCompleted > 0) {
    return makeGuidance(
      `${safeCompleted} of ${safeTotal} tasks complete.`,
      `${formatNumber(safeZpts)} zPts available.`,
      "Finish one more action."
    );
  }

  if (nextUnlock.remaining > 0) {
    return makeGuidance(
      "Hey, I’m Zap.",
      `${formatNumber(safeZpts)} zPts available.`,
      `${formatNumber(nextUnlock.remaining)} more unlocks ${nextUnlock.label}.`
    );
  }

  return makeGuidance(
    "Hey, I’m Zap.",
    "I’ll be your guide.",
    "Move or play to begin."
  );
}