import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sprout, BookOpen, Play, Award } from "lucide-react";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function formatZpts(value) {
  return Number(value || 0).toLocaleString();
}

function buildInitials(name = "") {
  const safe = String(name || "").trim();
  if (!safe) return "U";

  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function HeaderProgress({ progress = 0 }) {
  const safeProgress = clamp(progress);

  return (
    <div className="min-w-0 flex-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 shadow-[0_0_14px_rgba(34,211,238,0.08)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 shadow-[0_0_14px_rgba(34,211,238,0.22)] transition-all duration-300"
          style={{ width: `${safeProgress * 100}%` }}
        />
      </div>
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
        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition active:scale-[0.96]",
        unlocked
          ? "border-cyan-400/35 bg-cyan-500/12 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.16)]"
          : "border-white/8 bg-white/[0.03] text-white/25",
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
  zptsBalance = 0,
  todaySteps = 0,
  dailyStepGoal = 10000,
  completedTasks = 0,
  totalTasks = 4,
  displayName = "",
  initials,
  isOnline = true,
  onOpenAccount,
  isSticky = true,
  className = "",

  gardenUnlocked = false,
  learnUnlocked = false,
  streamUnlocked = false,
  badgesUnlocked = false,

  gardenProgressPercent = 0,
  learnProgressPercent = 0,
  streamProgressPercent = 0,
  badgesProgressPercent = 0,

  onGardenClick,
  onLearnClick,
  onStreamClick,
  onBadgeClick,
}) {
  const [popup, setPopup] = useState(null);
  const popupRef = useRef(null);

  const safeStepGoal = Math.max(1, Number(dailyStepGoal || 1));
  const safeCompletedTasks = Math.max(0, Number(completedTasks || 0));
  const safeTotalTasks = Math.max(1, Number(totalTasks || 1));

  const moveProgress = useMemo(() => {
    return clamp(Number(todaySteps || 0) / safeStepGoal);
  }, [todaySteps, safeStepGoal]);

  const taskProgress = useMemo(() => {
    return clamp(safeCompletedTasks / safeTotalTasks);
  }, [safeCompletedTasks, safeTotalTasks]);

  const dailyProgress = useMemo(() => {
    return clamp((moveProgress + taskProgress) / 2);
  }, [moveProgress, taskProgress]);

  const accountInitials = useMemo(() => {
    return initials || buildInitials(displayName);
  }, [initials, displayName]);

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

  function openLockedPopup({ title, message, progressPercent, helperText }) {
    setPopup({
      title,
      message,
      progressPercent,
      helperText,
    });
  }

  function handleGardenTap() {
    if (!gardenUnlocked) {
      openLockedPopup({
        title: "Garden Locked",
        message: "Complete more daily activity to unlock Garden.",
        progressPercent: gardenProgressPercent,
        helperText: "Keep building consistency.",
      });
      return;
    }

    setPopup(null);
    if (onGardenClick) onGardenClick();
  }

  function handleLearnTap() {
    if (!learnUnlocked) {
      openLockedPopup({
        title: "Learn Locked",
        message: "Complete more progress to unlock Learn.",
        progressPercent: learnProgressPercent,
        helperText: "Modules will appear here.",
      });
      return;
    }

    setPopup(null);
    if (onLearnClick) onLearnClick();
  }

  function handleStreamTap() {
    if (!streamUnlocked) {
      openLockedPopup({
        title: "Stream Locked",
        message: "Complete more progress to unlock Stream.",
        progressPercent: streamProgressPercent,
        helperText: "Audio and playlists will appear here.",
      });
      return;
    }

    setPopup(null);
    if (onStreamClick) onStreamClick();
  }

  function handleBadgeTap() {
    if (!badgesUnlocked) {
      openLockedPopup({
        title: "Badges Locked",
        message: "Complete more progress to unlock Badges.",
        progressPercent: badgesProgressPercent,
        helperText: "Your progression will appear here.",
      });
      return;
    }

    setPopup(null);
    if (onBadgeClick) onBadgeClick();
  }

  return (
    <div
      className={[
        isSticky ? "sticky top-0 z-30" : "",
        "w-full px-3 pt-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex h-[72px] items-center gap-2 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,26,0.94),rgba(5,10,16,0.96))] px-3 shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <HeaderProgress progress={dailyProgress} />

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
            unlocked={badgesUnlocked}
            onClick={handleBadgeTap}
            icon={<Award size={15} />}
          />

          <HeaderPopup popup={popup} onClose={() => setPopup(null)} />
        </div>

        <div className="shrink-0 whitespace-nowrap text-center">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/42">
            zPts
          </div>
          <div className="mt-1 text-[1rem] font-semibold tracking-[-0.04em] text-cyan-300">
            {formatZpts(zptsBalance)}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAccount}
          className="relative ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-400/18 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_42%),linear-gradient(180deg,rgba(15,28,38,0.96),rgba(8,14,20,0.98))] text-sm font-semibold tracking-[0.02em] text-white shadow-[0_0_18px_rgba(34,211,238,0.10)] transition active:scale-[0.97]"
          aria-label="Open account"
        >
          {accountInitials}

          {isOnline ? (
            <span className="absolute bottom-[2px] right-[2px] h-2.5 w-2.5 rounded-full border border-[#081018] bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.55)]" />
          ) : null}
        </button>
      </div>
    </div>
  );
}