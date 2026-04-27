import React, { Suspense, lazy, useEffect, useRef, useState } from "react";

import useV1DashboardState from "./useV1DashboardState";
import AppHeaderV1 from "./AppHeaderV1";
import DashboardWindowMove from "./windows/DashboardWindowMove";
import DashboardWindowPlay from "./windows/DashboardWindowPlay";
import DashboardWindowShop from "./windows/DashboardWindowShop";
import DashboardWindowZwap from "./windows/DashboardWindowZwap";

import { getCurrentSteps, subscribeToSteps } from "@/services/stepService";

const StackzGame = lazy(() =>
  import("@/v1/components/games/stackz/StackzGame")
);

const BreakerzGame = lazy(() =>
  import("@/v1/components/games/breakerz/BreakerzGame")
);

const PulzeGame = lazy(() =>
  import("@/v1/components/games/pulze/PulzeGame")
);

const ZapManGame = lazy(() =>
  import("@/v1/components/games/zapman/ZapManGame")
);

function estimateCaloriesFromSteps(steps) {
  const safeSteps = Math.max(0, Number(steps || 0));
  return Math.round(safeSteps * 0.04);
}

function GameLoadingScreen() {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-[#050816] text-white">
      <div className="rounded-[24px] border border-cyan-300/15 bg-white/[0.04] px-5 py-4 text-center shadow-[0_0_32px_rgba(34,211,238,0.10)]">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200/70">
          Loading Game
        </div>
        <div className="mt-2 text-sm font-semibold text-white/70">
          Powering up the arcade…
        </div>
      </div>
    </div>
  );
}

export default function DashboardV1({ user, authUser }) {
  const state = useV1DashboardState({ user, authUser });

  const {
    zptsBalance,
    displayName,

    isZwapAltView,
    setIsZwapAltView,

    shopUnlocked,
    gardenUnlocked,
    rarePlantUnlocked,
    isSwapUnlocked,

    badgeVisibilityUnlocked,
    learnUnlocked,
    streamUnlocked,
    assistUnlocked,

    profileNeedsSetup,
    hasNewHighScore,
    canSpendZpts,
    shouldSaveZpts,

    completedTaskCount,
    totalTaskCount,

    streakDays,
    dailySteps,
    gamesPlayedToday,
    lessonsCompletedToday,
    lastActiveAt,
    fullLoopCompleted,

    healthPercent,
    growthStage,
    plantName,

    longestStreak,
    totalBlooms,
    activeDays,
    missedDays,
    daysUntilNextBloom,
    nextRareUnlock,
    streakGraceDaysRemaining,

    zwapMode,
    zwapMessage,
    zwapHint,
  } = state;

  const [moveIsActive, setMoveIsActive] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeGameId, setActiveGameId] = useState(null);

  const sessionStartStepsRef = useRef(0);

  const handleToggleMove = () => {
    setMoveIsActive((current) => {
      const nextState = !current;

      if (nextState) {
        sessionStartStepsRef.current = getCurrentSteps();
        setSessionSteps(0);
        setTimerSeconds(0);
      }

      return nextState;
    });
  };

  const handleToggleZwapAltView = () => {
    setIsZwapAltView((current) => !current);
  };

  const handleStartGame = (game) => {
    if (!game || game.locked) return;
    setActiveGameId(game.id);
  };

  const handleGameEnd = (result) => {
    console.log("Game ended:", result);
    setActiveGameId(null);
  };

  useEffect(() => {
    if (!moveIsActive) return undefined;

    const unsubscribe = subscribeToSteps((deviceSteps) => {
      const startSteps = Number(sessionStartStepsRef.current || 0);
      setSessionSteps(Math.max(0, Number(deviceSteps || 0) - startSteps));
    });

    return () => unsubscribe();
  }, [moveIsActive]);

  useEffect(() => {
    if (!moveIsActive) return undefined;

    const interval = window.setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [moveIsActive]);

  const calories = estimateCaloriesFromSteps(sessionSteps);

  if (activeGameId) {
    return (
      <Suspense fallback={<GameLoadingScreen />}>
        {activeGameId === "stackz" ? (
          <StackzGame isPlaying={true} onGameEnd={handleGameEnd} />
        ) : null}

        {activeGameId === "breakerz" ? (
          <BreakerzGame isPlaying={true} onGameEnd={handleGameEnd} />
        ) : null}

        {activeGameId === "pulze" ? (
          <PulzeGame isPlaying={true} onGameEnd={handleGameEnd} />
        ) : null}

        {activeGameId === "zap-man" ? (
          <ZapManGame isPlaying={true} onGameEnd={handleGameEnd} />
        ) : null}
      </Suspense>
    );
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden">
      <div className="shrink-0">
        <AppHeaderV1
          zptsBalance={zptsBalance}
          displayName={displayName}
          gardenUnlocked={gardenUnlocked}
          learnUnlocked={learnUnlocked}
          streamUnlocked={streamUnlocked}
          badgesUnlocked={badgeVisibilityUnlocked}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2.5 px-2.5 pb-2.5 pt-2.5">
        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowMove
            isActive={moveIsActive}
            sessionSteps={sessionSteps}
            calories={calories}
            timerSeconds={timerSeconds}
            onToggleMove={handleToggleMove}
          />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowPlay
            onStartGame={handleStartGame}
            onOpenPlay={handleStartGame}
          />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowShop zptsBalance={zptsBalance} />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowZwap
            isAltView={isZwapAltView}
            onToggleAltView={handleToggleZwapAltView}
            systemMessage={zwapMessage}
            eventType={zwapMode}
            nextStep={zwapHint}
            completedTaskCount={completedTaskCount}
            totalTaskCount={totalTaskCount}
            shopUnlocked={shopUnlocked}
            gardenUnlocked={gardenUnlocked}
            learnUnlocked={learnUnlocked}
            assistUnlocked={assistUnlocked}
            swapUnlocked={isSwapUnlocked}
            badgeVisibilityUnlocked={badgeVisibilityUnlocked}
            streamUnlocked={streamUnlocked}
            profileNeedsSetup={profileNeedsSetup}
            hasNewHighScore={hasNewHighScore}
            canSpendZpts={canSpendZpts}
            shouldSaveZpts={shouldSaveZpts}
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
    </div>
  );
}