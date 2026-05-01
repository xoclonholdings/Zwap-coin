import React, { Suspense, lazy, useMemo, useState } from "react";

import useV1DashboardState from "./useV1DashboardState";
import useDashboardActivity from "./hooks/useDashboardActivity";
import useDashboardMove from "./hooks/useDashboardMove";
import useDashboardPlay from "./hooks/useDashboardPlay";
import useDashboardShop from "./hooks/useDashboardShop";
import useDashboardZwap from "./hooks/useDashboardZwap";

import AppHeaderV1 from "./AppHeaderV1";
import DashboardWindowMove from "./windows/DashboardWindowMove";
import DashboardWindowPlay from "./windows/DashboardWindowPlay";
import DashboardWindowShop from "./windows/DashboardWindowShop";
import DashboardWindowZwap from "./windows/DashboardWindowZwap";

import ActivityPageV1 from "./activity/ActivityPageV1";
import LearnPage from "./windows/learn/LearnPage";

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

const ADMIN_PREVIEW_EMAILS = ["admin@zwap.online"];

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

function getResolvedEmail({ authUser, user }) {
  return String(
    authUser?.email?.address ||
      authUser?.email ||
      user?.email ||
      user?.email_address ||
      ""
  )
    .trim()
    .toLowerCase();
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
  const [activeView, setActiveView] = useState("dashboard");
  const [localZptsBalance, setLocalZptsBalance] = useState(null);

  const resolvedEmail = useMemo(
    () => getResolvedEmail({ authUser, user }),
    [authUser, user]
  );

  const isDashboardAuthenticated = Boolean(resolvedEmail);
  const isAdminPreviewUser = ADMIN_PREVIEW_EMAILS.includes(resolvedEmail);

  const state = useV1DashboardState({
    user,
    authUser,
    isAuthenticated: isDashboardAuthenticated,
    isAdminPreviewUser,
  });

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
    taskStates,

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

  const resolvedTier = user?.tier || user?.accountTier || "zwapper";

  const {
    activitySnapshot,
    activitySignal,
    setActivitySignal,
    refreshActivitySnapshot,
  } = useDashboardActivity({ resolvedEmail });

  const {
    moveIsActive,
    sessionSteps,
    timerSeconds,
    calories,
    handleToggleMove,
  } = useDashboardMove({
    resolvedEmail,
    apiBase: API_BASE,
    refreshActivitySnapshot,
    setActivitySignal,
    onBalanceUpdate: setLocalZptsBalance,
  });

  const {
    activeGameId,
    localGamesPlayedToday,
    handleStartGame,
    handleGameEnd,
  } = useDashboardPlay({
    resolvedEmail,
    apiBase: API_BASE,
    refreshActivitySnapshot,
    setActivitySignal,
    onBalanceUpdate: setLocalZptsBalance,
  });

  const {
    shopCategories,
    shopItems,
    shopLoading,
    shopError,
    handlePurchaseShopItem,
  } = useDashboardShop({
    apiBase: API_BASE,
    resolvedEmail,
    refreshActivitySnapshot,
    onBalanceUpdate: setLocalZptsBalance,
  });

  const {
    previewShopUnlocked,
    previewGardenUnlocked,
    previewRarePlantUnlocked,
    previewSwapUnlocked,
    previewBadgeVisibilityUnlocked,
    previewLearnUnlocked,
    previewStreamUnlocked,
    previewAssistUnlocked,

    resolvedZptsBalance,
    resolvedDailySteps,
    resolvedGamesPlayedToday,
    resolvedHighScores,
    resolvedLessonsCompletedToday,
    resolvedFullLoopCompleted,
    resolvedTaskStates,
    resolvedCompletedTaskCount,
    resolvedTotalTaskCount,
  } = useDashboardZwap({
    isAdminPreviewUser,

    shopUnlocked,
    gardenUnlocked,
    rarePlantUnlocked,
    isSwapUnlocked,
    badgeVisibilityUnlocked,
    learnUnlocked,
    streamUnlocked,
    assistUnlocked,

    activitySnapshot,

    zptsBalance,
    localZptsBalance,

    dailySteps,
    sessionSteps,

    gamesPlayedToday,
    localGamesPlayedToday,

    lessonsCompletedToday,
    fullLoopCompleted,

    completedTaskCount,
    totalTaskCount,
    taskStates,
  });

  function handleOpenActivity() {
    setActiveView("activity");
  }

  function handleBackFromActivity() {
    setActiveView("dashboard");
  }

  function handleOpenLearn() {
    setActiveView("learn");
  }

  function handleBackFromLearn() {
    setActiveView("dashboard");
  }

  function handleToggleZwapAltView() {
    setIsZwapAltView((current) => !current);
  }

  if (activeGameId) {
    return (
      <Suspense fallback={<GameLoadingScreen />}>
        {activeGameId === "stackz" && (
          <StackzGame isPlaying={true} onGameEnd={handleGameEnd} />
        )}
        {activeGameId === "breakerz" && (
          <BreakerzGame isPlaying={true} onGameEnd={handleGameEnd} />
        )}
        {activeGameId === "pulze" && (
          <PulzeGame isPlaying={true} onGameEnd={handleGameEnd} />
        )}
        {activeGameId === "zap-man" && (
          <ZapManGame isPlaying={true} onGameEnd={handleGameEnd} />
        )}
      </Suspense>
    );
  }

  if (activeView === "activity") {
    return (
      <ActivityPageV1
        onBack={handleBackFromActivity}
        email={resolvedEmail}
      />
    );
  }

  if (activeView === "learn") {
    return <LearnPage onBack={handleBackFromLearn} />;
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden">
      <div className="shrink-0">
        <AppHeaderV1
          user={user}
          authUser={authUser}
          tier={resolvedTier}
          zptsBalance={resolvedZptsBalance}
          displayName={displayName}
          gardenUnlocked={previewGardenUnlocked}
          learnUnlocked={previewLearnUnlocked}
          streamUnlocked={previewStreamUnlocked}
          swapUnlocked={previewSwapUnlocked}
          onActivityClick={handleOpenActivity}
          onLearnClick={handleOpenLearn}
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
            highScores={resolvedHighScores}
            onStartGame={handleStartGame}
            onOpenPlay={handleStartGame}
          />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowShop
            zptsBalance={resolvedZptsBalance}
            shopUnlocked={previewShopUnlocked}
            categories={shopCategories}
            items={shopItems}
            loading={shopLoading}
            error={shopError}
            onPurchaseItem={handlePurchaseShopItem}
          />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowZwap
            isAltView={isZwapAltView}
            onToggleAltView={handleToggleZwapAltView}
            systemMessage={zwapMessage}
            eventType={zwapMode}
            nextStep={zwapHint}
            activitySignal={activitySignal}
            completedTaskCount={resolvedCompletedTaskCount}
            totalTaskCount={resolvedTotalTaskCount}
            taskStates={resolvedTaskStates}
            zptsBalance={resolvedZptsBalance}
            shopUnlocked={previewShopUnlocked}
            gardenUnlocked={previewGardenUnlocked}
            learnUnlocked={previewLearnUnlocked}
            assistUnlocked={previewAssistUnlocked}
            swapUnlocked={previewSwapUnlocked}
            badgeVisibilityUnlocked={previewBadgeVisibilityUnlocked}
            streamUnlocked={previewStreamUnlocked}
            profileNeedsSetup={profileNeedsSetup}
            hasNewHighScore={hasNewHighScore}
            canSpendZpts={canSpendZpts}
            shouldSaveZpts={shouldSaveZpts}
            streakDays={streakDays}
            dailySteps={resolvedDailySteps}
            gamesPlayedToday={resolvedGamesPlayedToday}
            lessonsCompletedToday={resolvedLessonsCompletedToday}
            lastActiveAt={lastActiveAt}
            fullLoopCompleted={resolvedFullLoopCompleted}
            healthPercent={healthPercent}
            growthStage={growthStage}
            plantName={plantName}
            rarePlantUnlocked={previewRarePlantUnlocked}
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