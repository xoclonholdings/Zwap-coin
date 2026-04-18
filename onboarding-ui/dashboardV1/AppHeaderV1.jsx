import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sprout, BookOpen, Play, Award } from "lucide-react";

import AccountDrawer from "@/components/ui/dashboard/drawer/AccountDrawer";
import AccountPanelContentV1 from "./AccountPanelContentV1";
import AdminPanelV1 from "./admin/AdminPanelV1";

function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function getInitials(username) {
  const safeUsername = String(username || "").trim();

  if (!safeUsername) return "U";

  const parts = safeUsername.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function ProgressBar({ percent = 0 }) {
  const safePercent = clampPercent(percent);

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 transition-all duration-300"
        style={{ width: `${safePercent}%` }}
      />
    </div>
  );
}

function HeaderIconButton({ label, icon, unlocked = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
        unlocked
          ? "border-cyan-400/35 bg-cyan-500/12 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.14)]"
          : "border-white/8 bg-white/[0.03] text-white/28",
      ].join(" ")}
    >
      {icon}
    </button>
  );
}

function HeaderPopup({ popup, onClose }) {
  if (!popup) return null;

  const safePercent = clampPercent(popup.progressPercent ?? 0);

  return (
    <div className="absolute left-0 top-full z-40 mt-2 w-[220px] rounded-2xl border border-white/10 bg-[#0c1220]/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/80">
        {popup.title}
      </div>

      <div className="text-[12px] leading-5 text-white/80">
        {popup.message}
      </div>

      {typeof popup.progressPercent === "number" ? (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/45">
            <span>Progress</span>
            <span>{safePercent}%</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 transition-all duration-300"
              style={{ width: `${safePercent}%` }}
            />
          </div>
        </div>
      ) : null}

      {popup.helperText ? (
        <div className="mt-2 text-[10px] leading-4 text-white/45">
          {popup.helperText}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onClose}
        className="mt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-300/80"
      >
        Close
      </button>
    </div>
  );
}

export default function AppHeaderV1({
  progressPercent = 0,
  zptsBalance = 0,
  zwapBalance = 0,
  username = "",
  displayName = "",
  subtext = "",
  initials,

  user,
  authUser,

  tier = "zwapper",
  walletAddress = "",
  isOnline = true,

  todaySteps = 0,
  dailyStepGoal = 10000,
  completedTasks = 0,
  totalTasks = 4,

  inventoryItems = [],
  achievements = [],
  trophyCount = 0,
  trophyBonusPercent = 0,

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

  onAdminTrigger,
  onLearnOpen,
  onStreamOpen,
  onOpenFAQ,
  onOpenContact,
  onOpenAbout,
  onOpenSupportChat,

  onGardenClick,
  onLearnClick,
  onStreamClick,
  onBadgeClick,
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [popup, setPopup] = useState(null);

  const popupRef = useRef(null);

  const resolvedName = useMemo(() => {
    return displayName || username || user?.username || "U";
  }, [displayName, username, user]);

  const resolvedInitials = useMemo(() => {
    return initials || getInitials(resolvedName);
  }, [initials, resolvedName]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!popupRef.current) return;
      if (popupRef.current.contains(event.target)) return;
      setPopup(null);
    }

    if (popup) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [popup]);

  function openLockedPopup({
    title,
    message,
    progressPercent: progress,
    helperText,
  }) {
    setPopup({
      title,
      message,
      progressPercent: progress,
      helperText,
    });
  }

  function handleGardenTap() {
    if (!gardenUnlocked) {
      openLockedPopup({
        title: "Garden Locked",
        message: "Complete more daily activity to unlock Garden.",
        progressPercent: 0,
        helperText: "Keep building consistency.",
      });
      return;
    }

    setPopup(null);

    if (typeof onGardenClick === "function") {
      onGardenClick();
    }
  }

  function handleLearnTap() {
    if (!learnUnlocked) {
      openLockedPopup({
        title: "Learn Locked",
        message: "Complete more progress to unlock Learn.",
        progressPercent: 0,
        helperText: "Modules will appear here.",
      });
      return;
    }

    setPopup(null);

    if (typeof onLearnClick === "function") {
      onLearnClick();
      return;
    }

    if (typeof onLearnOpen === "function") {
      onLearnOpen();
    }
  }

  function handleStreamTap() {
    if (!streamUnlocked) {
      openLockedPopup({
        title: "Stream Locked",
        message: "Complete more progress to unlock Stream.",
        progressPercent: 0,
        helperText: "Audio and playlists will appear here.",
      });
      return;
    }

    setPopup(null);

    if (typeof onStreamClick === "function") {
      onStreamClick();
      return;
    }

    if (typeof onStreamOpen === "function") {
      onStreamOpen();
    }
  }

  function handleBadgeTap() {
    if (!badgeVisibilityUnlocked) {
      openLockedPopup({
        title: "Badges Locked",
        message: "Complete more progress to unlock Badges.",
        progressPercent: 0,
        helperText: "Your progression will appear here.",
      });
      return;
    }

    setPopup(null);

    if (typeof onBadgeClick === "function") {
      onBadgeClick();
    }
  }

  function handleAdminOpen() {
    setAccountOpen(false);
    setAdminOpen(true);

    if (typeof onAdminTrigger === "function") {
      onAdminTrigger();
    }
  }

  return (
    <>
      <header className="relative w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-3 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="min-w-0 flex-1">
            <ProgressBar percent={progressPercent} />
          </div>

          <div
            ref={popupRef}
            className="relative flex shrink-0 items-center gap-1"
          >
            <HeaderIconButton
              label="Garden"
              unlocked={gardenUnlocked}
              onClick={handleGardenTap}
              icon={<Sprout size={15} />}
            />

            <HeaderIconButton
              label="Learn"
              unlocked={learnUnlocked}
              onClick={handleLearnTap}
              icon={<BookOpen size={15} />}
            />

            <HeaderIconButton
              label="Stream"
              unlocked={streamUnlocked}
              onClick={handleStreamTap}
              icon={<Play size={15} />}
            />

            <HeaderIconButton
              label="Badges"
              unlocked={badgeVisibilityUnlocked}
              onClick={handleBadgeTap}
              icon={<Award size={15} />}
            />

            <HeaderPopup popup={popup} onClose={() => setPopup(null)} />
          </div>

          <div className="shrink-0 whitespace-nowrap text-sm font-bold text-white">
            zPts: {formatNumber(zptsBalance)}
          </div>

          <button
            type="button"
            onClick={() => setAccountOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-xs font-bold text-white shadow-[0_0_12px_rgba(34,211,238,0.15)]"
            aria-label="Open account drawer"
          >
            {resolvedInitials}
          </button>
        </div>
      </header>

      <AccountDrawer open={accountOpen} onOpenChange={setAccountOpen}>
        <AccountPanelContentV1
          onClose={() => setAccountOpen(false)}
          onAdminTrigger={handleAdminOpen}
          onLearnOpen={onLearnOpen}
          onStreamOpen={onStreamOpen}
          onOpenFAQ={onOpenFAQ}
          onOpenContact={onOpenContact}
          onOpenAbout={onOpenAbout}
          onOpenSupportChat={onOpenSupportChat}
          learnUnlocked={learnUnlocked}
          streamUnlocked={streamUnlocked}
          user={user}
          authUser={authUser}
          username={username}
          subtext={subtext}
          initials={resolvedInitials}
          tier={tier}
          zptsBalance={zptsBalance}
          zwapBalance={zwapBalance}
          walletAddress={walletAddress}
          inventoryItems={inventoryItems}
          achievements={achievements}
          trophyCount={trophyCount}
          trophyBonusPercent={trophyBonusPercent}
        />
      </AccountDrawer>

      <AdminPanelV1
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onLogout={() => setAdminOpen(false)}
        dashboardData={null}
        onRefresh={() => {}}
      />
    </>
  );
}