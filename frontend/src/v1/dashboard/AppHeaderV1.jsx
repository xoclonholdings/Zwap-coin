import React, { useMemo, useState } from "react";
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
  if (!safe) return "ZW";

  const parts = safe.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function HeaderIconButton({ label, icon, unlocked = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition active:scale-[0.96]",
        unlocked
          ? "border-cyan-300/40 bg-cyan-400/12 text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.16)]"
          : "border-white/10 bg-white/[0.035] text-white/34",
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
    <div className="absolute left-0 top-[calc(100%+10px)] z-40 w-[220px] rounded-2xl border border-white/10 bg-[#08111d]/95 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.48)] backdrop-blur-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
        {popup.title}
      </div>

      <div className="mt-1 text-[12px] leading-5 text-white/75">
        {popup.message}
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/45">
          <span>Progress</span>
          <span>{safePercent}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300"
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
        className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200/80"
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

  user,
  username = "",
  initials = "",
  isOnline = true,

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
  onOpenAccount,

  className = "",
}) {
  const [popup, setPopup] = useState(null);

  const resolvedUsername = user?.username || username || "";
  const accountInitials = initials || buildInitials(resolvedUsername);

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
        helperText: "Consistency opens this layer.",
      });
      return;
    }

    setPopup(null);
    onGardenClick?.();
  }

  function handleLearnTap() {
    if (!learnUnlocked) {
      openLockedPopup({
        title: "Learn Locked",
        message: "Build more progress to unlock Learn.",
        progressPercent: learnProgressPercent,
        helperText: "Modules will appear here.",
      });
      return;
    }

    setPopup(null);
    onLearnClick?.();
  }

  function handleStreamTap() {
    if (!streamUnlocked) {
      openLockedPopup({
        title: "Stream Locked",
        message: "Keep progressing to unlock Stream.",
        progressPercent: streamProgressPercent,
        helperText: "Audio and playlists will appear here.",
      });
      return;
    }

    setPopup(null);
    onStreamClick?.();
  }

  function handleBadgeTap() {
    if (!badgesUnlocked) {
      openLockedPopup({
        title: "Badges Locked",
        message: "Complete more loops to unlock Badges.",
        progressPercent: badgesProgressPercent,
        helperText: "Identity unlocks through action.",
      });
      return;
    }

    setPopup(null);
    onBadgeClick?.();
  }

  return (
    <header
      className={[
        "relative w-full overflow-visible rounded-[24px] border border-cyan-200/12 bg-[linear-gradient(180deg,rgba(12,22,32,0.95),rgba(5,10,18,0.98))] px-2.5 py-2 shadow-[0_14px_38px_rgba(0,0,0,0.32),0_0_34px_rgba(34,211,238,0.055)] backdrop-blur-xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex h-[48px] items-center gap-1.5">
        <div className="min-w-[34px] flex-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.03)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-violet-300 shadow-[0_0_18px_rgba(34,211,238,0.24)]"
              style={{ width: `${dailyProgress * 100}%` }}
            />
          </div>
        </div>

        <div className="relative flex shrink-0 items-center gap-1">
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

        <div className="w-[48px] shrink-0 text-center">
          <div className="text-[8px] font-black uppercase tracking-[0.12em] text-white/42">
            zPts
          </div>
          <div className="mt-0.5 truncate text-[0.94rem] font-black leading-none tracking-[-0.05em] text-cyan-200">
            {formatZpts(zptsBalance)}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAccount}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_44%),linear-gradient(180deg,rgba(15,28,38,0.96),rgba(7,13,20,0.98))] text-[11px] font-black tracking-[0.02em] text-white shadow-[0_0_22px_rgba(34,211,238,0.12)] active:scale-[0.97]"
          aria-label="Open account"
        >
          {accountInitials}

          {isOnline ? (
            <span className="absolute bottom-[2px] right-[2px] h-2.5 w-2.5 rounded-full border border-[#081018] bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.55)]" />
          ) : null}
        </button>
      </div>
    </header>
  );
}