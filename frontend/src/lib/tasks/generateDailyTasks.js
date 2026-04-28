function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getSeed(wallet, date) {
  const base = `${wallet || "guest"}-${date}`;
  let hash = 0;

  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function formatGameTitle(gameKey, target) {
  const gameNameMap = {
    zbrickles: "zBrickles",
    ztrivia: "zTrivia",
    ztetris: "zTetris",
    zslots: "zSlots",
  };

  const gameName = gameNameMap[gameKey] || gameKey;
  const unit = target === 1 ? "round" : "rounds";

  return `Play ${target} ${unit} of ${gameName}`;
}

function formatRemaining(count, unit) {
  const safeCount = Math.max(Number(count) || 0, 0);
  return `${safeCount} ${unit}${safeCount === 1 ? "" : "s"} left`;
}

export function generateDailyTasks({
  hasWallet,
  canClaimDaily,
  lastDailyClaim,
  dailyReward,
  gamesPlayed,
  profile,
  walletAddress,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const seed = getSeed(walletAddress, today);

  let randIndex = 0;
  const rand = () => seededRandom(seed + randIndex++);

  const loginComplete = hasWallet ? !canClaimDaily && !!lastDailyClaim : false;

  const triviaComplete = !!profile?.daily_trivia_complete;
  const reviewedModulesToday = Number(profile?.daily_modules_reviewed ?? 0);
  const continuedModulesToday = Number(profile?.daily_modules_continued ?? 0);
  const completedModulesToday = Number(profile?.daily_modules_completed ?? 0);

  const assistsSentToday = Number(profile?.daily_assists_sent ?? 0);
  const assistsAcceptedToday = Number(profile?.daily_assists_accepted ?? 0);
  const streamReactionsToday = Number(profile?.daily_stream_reactions ?? 0);

  const learnTypes = [
    {
      type: "trivia",
      title: "Complete Trivia",
      reward: 10,
      progress: triviaComplete ? 1 : 0,
      target: 1,
      incompleteHint: "Finish today’s trivia challenge",
    },
    {
      type: "review_module",
      title: "Review 1 Learn Module",
      reward: 8,
      progress: reviewedModulesToday,
      target: 1,
      incompleteHint: "Review one learning module",
    },
    {
      type: "continue_module",
      title: "Continue 1 Learn Module",
      reward: 10,
      progress: continuedModulesToday,
      target: 1,
      incompleteHint: "Continue a saved module",
    },
    {
      type: "finish_module",
      title: "Finish 1 Learn Module",
      reward: 12,
      progress: completedModulesToday,
      target: 1,
      incompleteHint: "Complete one learning module",
    },
  ];

  const selectedLearn =
    learnTypes[Math.floor(rand() * learnTypes.length)];
  const learnComplete = selectedLearn.progress >= selectedLearn.target;

  const gameOptions = ["zbrickles", "ztrivia", "ztetris"];
  const selectedGame =
    gameOptions[Math.floor(rand() * gameOptions.length)];

  const gameTarget = Math.floor(rand() * 3) + 1;
  const playComplete = gamesPlayed >= gameTarget;

  const socialTypes = [
    {
      type: "send_assist",
      label: "Send Assists",
      rewardBase: 5,
      progress: assistsSentToday,
      unit: "assist",
    },
    {
      type: "accept_assist",
      label: "Accept Assists",
      rewardBase: 5,
      progress: assistsAcceptedToday,
      unit: "assist",
    },
    {
      type: "stream_react",
      label: "React in Stream",
      rewardBase: 5,
      progress: streamReactionsToday,
      unit: "reaction",
    },
  ];

  const selectedSocial =
    socialTypes[Math.floor(rand() * socialTypes.length)];

  const socialTarget = Math.floor(rand() * 2) + 1;
  const socialComplete = selectedSocial.progress >= socialTarget;

  return [
    {
      key: "login",
      title: "Daily Login",
      reward: dailyReward,
      completed: loginComplete,
      hint: loginComplete
        ? "Complete"
        : hasWallet
          ? "Claim today’s login reward"
          : "Connect wallet to claim",
    },
    {
      key: "learn",
      title: selectedLearn.title,
      reward: selectedLearn.reward,
      completed: learnComplete,
      hint: learnComplete
        ? "Complete"
        : selectedLearn.incompleteHint,
    },
    {
      key: "play",
      title: formatGameTitle(selectedGame, gameTarget),
      reward: 10 + gameTarget * 5,
      completed: playComplete,
      hint: playComplete
        ? "Complete"
        : formatRemaining(
            Math.max(gameTarget - gamesPlayed, 0),
            gameTarget === 1 ? "round" : "round"
          ),
    },
    {
      key: "social",
      title: `${selectedSocial.label} (${socialTarget})`,
      reward: selectedSocial.rewardBase + socialTarget * 2,
      completed: socialComplete,
      hint: socialComplete
        ? "Complete"
        : formatRemaining(
            Math.max(socialTarget - selectedSocial.progress, 0),
            selectedSocial.unit
          ),
    },
  ];
}
