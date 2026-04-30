let lastMessageKey = "";
let idleStage = 0;
let lastIdleChange = Date.now();

const IDLE_STAGE_TIMINGS = [0, 30000, 60000, 90000];

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

function advanceIdleStage() {
  const now = Date.now();
  const elapsed = now - lastIdleChange;

  if (idleStage < IDLE_STAGE_TIMINGS.length - 1) {
    if (elapsed >= IDLE_STAGE_TIMINGS[idleStage + 1]) {
      idleStage += 1;
    }
  }
}

function resetIdleStage() {
  idleStage = 0;
  lastIdleChange = Date.now();
}

function uniqueMessage(message) {
  if (!message?.text) return message;

  if (message.text === lastMessageKey) {
    return null;
  }

  lastMessageKey = message.text;
  return message;
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

function makeGuidance(headline, detail, action, priority = "low") {
  return {
    headline,
    detail,
    action,
    priority,
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
  nextUnlock,
}) {
  if (!signal || !isFreshSignal(signal)) return null;

  if (signal.type === "login") {
    return makeGuidance(
      "You’re back.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts landed.`
        : "Check-in counted.",
      "Pick your move.",
      "high"
    );
  }

  if (signal.type === "move") {
    return makeGuidance(
      "Movement counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts`
        : `${formatNumber(signal.steps || safeSteps)} steps`,
      "Play can close it.",
      "high"
    );
  }

  if (signal.type === "play") {
    const gameName = formatGameName(signal.game);

    return makeGuidance(
      gameName || "Game counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts`
        : `${safeGames}/${safePlayGoal} games`,
      moveComplete ? "Loop forming." : "Add movement.",
      "high"
    );
  }

  if (signal.type === "learn") {
    return makeGuidance(
      "Lesson counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts`
        : "Knowledge added.",
      "Quiet progress.",
      "high"
    );
  }

  if (signal.type === "shop_purchase") {
    return makeGuidance(
      "Item secured.",
      signal.itemName || "Purchase complete.",
      `${formatNumber(safeZpts)} zPts left.`,
      "high"
    );
  }

  if (signal.type === "full_loop") {
    return makeGuidance(
      "Loop complete.",
      `${formatNumber(safeZpts)} zPts ready.`,
      "That’s the rhythm.",
      "high"
    );
  }

  if (signal.type === "milestone") {
    return makeGuidance(
      "Milestone hit.",
      `${formatNumber(safeZpts)} zPts stacked.`,
      `Next: ${nextUnlock.label}`,
      "high"
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
  advanceIdleStage();

  const intro = [
    makeGuidance("Hey, I’m Zap.", "I guide this system.", "Tap a window."),
    makeGuidance("See the arrows?", "More lives behind them.", "Tap to switch."),
    makeGuidance("Quick tip.", "Each window has layers.", "Peek around."),
  ];

  if (!safeCompleted && !safeZpts && !safeSteps && !safeGames) {
    return pickByTick(intro, idleTick);
  }

  const stageOne = [
    makeGuidance(
      "Small moves matter.",
      `${safeCompleted}/${safeTotal} tasks lit.`,
      "One more shifts it.",
      "medium"
    ),
    makeGuidance(
      "You’re building.",
      `${formatNumber(safeZpts)} zPts stacked.`,
      "Keep it simple.",
      "medium"
    ),
    makeGuidance(
      "Check the windows.",
      "Each one shows more.",
      "Tap around.",
      "low"
    ),
  ];

  const stageTwo = [
    makeGuidance(
      "Still here.",
      `${safeCompleted}/${safeTotal} tasks lit.`,
      "One tap can move it.",
      "medium"
    ),
    makeGuidance(
      "The board is waiting.",
      `${formatNumber(safeZpts)} zPts ready.`,
      "Move or play.",
      "medium"
    ),
    makeGuidance(
      "Peek behind a window.",
      "The arrows show layers.",
      "Try one.",
      "low"
    ),
  ];

  const stageThree = [
    makeGuidance(
      "Momentum matters.",
      `${formatNumber(safeSteps)} steps logged.`,
      safeGames > 0 ? "Keep the loop warm." : "Add one game.",
      "medium"
    ),
    makeGuidance(
      "Don’t let it cool.",
      `${safeCompleted}/${safeTotal} tasks done.`,
      "Finish one more.",
      "medium"
    ),
    makeGuidance(
      "Tiny push.",
      `Next: ${nextUnlock.label}`,
      "Keep stacking.",
      "medium"
    ),
  ];

  const stageFour = [
    makeGuidance(
      "Don’t break flow.",
      "You were building.",
      "Finish it.",
      "medium"
    ),
    makeGuidance(
      "One more action.",
      `${safeCompleted}/${safeTotal} tasks lit.`,
      "Close the loop.",
      "medium"
    ),
    makeGuidance(
      "System’s ready.",
      `Next: ${nextUnlock.label}`,
      "Push through.",
      "medium"
    ),
  ];

  let pool = stageOne;

  if (idleStage === 1) {
    pool = stageTwo;
  }

  if (idleStage === 2) {
    pool = stageThree;
  }

  if (idleStage >= 3) {
    pool = stageFour;
  }

  if (!shopUnlocked && nextUnlock.remaining > 0) {
    pool = [
      ...pool,
      makeGuidance(
        "Shop locked.",
        `${formatNumber(nextUnlock.remaining)} to unlock.`,
        "Move + Play.",
        "medium"
      ),
      makeGuidance(
        "Door’s not open yet.",
        `${formatNumber(safeZpts)} zPts saved.`,
        "Keep stacking.",
        "medium"
      ),
    ];
  }

  if (shopUnlocked && !learnUnlocked) {
    pool = [
      ...pool,
      makeGuidance(
        "Shop is open.",
        `${formatNumber(safeZpts)} zPts ready.`,
        "Spend smart.",
        "medium"
      ),
      makeGuidance(
        "First value layer.",
        "Effort became options.",
        "Check Shop.",
        "medium"
      ),
    ];
  }

  if (learnUnlocked && !swapUnlocked) {
    pool = [
      ...pool,
      makeGuidance(
        "Learn is open.",
        "Quiet upgrades live here.",
        "Try one lesson.",
        "medium"
      ),
      makeGuidance(
        "Brain room unlocked.",
        "No rush needed.",
        "Take one bite.",
        "medium"
      ),
      makeGuidance(
        "Soft win waiting.",
        "One lesson keeps it light.",
        "Start small.",
        "medium"
      ),
    ];
  }

  if (swapUnlocked) {
    pool = [
      ...pool,
      makeGuidance(
        "Swap is ready.",
        `${formatNumber(safeZpts)} zPts available.`,
        "Move with intent.",
        "medium"
      ),
      makeGuidance(
        "Value is live.",
        "No need to rush.",
        "Read the board.",
        "medium"
      ),
    ];
  }

  const startIndex = Math.abs(toNumber(idleTick, 0)) % pool.length;

  for (let offset = 0; offset < pool.length; offset += 1) {
    const candidate = pool[(startIndex + offset) % pool.length];
    const unique = uniqueMessage(candidate);

    if (unique) return unique;
  }

  return pool[startIndex] || stageOne[0];
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
  const safePlayGoal = Math.max(1, toNumber(playGoal, 1));
  const safeLessons = toNumber(lessonsCompletedToday, 0);

  const moveComplete = safeSteps > 0;
  const playComplete = safeGames >= safePlayGoal;
  const loopComplete = safeCompleted >= safeTotal;

  const signal = normalizeActivitySignal(activitySignal);
  const signalType = signal?.type || eventType;

  const nextUnlock = getNextUnlock({
    zptsBalance: safeZpts,
    shopUnlocked,
    learnUnlocked,
    swapUnlocked,
  });

  if (systemMessage) {
    resetIdleStage();
    return makeGuidance(systemMessage, nextStep, "", "high");
  }

  if (nextStep) {
    resetIdleStage();
    return makeGuidance(nextStep, "", "", "medium");
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

  if (signalGuidance) {
    resetIdleStage();
    return signalGuidance;
  }

  if (loopComplete) {
    return makeGuidance(
      "Loop complete.",
      `${formatNumber(safeZpts)} zPts ready.`,
      "Nice rhythm.",
      "high"
    );
  }

  if (signalType === "milestone") {
    resetIdleStage();
    return makeGuidance(
      "Milestone hit.",
      `${formatNumber(safeZpts)} zPts stacked.`,
      `Next: ${nextUnlock.label}`,
      "high"
    );
  }

  if (safeGames > 0 && safeSteps === 0) {
    return makeGuidance(
      "Game counted.",
      `${safeGames}/${safePlayGoal} done.`,
      "Add movement.",
      "high"
    );
  }

  if (safeSteps > 0 && !playComplete) {
    return makeGuidance(
      "Movement in.",
      `${formatNumber(safeSteps)} steps.`,
      "Play one game.",
      "high"
    );
  }

  if (learnUnlocked && safeLessons > 0) {
    return makeGuidance(
      "Lesson logged.",
      `${safeLessons} learned today.`,
      "Good little stack.",
      "medium"
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