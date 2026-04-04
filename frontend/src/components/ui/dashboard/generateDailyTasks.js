export function generateDailyTasks({
  hasWallet,
  canClaimDaily,
  lastDailyClaim,
  dailyReward,
  gamesPlayed,
  profile,
}) {
  const loginComplete = hasWallet ? !canClaimDaily && !!lastDailyClaim : false;

  // --- LEARN (always present)
  const learnComplete = !!profile?.daily_learn_complete;

  // --- PLAY (dynamic)
  const gameOptions = ["zbrickles", "ztrivia", "ztetris"];
  const selectedGame =
    gameOptions[Math.floor(Math.random() * gameOptions.length)];

  const gameTarget = Math.floor(Math.random() * 3) + 1;
  const playComplete = gamesPlayed >= gameTarget;

  // --- SOCIAL (dynamic)
  const socialTypes = [
    { type: "assist", label: "Send Assists" },
    { type: "react", label: "React in Stream" },
  ];

  const selectedSocial =
    socialTypes[Math.floor(Math.random() * socialTypes.length)];

  const socialTarget = Math.floor(Math.random() * 3) + 1;
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