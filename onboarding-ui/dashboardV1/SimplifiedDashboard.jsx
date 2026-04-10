import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import AppHeaderV1 from "./AppHeaderV1";
import DashboardV1 from "./DashboardV1";
import TabNavigationV1 from "./TabNavigationV1";
import AccountPanelContentV1 from "./AccountPanelContentV1";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function buildInitials(name = "") {
  const safe = String(name || "").trim();
  if (!safe) return "Z";

  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function shortenAddress(address = "") {
  const safe = String(address || "").trim();
  if (!safe) return "";
  if (safe.length <= 12) return safe;
  return `${safe.slice(0, 6)}...${safe.slice(-4)}`;
}

function buildTaskStates({
  completedTasks = 0,
  totalTasks = 4,
  taskStates = [],
  shopUnlocked = false,
}) {
  if (Array.isArray(taskStates) && taskStates.length > 0) {
    return taskStates.slice(0, 4);
  }

  const labels = shopUnlocked
    ? ["Login", "Move", "Play", "Shop"]
    : ["Login", "Move", "Play", "Learn"];

  const safeCompleted = clamp(Number(completedTasks || 0), 0, Math.max(1, totalTasks));

  return labels.slice(0, totalTasks).map((label, index) => ({
    label,
    completed: index < safeCompleted,
  }));
}

function buildSystemState({
  systemMode,
  systemMessage,
  systemEventType,
  systemNextStep,
  shopUnlocked,
  completedTasks,
  totalTasks,
  todaySteps,
  stepGoal,
  gamesPlayedToday,
}) {
  if (systemMode || systemMessage || systemEventType || systemNextStep) {
    return {
      mode: systemMode || "active",
      message: systemMessage || "",
      eventType: systemEventType || "",
      nextStep: systemNextStep || "",
    };
  }

  const safeGoal = Math.max(1, Number(stepGoal || 1));
  const safeProgress = Number(todaySteps || 0) / safeGoal;

  if (shopUnlocked) {
    return {
      mode: "active",
      message: "Shop is ready.",
      eventType: "shop_unlock",
      nextStep: "",
    };
  }

  if (Number(completedTasks || 0) >= Math.max(1, Number(totalTasks || 1))) {
    return {
      mode: "active",
      message: "Daily loop complete.",
      eventType: "task_complete",
      nextStep: "Nice work.",
    };
  }

  if (Number(gamesPlayedToday || 0) > 0) {
    return {
      mode: "active",
      message: "You just earned.",
      eventType: "play_complete",
      nextStep: "Want to keep going?",
    };
  }

  if (safeProgress >= 0.5) {
    return {
      mode: "active",
      message: "You’re moving.",
      eventType: "move_progress",
      nextStep: "Keep it going.",
    };
  }

  return {
    mode: "idle",
    message: "",
    eventType: "",
    nextStep: "",
  };
}

function DrawerShellV1({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close account drawer"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />

          <motion.aside
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-[380px] overflow-hidden border-l border-white/10 bg-[linear-gradient(180deg,rgba(8,14,20,0.98),rgba(4,8,14,1))] shadow-[-18px_0_48px_rgba(0,0,0,0.36)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default function SimplifiedDashboard({
  displayName = "Zwapper",
  subtext = "",
  initials,
  tier = "zwapper",
  zptsBalance = 0,
  zwapBalance = 0,
  todaySteps = 0,
  stepGoal = 10000,
  isMoveActive = false,

  gamesPlayedToday = 0,
  playGoal = 3,
  isPlayActive = false,

  completedTasks = 0,
  totalTasks = 4,
  taskStates = [],

  systemMode,
  systemMessage,
  systemEventType,
  systemNextStep,
  idleMessages,

  shopUnlocked = false,
  learnUnlocked = false,
  streamUnlocked = false,
  swapUnlocked = false,

  walletAddress = "",
  isOnline = true,
  showUpgrade = false,

  onOpenUpgrade,
  onAdminTrigger,
  onOpenProfile,
  onOpenContact,
  onOpenPrivacy,
  onOpenHelp,
  onOpenTerms,

  onOpenZwapPanel,

  homeRoute = "/dashboard",
  moveRoute = "/move",
  playRoute = "/play",
  tasksRoute = "/tasks",
  shopRoute = "/shop",

  className = "",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);

  const resolvedDisplayName = useMemo(() => {
    return displayName || "Zwapper";
  }, [displayName]);

  const resolvedSubtext = useMemo(() => {
    if (subtext) return subtext;
    if (walletAddress) return shortenAddress(walletAddress);
    return "Account active";
  }, [subtext, walletAddress]);

  const resolvedInitials = useMemo(() => {
    return initials || buildInitials(resolvedDisplayName);
  }, [initials, resolvedDisplayName]);

  const normalizedTaskStates = useMemo(() => {
    return buildTaskStates({
      completedTasks,
      totalTasks,
      taskStates,
      shopUnlocked,
    });
  }, [completedTasks, totalTasks, taskStates, shopUnlocked]);

  const systemState = useMemo(() => {
    return buildSystemState({
      systemMode,
      systemMessage,
      systemEventType,
      systemNextStep,
      shopUnlocked,
      completedTasks,
      totalTasks,
      todaySteps,
      stepGoal,
      gamesPlayedToday,
    });
  }, [
    systemMode,
    systemMessage,
    systemEventType,
    systemNextStep,
    shopUnlocked,
    completedTasks,
    totalTasks,
    todaySteps,
    stepGoal,
    gamesPlayedToday,
  ]);

  const handleOpenAccount = () => {
    setAccountOpen(true);
  };

  const handleCloseAccount = () => {
    setAccountOpen(false);
  };

  const handleNavigate = (target) => {
    if (target === "profile") {
      if (typeof onOpenProfile === "function") {
        onOpenProfile();
      } else {
        navigate(`${homeRoute}/profile`);
      }
      return;
    }

    if (target === "contact") {
      if (typeof onOpenContact === "function") {
        onOpenContact();
      } else {
        navigate(`${homeRoute}/contact`);
      }
      return;
    }

    if (target === "privacy") {
      if (typeof onOpenPrivacy === "function") {
        onOpenPrivacy();
      } else {
        navigate("/privacy");
      }
      return;
    }

    if (target === "help") {
      if (typeof onOpenHelp === "function") {
        onOpenHelp();
      } else {
        navigate("/help");
      }
      return;
    }

    if (target === "terms") {
      if (typeof onOpenTerms === "function") {
        onOpenTerms();
      } else {
        navigate("/terms");
      }
    }
  };

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
          zptsBalance={zptsBalance}
          todaySteps={todaySteps}
          dailyStepGoal={stepGoal}
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          displayName={resolvedDisplayName}
          initials={resolvedInitials}
          isOnline={isOnline}
          onOpenAccount={handleOpenAccount}
          isSticky={true}
        />

        <main className="min-h-0 flex-1 overflow-y-auto pb-24">
          <DashboardV1
            todaySteps={todaySteps}
            stepGoal={stepGoal}
            isMoveActive={isMoveActive}
            gamesPlayedToday={gamesPlayedToday}
            playGoal={playGoal}
            isPlayActive={isPlayActive}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
            taskStates={normalizedTaskStates}
            systemMode={systemState.mode}
            systemMessage={systemState.message}
            systemEventType={systemState.eventType}
            systemNextStep={systemState.nextStep}
            idleMessages={idleMessages}
            shopUnlocked={shopUnlocked}
            learnUnlocked={learnUnlocked}
            streamUnlocked={streamUnlocked}
            swapUnlocked={swapUnlocked}
            onOpenMove={() => navigate(moveRoute)}
            onOpenPlay={() => navigate(playRoute)}
            onOpenTasks={() => navigate(shopUnlocked ? shopRoute : tasksRoute)}
            onOpenZwap={() => {
              if (typeof onOpenZwapPanel === "function") {
                onOpenZwapPanel();
              } else if (location.pathname !== homeRoute) {
                navigate(homeRoute);
              }
            }}
          />
        </main>

        <TabNavigationV1
          shopUnlocked={shopUnlocked}
          onOpenAccount={handleOpenAccount}
          homeRoute={homeRoute}
          moveRoute={moveRoute}
          playRoute={playRoute}
          tasksRoute={tasksRoute}
          shopRoute={shopRoute}
        />
      </div>

      <DrawerShellV1 open={accountOpen} onClose={handleCloseAccount}>
        <AccountPanelContentV1
          showHeader={true}
          onClose={handleCloseAccount}
          onNavigate={handleNavigate}
          onOpenUpgrade={onOpenUpgrade}
          onAdminTrigger={onAdminTrigger}
          displayName={resolvedDisplayName}
          subtext={resolvedSubtext}
          initials={resolvedInitials}
          tier={tier}
          zptsBalance={zptsBalance}
          zwapBalance={zwapBalance}
          walletAddress={walletAddress}
          showUpgrade={showUpgrade}
        />
      </DrawerShellV1>
    </div>
  );
}