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

  // ✅ V1 IDENTITY (EMAIL ONLY)
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

  const handleGameEnd = (result) => {
    console.log("Game ended:", result);
    setActiveGameId(null);
  };

  // ✅ V1 SHOP PURCHASE (EMAIL)
  const handlePurchaseShopItem = async (item) => {
    const itemId = item?.id || item?._id;
    const paymentType = item?.payment_method || "zpts";

    if (!resolvedEmail || !itemId) return;

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

    return res.json();
  };

  // MOVE SESSION
  useEffect(() => {
    if (!moveIsActive) return;

    const unsubscribe = subscribeToSteps((deviceSteps) => {
      const start = Number(sessionStartStepsRef.current || 0);
      setSessionSteps(Math.max(0, Number(deviceSteps || 0) - start));
    });

    return () => unsubscribe();
  }, [moveIsActive]);

  useEffect(() => {
    if (!moveIsActive) return;

    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [moveIsActive]);

  // SHOP LOAD
  useEffect(() => {
    let mounted = true;

    async function loadShop() {
      setShopLoading(true);
      setShopError("");

      try {
        const [cats, items] = await Promise.all([
          fetch(`${API_BASE}/shop/categories`),
          fetch(`${API_BASE}/shop/items`),
        ]);

        if (!cats.ok || !items.ok) throw new Error("Shop failed");

        const c = await cats.json();
        const i = await items.json();

        if (!mounted) return;

        setShopCategories(Array.isArray(c) ? c : []);
        setShopItems(Array.isArray(i) ? i : []);
      } catch (err) {
        if (!mounted) return;

        console.error(err);
        setShopError("Shop failed to load");
      } finally {
        if (mounted) setShopLoading(false);
      }
    }

    loadShop();

    return () => {
      mounted = false;
    };
  }, []);

  const calories = estimateCaloriesFromSteps(sessionSteps);

  // GAME MODE
  if (activeGameId) {
    return (
      <Suspense fallback={<GameLoadingScreen />}>
        {activeGameId === "stackz" && (
          <StackzGame isPlaying onGameEnd={handleGameEnd} />
        )}
        {activeGameId === "breakerz" && (
          <BreakerzGame isPlaying onGameEnd={handleGameEnd} />
        )}
        {activeGameId === "pulze" && (
          <PulzeGame isPlaying onGameEnd={handleGameEnd} />
        )}
        {activeGameId === "zap-man" && (
          <ZapManGame isPlaying onGameEnd={handleGameEnd} />
        )}
      </Suspense>
    );
  }

  // ✅ ACTIVITY PAGE (EMAIL, NOT WALLET)
  if (activeView === "activity") {
    return (
      <ActivityPageV1
        onBack={handleBackFromActivity}
        email={resolvedEmail}
      />
    );
  }

  // DASHBOARD
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
        <DashboardWindowMove
          isActive={moveIsActive}
          sessionSteps={sessionSteps}
          calories={calories}
          timerSeconds={timerSeconds}
          onToggleMove={handleToggleMove}
        />

        <DashboardWindowPlay
          onStartGame={handleStartGame}
          onOpenPlay={handleStartGame}
        />

        <DashboardWindowShop
          zptsBalance={zptsBalance}
          shopUnlocked={previewShopUnlocked}
          categories={shopCategories}
          items={shopItems}
          loading={shopLoading}
          error={shopError}
          onPurchaseItem={handlePurchaseShopItem}
        />

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
          dailySteps={dailySteps}
          gamesPlayedToday={gamesPlayedToday}
          lessonsCompletedToday={lessonsCompletedToday}
          fullLoopCompleted={fullLoopCompleted}
        />
      </div>
    </div>
  );
}