import React from "react";
import useV1DashboardState from "@/hooks/useV1DashboardState";
import AppHeaderV1 from "@/components/ui/dashboard/v1/AppHeaderV1";
import DashboardWindowMove from "@/components/ui/dashboard/v1/DashboardWindowMove";
import DashboardWindowPlay from "@/components/ui/dashboard/v1/DashboardWindowPlay";
import DashboardWindowShop from "@/components/ui/dashboard/v1/DashboardWindowShop";
import DashboardWindowZwap from "@/components/ui/dashboard/v1/DashboardWindowZwap";

export default function DashboardV1() {
  const {
    steps,
    stepsPercent,
    gamesPlayedToday,
    playPercent,
    zptsBalance,
    zptsPercent,

    isZwapAltView,
    isSwapUnlocked,

    streakDays,
    dailySteps,
    lessonsCompletedToday,
    lastActiveAt,
    fullLoopCompleted,

    healthPercent,
    growthStage,
    plantName,
    rarePlantUnlocked,
    gardenUnlocked,

    longestStreak,
    totalBlooms,
    activeDays,
    missedDays,
    daysUntilNextBloom,
    nextRareUnlock,
    streakGraceDaysRemaining,
  } = useV1DashboardState();

  return (
    <div className="flex w-full justify-center px-3 pb-6">
      <div className="flex w-full max-w-[430px] flex-col gap-3">
        <AppHeaderV1
          stepsPercent={stepsPercent}
          zptsPercent={zptsPercent}
          zptsBalance={zptsBalance}
        />

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
        />

        <DashboardWindowZwap
          isAltView={isZwapAltView}
          isSwapUnlocked={isSwapUnlocked}
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
          gardenUnlocked={gardenUnlocked}
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