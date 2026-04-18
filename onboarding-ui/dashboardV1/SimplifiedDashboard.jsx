import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import AppHeaderV1 from "./AppHeaderV1";
import DashboardV1 from "./DashboardV1";
import AccountPanelContentV1 from "./AccountPanelContentV1";

function buildInitials(name = "") {
  const safe = String(name || "").trim();
  if (!safe) return "Z";

  const parts = safe.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function shortenAddress(address = "") {
  const safe = String(address || "").trim();
  if (!safe) return "";
  if (safe.length <= 12) return safe;
  return `${safe.slice(0, 6)}...${safe.slice(-4)}`;
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
  showUpgrade = false,

  onOpenUpgrade,
  onAdminTrigger,
  onOpenProfile,
  onOpenContact,
  onOpenPrivacy,
  onOpenHelp,
  onOpenTerms,

  className = "",
}) {
  const navigate = useNavigate();
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
        navigate("/profile");
      }
      return;
    }

    if (target === "contact") {
      if (typeof onOpenContact === "function") {
        onOpenContact();
      } else {
        navigate("/contact");
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
          shopUnlocked={shopUnlocked}
          gardenUnlocked={gardenUnlocked}
          badgeVisibilityUnlocked={badgeVisibilityUnlocked}
          learnUnlocked={learnUnlocked}
          streamUnlocked={streamUnlocked}
          streamMinutesToday={streamMinutesToday}
          streamDailyGoalMinutes={streamDailyGoalMinutes}
          isListening={isListening}
          activeAudioTitle={activeAudioTitle}
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