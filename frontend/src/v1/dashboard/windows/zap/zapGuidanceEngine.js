function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function formatNumber(value) {
  return toNumber(value, 0).toLocaleString();
}

function formatGameName(value = "") {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
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
    zpts: toNumber(activitySignal.zpts, 0),
    zwap: toNumber(activitySignal.zwap, 0),
    steps: toNumber(activitySignal.steps, 0),
    game: activitySignal.game || "",
    itemId: activitySignal.item_id || activitySignal.itemId || "",
    itemName: activitySignal.item_name || activitySignal.itemName || "",
    createdAt: activitySignal.created_at || activitySignal.createdAt || null,
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

function isFreshSignal(signal) {
  if (!signal?.createdAt) return true;

  const created = new Date(signal.createdAt).getTime();
  if (!Number.isFinite(created)) return true;

  const ageMs = Date.now() - created;
  return ageMs <= 1000 * 60 * 10;
}

function buildSignalGuidance({
  signal,
  safeZpts,
  safeSteps,
  safeGames,
  safePlayGoal,
  moveComplete,
  playComplete,
  loopComplete,
  nextUnlock,
}) {
  if (!signal || !isFreshSignal(signal)) return null;

  if (signal.type === "login") {
    if (loopComplete) {
      return makeGuidance(
        "You showed up.",
        `Daily loop complete. ${formatNumber(safeZpts)} zPts ready.`,
        "Check the next unlock."
      );
    }

    return makeGuidance(
      "You showed up.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts claimed.`
        : "Daily check-in counted.",
      "Move or play next."
    );
  }

  if (signal.type === "move") {
    if (loopComplete) {
      return makeGuidance(
        "Move counted.",
        `Daily loop complete. ${formatNumber(safeZpts)} zPts ready.`,
        "That one landed."
      );
    }

    if (!playComplete) {
      return makeGuidance(
        "Move counted.",
        signal.zpts > 0
          ? `+${formatNumber(signal.zpts)} zPts from movement.`
          : `${formatNumber(signal.steps || safeSteps)} steps logged.`,
        "Play 1 game next."
      );
    }

    return makeGuidance(
      "Move counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts from movement.`
        : `${formatNumber(signal.steps || safeSteps)} steps logged.`,
      "Keep the loop alive."
    );
  }

  if (signal.type === "play") {
    const gameName = formatGameName(signal.game);

    if (loopComplete) {
      return makeGuidance(
        gameName ? `${gameName} counted.` : "Play counted.",
        `Daily loop complete. ${formatNumber(safeZpts)} zPts ready.`,
        "Clean finish."
      );
    }

    if (!moveComplete && safeSteps === 0) {
      return makeGuidance(
        gameName ? `${gameName} counted.` : "Play counted.",
        signal.zpts > 0
          ? `+${formatNumber(signal.zpts)} zPts added.`
          : `${safeGames} of ${safePlayGoal} play goals done.`,
        "Add movement next."
      );
    }

    return makeGuidance(
      gameName ? `${gameName} counted.` : "Play counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts added.`
        : `${safeGames} of ${safePlayGoal} play goals done.`,
      "Keep the loop moving."
    );
  }

  if (signal.type === "learn") {
    return makeGuidance(
      "Learn counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts added.`
        : "Knowledge added.",
      "Brain battery charging."
    );
  }

  if (signal.type === "shop_purchase") {
    return makeGuidance(
      "Item acquired.",
      signal.itemName || "Shop purchase complete.",
      safeZpts > 0 ? `${formatNumber(safeZpts)} zPts left.` : "Spend with a plan."
    );
  }

  if (signal.type === "full_loop") {
    return makeGuidance(
      "Daily loop complete.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} bonus zPts added.`
        : `${formatNumber(safeZpts)} zPts ready.`,
      "That’s the rhythm."
    );
  }

  if (signal.type === "milestone") {
    return makeGuidance(
      "Milestone reached.",
      `${formatNumber(safeZpts)} zPts stacked.`,
      `Keep building toward ${nextUnlock.label}.`
    );
  }

  if (signal.message) {
    return makeGuidance(
      signal.message,
      `${formatNumber(safeZpts)} zPts available.`,
      "Keep building."
    );
  }

  return null;
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

  const signalGuidance = buildSignalGuidance({
    signal,
    safeZpts,
    safeSteps,
    safeGames,
    safePlayGoal,
    moveComplete,
    playComplete,
    loopComplete,
    nextUnlock,
  });

  if (signalGuidance) return signalGuidance;

  if (loopComplete) {
    return makeGuidance(
      "Daily loop complete.",
      `${formatNumber(safeZpts)} zPts ready.`,
      "Check your next unlock."
    );
  }

  if (swapUnlocked) {
    return makeGuidance(
      "Swap is ready.",
      `${formatNumber(safeZpts)} zPts available.`,
      "Spend, hold, or swap with intention."
    );
  }

  if (signalType === "milestone") {
    return makeGuidance(
      "Milestone reached.",
      `${formatNumber(safeZpts)} zPts stacked.`,
      `Keep building toward ${nextUnlock.label}.`
    );
  }

  if (safeGames > 0 && safeSteps === 0) {
    return makeGuidance(
      "Play counted.",
      `${safeGames} of ${safePlayGoal} play goals done.`,
      "Add movement next."
    );
  }

  if (safeSteps > 0 && !playComplete) {
    return makeGuidance(
      "Move is active.",
      `${formatNumber(safeSteps)} steps logged.`,
      "Play 1 game next."
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
