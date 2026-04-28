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
  const safeSteps = Math.max(0, Number(steps || 0));
  return Math.round(safeSteps * 0.04);
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

  const sessionStartStepsRef = useRef(0);

  function handleOpenActivity() {
    setActiveView("activity");
  }

  function handleBackFromActivity() {
    setActiveView("dashboard");
  }

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

  const handlePurchaseShopItem = async (item) => {
    const walletAddress = user?.wallet_address || user?.walletAddress || "";
    const itemId = item?.id || item?._id;
    const paymentType = item?.payment_method || "zpts";

    if (!walletAddress || !itemId) return;

    const response = await fetch(
      `${API_BASE}/shop/purchase/${walletAddress}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: itemId,
          payment_type: paymentType,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Purchase failed");
    }

    return response.json();
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

  useEffect(() => {
    let isMounted = true;

    async function loadShopData() {
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

        if (!isMounted) return;

        setShopCategories(Array.isArray(categories) ? categories : []);
        setShopItems(Array.isArray(items) ? items : []);
      } catch (error) {
        if (!isMounted) return;

        console.error("Shop load failed:", error);
        setShopError(error?.message || "Shop failed to load");
        setShopCategories([]);
        setShopItems([]);
      } finally {
        if (isMounted) {
          setShopLoading(false);
        }
      }
    }

    loadShopData();

    return () => {
      isMounted = false;
    };
  }, []);

  const calories = estimateCaloriesFromSteps(sessionSteps);

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
        walletAddress={user?.wallet_address || user?.walletAddress || ""}
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
            completedTaskCount={completedTaskCount}
            totalTaskCount={totalTaskCount}
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
            dailySteps={dailySteps}
            gamesPlayedToday={gamesPlayedToday}
            lessonsCompletedToday={lessonsCompletedToday}
            lastActiveAt={lastActiveAt}
            fullLoopCompleted={fullLoopCompleted}
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