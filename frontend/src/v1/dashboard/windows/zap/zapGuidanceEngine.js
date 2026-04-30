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

function pickByTick(messages = [], idleTick = 0) {
  if (!messages.length) return "";
  const index = Math.abs(toNumber(idleTick, 0)) % messages.length;
  return messages[index];
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
    return { label: "Learn", remaining: 0 };
  }

  if (!swapUnlocked) {
    return { label: "Swap", remaining: 0 };
  }

  return { label: "Next", remaining: 0 };
}

function normalizeActivitySignal(activitySignal) {
  if (!activitySignal || typeof activitySignal !== "object") return null;

  return {
    type: activitySignal.type || activitySignal.activityType || "",
    message: activitySignal.message || "",
    zpts: toNumber(activitySignal.zpts, 0),
    steps: toNumber(activitySignal.steps, 0),
    game: activitySignal.game || "",
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

  return Date.now() - created <= 1000 * 60 * 10;
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
    return makeGuidance(
      "You’re back.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts landed.`
        : "Check-in counted.",
      "Move or play."
    );
  }

  if (signal.type === "move") {
    return makeGuidance(
      "Movement counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts`
        : `${formatNumber(signal.steps || safeSteps)} steps`,
      "Play finishes it."
    );
  }

  if (signal.type === "play") {
    const gameName = formatGameName(signal.game);

    return makeGuidance(
      gameName || "Game counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts`
        : `${safeGames}/${safePlayGoal} games`,
      moveComplete ? "Loop forming." : "Add movement."
    );
  }

  if (signal.type === "learn") {
    return makeGuidance(
      "Lesson counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts`
        : "Knowledge added.",
      "Quiet progress."
    );
  }

  if (signal.type === "shop_purchase") {
    return makeGuidance(
      "Item secured.",
      signal.itemName || "Purchase complete.",
      `${formatNumber(safeZpts)} zPts left.`
    );
  }

  if (signal.type === "full_loop") {
    return makeGuidance(
      "Loop complete.",
      `${formatNumber(safeZpts)} zPts ready.`,
      "That’s the rhythm."
    );
  }

  if (signal.type === "milestone") {
    return makeGuidance(
      "Milestone hit.",
      `${formatNumber(safeZpts)} zPts stacked.`,
      `Next: ${nextUnlock.label}`
    );
  }

  return null;
}

function buildIdleGuidance({
  safeZpts,
  safeCompleted,
  safeTotal,
  safeSteps,
  safeGames,
  shopUnlocked,
  learnUnlocked,
  swapUnlocked,
  nextUnlock,
  idleTick,
}) {
  const intro = [
    makeGuidance("Hey, I’m Zap.", "I guide this system.", "Tap a window."),
    makeGuidance("See the arrows?", "There’s more behind them.", "Tap to switch."),
    makeGuidance("Quick tip.", "Each window has layers.", "Explore them."),
  ];

  if (!safeCompleted && !safeZpts && !safeSteps && !safeGames) {
    return pickByTick(intro, idleTick);
  }

  const general = [
    makeGuidance(
      "Small moves matter.",
      `${safeCompleted}/${safeTotal} tasks lit.`,
      "One more shifts it."
    ),
    makeGuidance(
      "You’re building.",
      `${formatNumber(safeZpts)} zPts stacked.`,
      "Keep it simple."
    ),
    makeGuidance(
      "Check the windows.",
      "Each one shows something new.",
      "Tap around."
    ),
  ];

  if (!shopUnlocked && nextUnlock.remaining > 0) {
    return pickByTick(
      [
        makeGuidance(
          "Shop locked.",
          `${formatNumber(nextUnlock.remaining)} to unlock.`,
          "Move + Play."
        ),
        general[0],
      ],
      idleTick
    );
  }

  if (shopUnlocked && !learnUnlocked) {
    return pickByTick(
      [
        makeGuidance(
          "Shop is open.",
          `${formatNumber(safeZpts)} zPts ready.`,
          "Spend smart."
        ),
        general[1],
      ],
      idleTick
    );
  }

  if (learnUnlocked && !swapUnlocked) {
    return pickByTick(
      [
        makeGuidance(
          "Learn is open.",
          "Quiet upgrades live here.",
          "Try one lesson."
        ),
        general[2],
      ],
      idleTick
    );
  }

  if (swapUnlocked) {
    return pickByTick(
      [
        makeGuidance(
          "Swap is ready.",
          `${formatNumber(safeZpts)} zPts available.`,
          "Move with intent."
        ),
        general[1],
      ],
      idleTick
    );
  }

  return pickByTick(general, idleTick);
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

  idleTick = 0,
}) {
  const safeZpts = toNumber(zptsBalance, 0);
  const safeCompleted = toNumber(completedTaskCount, 0);
  const safeTotal = Math.max(1, toNumber(totalTaskCount, 4));

  const safeSteps = toNumber(dailySteps, 0);
  const safeGames = toNumber(gamesPlayedToday, 0);

  const moveComplete = safeSteps > 0;
  const playComplete = safeGames >= playGoal;
  const loopComplete = safeCompleted >= safeTotal;

  const signal = normalizeActivitySignal(activitySignal);
  const signalType = signal?.type || eventType;

  const nextUnlock = getNextUnlock({
    zptsBalance: safeZpts,
    shopUnlocked,
    learnUnlocked,
    swapUnlocked,
  });

  if (systemMessage) return makeGuidance(systemMessage, nextStep, "");
  if (nextStep) return makeGuidance(nextStep, "", "");

  const signalGuidance = buildSignalGuidance({
    signal,
    safeZpts,
    safeSteps,
    safeGames,
    safePlayGoal: playGoal,
    moveComplete,
    playComplete,
    loopComplete,
    nextUnlock,
  });

  if (signalGuidance) return signalGuidance;

  if (loopComplete) {
    return makeGuidance(
      "Loop complete.",
      `${formatNumber(safeZpts)} zPts ready.`,
      "Nice rhythm."
    );
  }

  if (signalType === "milestone") {
    return makeGuidance(
      "Milestone hit.",
      `${formatNumber(safeZpts)} zPts stacked.`,
      `Next: ${nextUnlock.label}`
    );
  }

  if (safeGames > 0 && safeSteps === 0) {
    return makeGuidance(
      "Game counted.",
      `${safeGames}/${playGoal} done.`,
      "Add movement."
    );
  }

  if (safeSteps > 0 && !playComplete) {
    return makeGuidance(
      "Movement in.",
      `${formatNumber(safeSteps)} steps.`,
      "Play one game."
    );
  }

  if (learnUnlocked && lessonsCompletedToday === 0) {
    return makeGuidance(
      "Learn is open.",
      "Quiet upgrades live here.",
      "Try one lesson."
    );
  }

  if (safeCompleted > 0) {
    return makeGuidance(
      `${safeCompleted}/${safeTotal} tasks.`,
      `${formatNumber(safeZpts)} zPts.`,
      "Keep it moving."
    );
  }

  return buildIdleGuidance({
    safeZpts,
    safeCompleted,
    safeTotal,
    safeSteps,
    safeGames,
    shopUnlocked,
    learnUnlocked,
    swapUnlocked,
    nextUnlock,
    idleTick,
  });
}