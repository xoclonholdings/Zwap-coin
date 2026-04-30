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

function pickByTime(messages = [], intervalMs = 18000) {
  if (!messages.length) return "";
  const bucket = Math.floor(Date.now() / intervalMs);
  return messages[bucket % messages.length];
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
      remaining: 0,
    };
  }

  if (!swapUnlocked) {
    return {
      label: "Swap",
      remaining: 0,
    };
  }

  return {
    label: "Next unlock",
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
      "You made it back.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts landed.`
        : "Your daily check-in counted.",
      loopComplete ? "Loop complete. Nice rhythm." : "Move or play when ready."
    );
  }

  if (signal.type === "move") {
    return makeGuidance(
      "That movement counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts from moving.`
        : `${formatNumber(signal.steps || safeSteps)} steps logged.`,
      playComplete ? "Loop is warming up." : "Play can finish the loop."
    );
  }

  if (signal.type === "play") {
    const gameName = formatGameName(signal.game);

    return makeGuidance(
      gameName ? `${gameName} counted.` : "Game counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts added.`
        : `${safeGames} of ${safePlayGoal} play goals done.`,
      moveComplete ? "That fits the loop." : "A little movement pairs with it."
    );
  }

  if (signal.type === "learn") {
    return makeGuidance(
      "That lesson counted.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} zPts added.`
        : "Knowledge added to the stack.",
      "Tiny lesson. Real progress."
    );
  }

  if (signal.type === "shop_purchase") {
    return makeGuidance(
      "Item secured.",
      signal.itemName || "Shop purchase complete.",
      safeZpts > 0
        ? `${formatNumber(safeZpts)} zPts still available.`
        : "Clean spend. Keep building."
    );
  }

  if (signal.type === "full_loop") {
    return makeGuidance(
      "Daily loop complete.",
      signal.zpts > 0
        ? `+${formatNumber(signal.zpts)} bonus zPts added.`
        : `${formatNumber(safeZpts)} zPts ready.`,
      "That is the pattern."
    );
  }

  if (signal.type === "milestone") {
    return makeGuidance(
      "Milestone hit.",
      `${formatNumber(safeZpts)} zPts stacked.`,
      `Next marker: ${nextUnlock.label}.`
    );
  }

  if (signal.message) {
    return makeGuidance(
      signal.message,
      `${formatNumber(safeZpts)} zPts available.`,
      "Keep the loop alive."
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
}) {
  const introMessages = [
    makeGuidance(
      "Hey, I’m Zap.",
      "I’ll be your guide in here.",
      "Tap a window to see what it can do."
    ),
    makeGuidance(
      "Little tip.",
      "Each window has another side.",
      "Tap around. Some stats hide behind the glass."
    ),
    makeGuidance(
      "This dashboard moves with you.",
      "Move, Play, Shop, and ZWAP! each carry a piece.",
      "Start anywhere. I’ll keep track."
    ),
  ];

  if (safeCompleted <= 0 && safeZpts <= 0 && safeSteps <= 0 && safeGames <= 0) {
    return pickByTime(introMessages);
  }

  const altWindowMessages = [
    makeGuidance(
      "Tiny dashboard secret.",
      "Some windows have extra stats or details tucked inside.",
      "Tap one and peek around."
    ),
    makeGuidance(
      "You do not have to rush.",
      "Move and Play are the main loop.",
      "The other windows help you read the system."
    ),
    makeGuidance(
      "I’m watching the pattern.",
      `${safeCompleted} of ${safeTotal} tasks are lit.`,
      "One more action can change the board."
    ),
  ];

  if (!shopUnlocked && nextUnlock.remaining > 0) {
    return pickByTime([
      makeGuidance(
        "Shop is still locked.",
        `${formatNumber(nextUnlock.remaining)} zPts until it opens.`,
        "Move and Play build the key."
      ),
      makeGuidance(
        "You’re stacking toward Shop.",
        `${formatNumber(safeZpts)} zPts saved so far.`,
        "Keep the rhythm simple."
      ),
      altWindowMessages[0],
    ]);
  }

  if (shopUnlocked && !learnUnlocked) {
    return pickByTime([
      makeGuidance(
        "Shop is open.",
        `${formatNumber(safeZpts)} zPts available.`,
        "Spend slow. Boosts are tactical."
      ),
      makeGuidance(
        "You unlocked the first value layer.",
        "Shop turns effort into choices.",
        "Tap Shop to see what rotated in."
      ),
      altWindowMessages[1],
    ]);
  }

  if (learnUnlocked && !swapUnlocked) {
    return pickByTime([
      makeGuidance(
        "Learn is waking up.",
        "Knowledge counts too.",
        "Try one lesson when you want a quieter win."
      ),
      makeGuidance(
        "You’re past the first door.",
        `${formatNumber(safeZpts)} zPts available.`,
        "Now the system gets deeper."
      ),
      altWindowMessages[2],
    ]);
  }

  if (swapUnlocked) {
    return pickByTime([
      makeGuidance(
        "Swap is available.",
        `${formatNumber(safeZpts)} zPts ready.`,
        "Move with intention, not impulse."
      ),
      makeGuidance(
        "Value is unlocked.",
        "That does not mean rush.",
        "Read the board before you act."
      ),
      altWindowMessages[0],
    ]);
  }

  return pickByTime(altWindowMessages);
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
  const moveComplete = safeSteps >= safeStepGoal || safeSteps > 0;
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
      "That is how the system learns your rhythm."
    );
  }

  if (signalType === "milestone") {
    return makeGuidance(
      "Milestone hit.",
      `${formatNumber(safeZpts)} zPts stacked.`,
      `Next marker: ${nextUnlock.label}.`
    );
  }

  if (safeGames > 0 && safeSteps === 0) {
    return makeGuidance(
      "Play counted.",
      `${safeGames} of ${safePlayGoal} play goals done.`,
      "Add movement when you are ready."
    );
  }

  if (safeSteps > 0 && !playComplete) {
    return makeGuidance(
      "Movement is in.",
      `${formatNumber(safeSteps)} steps logged.`,
      "One game can round this out."
    );
  }

  if (learnUnlocked && safeLessons === 0) {
    return makeGuidance(
      "Learn is open.",
      "That is the quiet upgrade path.",
      "Try one lesson when you want a softer win."
    );
  }

  if (safeCompleted > 0) {
    return makeGuidance(
      `${safeCompleted} of ${safeTotal} tasks lit.`,
      `${formatNumber(safeZpts)} zPts available.`,
      "One more action keeps the board moving."
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
  });
}