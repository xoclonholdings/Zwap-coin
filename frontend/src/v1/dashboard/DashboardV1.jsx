import React, {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import useV1DashboardState from "./useV1DashboardState";
import AppHeaderV1 from "./AppHeaderV1";
import DashboardWindowMove from "./windows/DashboardWindowMove";
import DashboardWindowPlay from "./windows/DashboardWindowPlay";
import DashboardWindowShop from "./windows/DashboardWindowShop";
import DashboardWindowZwap from "./windows/DashboardWindowZwap";

import ActivityPageV1 from "./activity/ActivityPageV1";
import { getActivityDashboard } from "./activity/activityApi";

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

const ADMIN_PREVIEW_EMAILS = ["admin@zwap.online"];

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

function estimateCaloriesFromSteps(steps) {
  return Math.round(Math.max(0, Number(steps || 0)) * 0.04);
}

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

  const resolvedEmail = useMemo(
    () => getResolvedEmail({ authUser, user }),
    [authUser, user]
  );

  const isAdminPreviewUser = ADMIN_PREVIEW_EMAILS.includes(resolvedEmail);

  const previewShopUnlocked = isAdminPreviewUser || shopUnlocked;
  const previewGardenUnlocked = isAdminPreviewUser || gardenUnlocked;
  const previewRarePlantUnlocked = isAdminPreviewUser || rarePlantUnlocked;
  const previewSwapUnlocked = isAdminPreviewUser || isSwapUnlocked;
  const previewBadgeVisibilityUnlocked =
    isAdminPreviewUser || badgeVisibilityUnlocked;
  const previewLearnUnlocked = isAdminPreviewUser || learnUnlocked;
  const previewStreamUnlocked = isAdminPreviewUser || streamUnlocked;
  const previewAssistUnlocked = isAdminPreviewUser || assistUnlocked;

  const [moveIsActive, setMoveIsActive] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeGameId, setActiveGameId] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");

  const [shopCategories, setShopCategories] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopError, setShopError] = useState("");

  const [activitySignal, setActivitySignal] = useState(null);
  const [activitySnapshot, setActivitySnapshot] = useState(null);

  const sessionStartStepsRef = useRef(0);

  function handleOpenActivity() {
    setActiveView("activity");
  }

  function handleBackFromActivity() {
    setActiveView("dashboard");
  }

  const handleToggleMove = () => {
    setMoveIsActive((current) => {
      const next = !current;

      if (next) {
        sessionStartStepsRef.current = getCurrentSteps();
        setSessionSteps(0);
        setTimerSeconds(0);
      }

      return next;
    });
  };

  const handleToggleZwapAltView = () => {
    setIsZwapAltView((current) => !current);
  };

  const handleStartGame = (game) => {
    if (!game || game.locked) return;
    setActiveGameId(game.id);
  };

  const refreshActivitySnapshot = async () => {
    if (!resolvedEmail) return null;

    try {
      const data = await getActivityDashboard(resolvedEmail);

      setActivitySnapshot(data || null);
      setActivitySignal(data?.latestActivitySignal || null);

      return data;
    } catch (error) {
      console.error("Activity snapshot failed:", error);
      return null;
    }
  };

  const handleGameEnd = async (result) => {
    console.log("Game ended:", result);
    setActiveGameId(null);
    await refreshActivitySnapshot();
  };

  const handlePurchaseShopItem = async (item) => {
    const itemId = item?.id || item?._id;
    const paymentType = item?.payment_method || "zpts";

    if (!resolvedEmail || !itemId) return null;

    const res = await fetch(`${API_BASE}/shop/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: resolvedEmail,
        item_id: itemId,
        payment_type: paymentType,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Purchase failed");
    }

    const data = await res.json();
    await refreshActivitySnapshot();

    return data;
  };

  useEffect(() => {
    if (!moveIsActive) return undefined;

    const unsubscribe = subscribeToSteps((deviceSteps) => {
      const start = Number(sessionStartStepsRef.current || 0);
      setSessionSteps(Math.max(0, Number(deviceSteps || 0) - start));
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

  useEffect(() => {
    let mounted = true;

    async function loadShop() {
      setShopLoading(true);
      setShopError("");

      try {
        const [categoriesResponse, itemsResponse] = await Promise.all([
          fetch(`${API_BASE}/shop/categories`),
          fetch(`${API_BASE}/shop/items`),
        ]);

        if (!categoriesResponse.ok) {
          throw new Error("Shop categories failed to load");
        }

        if (!itemsResponse.ok) {
          throw new Error("Shop items failed to load");
        }

        const categories = await categoriesResponse.json();
        const items = await itemsResponse.json();

        if (!mounted) return;

        setShopCategories(Array.isArray(categories) ? categories : []);
        setShopItems(Array.isArray(items) ? items : []);
      } catch (error) {
        if (!mounted) return;

        console.error("Shop load failed:", error);
        setShopError(error?.message || "Shop failed to load");
        setShopCategories([]);
        setShopItems([]);
      } finally {
        if (mounted) {
          setShopLoading(false);
        }
      }
    }

    loadShop();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadActivity() {
      if (!resolvedEmail) {
        setActivitySnapshot(null);
        setActivitySignal(null);
        return;
      }

      try {
        const data = await getActivityDashboard(resolvedEmail);

        if (!mounted) return;

        setActivitySnapshot(data || null);
        setActivitySignal(data?.latestActivitySignal || null);
      } catch (error) {
        if (!mounted) return;

        console.error("Activity load failed:", error);
        setActivitySnapshot(null);
        setActivitySignal(null);
      }
    }

    loadActivity();

    return () => {
      mounted = false;
    };
  }, [resolvedEmail]);

  const calories = estimateCaloriesFromSteps(sessionSteps);

  const resolvedCompletedTaskCount =
    activitySnapshot?.completedTaskCount ?? completedTaskCount;

  const resolvedTotalTaskCount = activitySnapshot?.totalTaskCount ?? totalTaskCount;

  const resolvedDailySteps = activitySnapshot?.dailySteps ?? dailySteps;

  const resolvedGamesPlayedToday =
    activitySnapshot?.gamesPlayedToday ?? gamesPlayedToday;

  const resolvedLessonsCompletedToday =
    activitySnapshot?.lessonsCompletedToday ?? lessonsCompletedToday;

  const resolvedFullLoopCompleted =
    activitySnapshot?.fullLoopCompleted ?? fullLoopCompleted;

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

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden">
      <div className="shrink-0">
        <AppHeaderV1
          zptsBalance={zptsBalance}
          displayName={displayName}
          gardenUnlocked={previewGardenUnlocked}
          learnUnlocked={previewLearnUnlocked}
          streamUnlocked={previewStreamUnlocked}
          badgesUnlocked={previewBadgeVisibilityUnlocked}
          onActivityClick={handleOpenActivity}
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
          <DashboardWindowShop
            zptsBalance={zptsBalance}
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
            zptsBalance={zptsBalance}
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