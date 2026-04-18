import React from "react";
import useV1DashboardState from "@/hooks/useV1DashboardState";
import DashboardWindowMove from "@/components/ui/dashboard/v1/DashboardWindowMove";
import DashboardWindowPlay from "@/components/ui/dashboard/v1/DashboardWindowPlay";
import DashboardWindowShop from "@/components/ui/dashboard/v1/DashboardWindowShop";
import DashboardWindowZwap from "@/components/ui/dashboard/v1/DashboardWindowZwap";

export default function DashboardV1({
  shopUnlocked: shopUnlockedProp,
  gardenUnlocked: gardenUnlockedProp,
  badgeVisibilityUnlocked: badgeVisibilityUnlockedProp,
  learnUnlocked: learnUnlockedProp,
  streamUnlocked: streamUnlockedProp,
  assistUnlocked: assistUnlockedProp,
  swapUnlocked: swapUnlockedProp,
}) {
  const {
    steps,
    stepsPercent,
    gamesPlayedToday,
    playPercent,
    zptsBalance,
    zptsPercent,

    isZwapAltView,
    isSwapUnlocked,

    shopUnlocked,
    gardenUnlocked,

    streakDays,
    dailySteps,
    lessonsCompletedToday,
    lastActiveAt,
    fullLoopCompleted,

    healthPercent,
    growthStage,
    plantName,
    rarePlantUnlocked,

    longestStreak,
    totalBlooms,
    activeDays,
    missedDays,
    daysUntilNextBloom,
    nextRareUnlock,
    streakGraceDaysRemaining,

    completedTaskCount,
    totalTaskCount,

    badgeVisibilityUnlocked,
    learnUnlocked,
    streamUnlocked,
    assistUnlocked,

    profileNeedsSetup,
    hasNewHighScore,
    canSpendZpts,
    shouldSaveZpts,

    zwapMode,
    zwapMessage,
    zwapHint,
  } = useV1DashboardState();

  const resolvedShopUnlocked =
    typeof shopUnlockedProp === "boolean" ? shopUnlockedProp : shopUnlocked;

  const resolvedGardenUnlocked =
    typeof gardenUnlockedProp === "boolean" ? gardenUnlockedProp : gardenUnlocked;

  const resolvedBadgeVisibilityUnlocked =
    typeof badgeVisibilityUnlockedProp === "boolean"
      ? badgeVisibilityUnlockedProp
      : badgeVisibilityUnlocked;

  const resolvedLearnUnlocked =
    typeof learnUnlockedProp === "boolean" ? learnUnlockedProp : learnUnlocked;

  const resolvedStreamUnlocked =
    typeof streamUnlockedProp === "boolean" ? streamUnlockedProp : streamUnlocked;

  const resolvedAssistUnlocked =
    typeof assistUnlockedProp === "boolean" ? assistUnlockedProp : assistUnlocked;

  const resolvedSwapUnlocked =
    typeof swapUnlockedProp === "boolean" ? swapUnlockedProp : isSwapUnlocked;

  return (
    <div className="flex w-full justify-center px-3 pb-6">
      <div className="flex w-full max-w-[430px] flex-col gap-3">
        <DashboardWindowMove
          steps={steps}
          stepsPercent={stepsPercent}
        />

        <DashboardWindowPlay
          gamesPlayedToday={gamesPlayedToday}
          playPercent={playPercent}
        />

        <DashboardWindowShop
          zptsBalance={zptsBalance}
          shopUnlocked={resolvedShopUnlocked}
        />

        <DashboardWindowZwap
          isAltView={isZwapAltView}
          isSwapUnlocked={resolvedSwapUnlocked}
          mode={zwapMode}
          systemMessage={zwapMessage}
          nextStep={zwapHint}
          completedTaskCount={completedTaskCount}
          totalTaskCount={totalTaskCount}
          shopUnlocked={resolvedShopUnlocked}
          gardenUnlocked={resolvedGardenUnlocked}
          badgeVisibilityUnlocked={resolvedBadgeVisibilityUnlocked}
          learnUnlocked={resolvedLearnUnlocked}
          streamUnlocked={resolvedStreamUnlocked}
          assistUnlocked={resolvedAssistUnlocked}
          swapUnlocked={resolvedSwapUnlocked}
          profileNeedsSetup={profileNeedsSetup}
          hasNewHighScore={hasNewHighScore}
          canSpendZpts={canSpendZpts}
          shouldSaveZpts={shouldSaveZpts}
          zptsBalance={zptsBalance}
          zptsPercent={zptsPercent}
          streakDays={streakDays}
          dailySteps={dailySteps}
          gamesPlayedToday={gamesPlayedToday}
          lessonsCompletedToday={lessonsCompletedToday}
          lastActiveAt={lastActiveAt}
          fullLoopCompleted={fullLoopCompleted}
          healthPercent={healthPercent}
          growthStage={growthStage}
          plantName={plantName}
          rarePlantUnlocked={rarePlantUnlocked}
          longestStreak={longestStreak}
          totalBlooms={totalBlooms}
          activeDays={activeDays}
          missedDays={missedDays}
          daysUntilNextBloom={daysUntilNextBloom}
          nextRareUnlock={nextRareUnlock}
          streakGraceDaysRemaining={streakGraceDaysRemaining}
        />
      </div>
    </div>
  );
}