import React, { useMemo } from "react";

import AppHeaderV1 from "./AppHeaderV1";
import DashboardV1 from "./DashboardV1";

function buildInitials(name = "") {
  const safe = String(name || "").trim();
  if (!safe) return "Z";

  const parts = safe.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export default function SimplifiedDashboard({
  displayName = "Zwapper",
  username = "",
  subtext = "",
  initials,
  tier = "zwapper",

  user,
  authUser,

  zptsBalance = 0,
  zwapBalance = 0,

  todaySteps = 0,
  stepGoal = 10000,
  completedTasks = 0,
  totalTasks = 4,

  shopUnlocked = false,
  gardenUnlocked = false,
  badgeVisibilityUnlocked = false,
  learnUnlocked = false,
  streamUnlocked = false,
  assistUnlocked = false,
  swapUnlocked = false,

  streamMinutesToday = 0,
  streamDailyGoalMinutes = 20,
  isListening = false,
  activeAudioTitle = "",

  walletAddress = "",
  isOnline = true,

  inventoryItems = [],
  achievements = [],
  trophyCount = 0,
  trophyBonusPercent = 0,

  onAdminTrigger,
  onLearnOpen,
  onStreamOpen,

  className = "",
}) {
  const resolvedDisplayName = useMemo(() => {
    if (displayName) return displayName;
    if (username) return username;
    return "Zwapper";
  }, [displayName, username]);

  const resolvedInitials = useMemo(() => {
    return initials || buildInitials(resolvedDisplayName);
  }, [initials, resolvedDisplayName]);

  return (
    <div
      className={[
        "relative min-h-screen w-full overflow-hidden bg-[linear-gradient(180deg,#050912_0%,#060b14_48%,#04070d_100%)] text-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12%] top-[-6%] h-[240px] w-[240px] rounded-full bg-cyan-500/8 blur-3xl" />
        <div className="absolute right-[-10%] top-[12%] h-[220px] w-[220px] rounded-full bg-violet-500/8 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[18%] h-[220px] w-[220px] rounded-full bg-cyan-400/6 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[430px] flex-col">
        <AppHeaderV1
          user={user}
          authUser={authUser}
          displayName={resolvedDisplayName}
          username={username}
          subtext={subtext}
          initials={resolvedInitials}
          tier={tier}
          zptsBalance={zptsBalance}
          zwapBalance={zwapBalance}
          walletAddress={walletAddress}
          todaySteps={todaySteps}
          dailyStepGoal={stepGoal}
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          isOnline={isOnline}
          isSticky={true}
          inventoryItems={inventoryItems}
          achievements={achievements}
          trophyCount={trophyCount}
          trophyBonusPercent={trophyBonusPercent}
          shopUnlocked={shopUnlocked}
          gardenUnlocked={gardenUnlocked}
          badgeVisibilityUnlocked={badgeVisibilityUnlocked}
          learnUnlocked={learnUnlocked}
          streamUnlocked={streamUnlocked}
          streamMinutesToday={streamMinutesToday}
          streamDailyGoalMinutes={streamDailyGoalMinutes}
          isListening={isListening}
          activeAudioTitle={activeAudioTitle}
          onAdminTrigger={onAdminTrigger}
          onLearnOpen={onLearnOpen}
          onStreamOpen={onStreamOpen}
        />

        <main className="min-h-0 flex-1 overflow-y-auto pb-6">
          <DashboardV1
            shopUnlocked={shopUnlocked}
            gardenUnlocked={gardenUnlocked}
            badgeVisibilityUnlocked={badgeVisibilityUnlocked}
            learnUnlocked={learnUnlocked}
            streamUnlocked={streamUnlocked}
            assistUnlocked={assistUnlocked}
            swapUnlocked={swapUnlocked}
          />
        </main>
      </div>
    </div>
  );
}