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

  // --- LOGIN
  const loginComplete = hasWallet ? !canClaimDaily && !!lastDailyClaim : false;

  // --- LEARN (always present)
  const learnComplete = !!profile?.daily_learn_complete;

  // --- PLAY
  const gameOptions = ["zbrickles", "ztrivia", "ztetris"];
  const selectedGame =
    gameOptions[Math.floor(rand() * gameOptions.length)];

  const gameTarget = Math.floor(rand() * 3) + 1;
  const playComplete = gamesPlayed >= gameTarget;

  // --- SOCIAL
  const socialTypes = [
    { type: "assist", label: "Send Assists" },
    { type: "react", label: "React in Stream" },
  ];

  const selectedSocial =
    socialTypes[Math.floor(rand() * socialTypes.length)];

  const socialTarget = Math.floor(rand() * 3) + 1;
  const socialProgress = profile?.daily_social_count ?? 0;
  const socialComplete = socialProgress >= socialTarget;

  return [
    {
      key: "login",
      title: "Daily Login",
      reward: dailyReward,
      completed: loginComplete,
      hint: hasWallet
        ? "Claim today’s login reward"
        : "Connect wallet to claim",
    },
    {
      key: "learn",
      title: "Learn",
      reward: 15,
      completed: learnComplete,
      hint: learnComplete
        ? "Complete"
        : "Review or complete a module",
    },
    {
      key: "play",
      title: `Play ${gameTarget} ${selectedGame}`,
      reward: 10 + gameTarget * 5,
      completed: playComplete,
      hint: playComplete
        ? "Complete"
        : `${Math.max(gameTarget - gamesPlayed, 0)} left`,
    },
    {
      key: "social",
      title: `${selectedSocial.label} (${socialTarget})`,
      reward: 10 + socialTarget * 5,
      completed: socialComplete,
      hint: socialComplete
        ? "Complete"
        : `${Math.max(socialTarget - socialProgress, 0)} left`,
    },
  ];
}
