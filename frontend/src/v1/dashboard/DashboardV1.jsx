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
import StreamPanel from "./windows/stream/StreamPanel";
import MiniStreamPlayer from "./windows/stream/MiniStreamPlayer";
import SwapPage from "./windows/swap/SwapPage";

import radioArtwork from "../../assets/stream/zwap_radio_logo.png";

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

function getClaimableZwap(user) {
  return Number(
    user?.claimable_zwap ||
      user?.claimableZwap ||
      user?.internal_zwap_balance ||
      user?.internalZwapBalance ||
      0
  );
}

function getWalletAddress(user) {
  return String(
    user?.walletAddress ||
      user?.wallet_address ||
      user?.wallet ||
      ""
  ).trim();
}

function getProgressZone(zptsBalance = 0) {
  const safe = Number(zptsBalance || 0);

  if (safe >= 1000) return "Conversion Ready";
  if (safe >= 750) return "Almost Ready";
  if (safe >= 500) return "Building Momentum";
  if (safe >= 250) return "Getting Started";

  return "Building";
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
  const [activeView, setActiveView] = useState({
    type: "dashboard",
    payload: null,
  });
  const [streamOpen, setStreamOpen] = useState(false);
  const [miniStreamVisible, setMiniStreamVisible] = useState(false);
  const [miniStreamPlaying, setMiniStreamPlaying] = useState(true);
  const [localZptsBalance, setLocalZptsBalance] = useState(null);
  const [localClaimableZwap, setLocalClaimableZwap] = useState(null);

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

  const resolvedClaimableZwap =
    localClaimableZwap === null ? getClaimableZwap(user) : localClaimableZwap;

  const resolvedWalletAddress = getWalletAddress(user);
  const hasWallet = Boolean(resolvedWalletAddress);
  const conversionProgressZone = getProgressZone(resolvedZptsBalance);
  const isConversionReady = Number(resolvedZptsBalance || 0) >= 1000;

  function handleOpenActivity() {
    setActiveView({
      type: "activity",
      payload: null,
    });
  }

  function handleBackToDashboard() {
    setActiveView({
      type: "dashboard",
      payload: null,
    });
  }

  function handleOpenLearn(payload = null) {
    setActiveView({
      type: "learn",
      payload,
    });
  }

  function handleOpenSwap() {
    setActiveView({
      type: "swap",
      payload: null,
    });
  }

  function handleOpenStream() {
    setMiniStreamVisible(false);
    setStreamOpen(true);
  }

  function handleStreamOpenChange(nextOpen) {
    setStreamOpen(nextOpen);

    if (!nextOpen) {
      setMiniStreamVisible(true);
    }
  }

  function handleCloseMiniStream() {
    setMiniStreamVisible(false);
  }

  function handleToggleMiniStreamPlay() {
    handleOpenStream();
  }

  function handleToggleZwapAltView() {
    setIsZwapAltView((current) => !current);
  }

  async function handleConvertZpts() {
    if (!resolvedEmail || !isConversionReady) return;

    try {
      const response = await fetch(`${API_BASE}/wallet/convert-zpts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resolvedEmail,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) return;

      if (data?.new_zpts_balance !== undefined) {
        setLocalZptsBalance(data.new_zpts_balance);
      }

      if (data?.claimable_zwap !== undefined) {
        setLocalClaimableZwap(Number(data.claimable_zwap || 0));
      }

      refreshActivitySnapshot?.();
      setActivitySignal?.(Date.now());
    } catch {
      return;
    }
  }

  function handleClaimZwap() {
    return;
  }

  function handleCreateWallet() {
    return;
  }

  function handleLockedSwap() {
    return;
  }

  let screenContent = null;

  if (activeGameId) {
    screenContent = (
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
  } else if (activeView.type === "activity") {
    screenContent = (
      <ActivityPageV1
        onBack={handleBackToDashboard}
        email={resolvedEmail}
      />
    );
  } else if (activeView.type === "learn") {
    screenContent = (
      <LearnPage
        onBack={handleBackToDashboard}
        email={resolvedEmail}
        apiBase={API_BASE}
        refreshActivitySnapshot={refreshActivitySnapshot}
        setActivitySignal={setActivitySignal}
        onBalanceUpdate={setLocalZptsBalance}
        mode={activeView.payload?.mode || "default"}
        initialEbook={activeView.payload?.ebook || null}
      />
    );
  } else if (activeView.type === "swap") {
    screenContent = (
      <SwapPage
        onBack={handleBackToDashboard}
        zptsBalance={resolvedZptsBalance}
        claimableZwap={resolvedClaimableZwap}
        isConversionReady={isConversionReady}
        progressZone={conversionProgressZone}
        walletAddress={resolvedWalletAddress}
        hasWallet={hasWallet}
        swapUnlocked={previewSwapUnlocked}
        onConvert={handleConvertZpts}
        onClaim={handleClaimZwap}
        onCreateWallet={handleCreateWallet}
        onLockedSwap={handleLockedSwap}
      />
    );
  } else {
    screenContent = (
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
            streamUnlocked={true}
            swapUnlocked={previewSwapUnlocked}
            onActivityClick={handleOpenActivity}
            onLearnClick={handleOpenLearn}
            onStreamClick={handleOpenStream}
            onSwapClick={handleOpenSwap}
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

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {screenContent}

      <StreamPanel
        open={streamOpen}
        onOpenChange={handleStreamOpenChange}
      />

      <MiniStreamPlayer
        visible={miniStreamVisible && !streamOpen}
        title="ZWAP! Radio"
        subtitle={miniStreamPlaying ? "Now Playing" : "Paused"}
        artwork={radioArtwork}
        isPlaying={miniStreamPlaying}
        onTogglePlay={handleToggleMiniStreamPlay}
        onOpenStream={handleOpenStream}
        onClose={handleCloseMiniStream}
      />
    </div>
  );
}