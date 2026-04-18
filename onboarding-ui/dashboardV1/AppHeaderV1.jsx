import React, { useMemo, useState } from "react";
import AccountDrawerV1 from "./account/AccountDrawerV1";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function formatCompactNumber(value) {
  const safe = Number(value || 0);

  if (safe >= 1000000) {
    return `${(safe / 1000000).toFixed(1).replace(".0", "")}m`;
  }

  if (safe >= 1000) {
    return `${(safe / 1000).toFixed(1).replace(".0", "")}k`;
  }

  return `${safe}`;
}

function formatZpts(value) {
  return Number(value || 0).toLocaleString();
}

function buildInitials(name = "") {
  const safe = String(name || "").trim();
  if (!safe) return "Z";

  const parts = safe.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function resolveDayProgress({
  todaySteps = 0,
  dailyStepGoal = 10000,
  completedTasks = 0,
  totalTasks = 4,
  streamMinutesToday = 0,
  streamDailyGoalMinutes = 20,
  streamUnlocked = false,
}) {
  const moveRatio = clamp(
    Number(todaySteps || 0) / Math.max(1, Number(dailyStepGoal || 1))
  );
  const taskRatio = clamp(
    Number(completedTasks || 0) / Math.max(1, Number(totalTasks || 1))
  );

  if (!streamUnlocked) {
    const blended = clamp(moveRatio * 0.7 + taskRatio * 0.3);

    return {
      label: "Day",
      progress: blended,
      valueText: `${formatCompactNumber(todaySteps)} steps • ${completedTasks}/${totalTasks}`,
      fillClassName:
        "bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 shadow-[0_0_16px_rgba(34,211,238,0.24)]",
      glowClassName: "shadow-[0_0_14px_rgba(34,211,238,0.08)]",
    };
  }

  const streamRatio = clamp(
    Number(streamMinutesToday || 0) /
      Math.max(1, Number(streamDailyGoalMinutes || 1))
  );

  const blended = clamp(
    moveRatio * 0.5 + taskRatio * 0.25 + streamRatio * 0.25
  );

  return {
    label: "Day",
    progress: blended,
    valueText: `${formatCompactNumber(todaySteps)} steps • ${completedTasks}/${totalTasks} • ${streamMinutesToday}m`,
    fillClassName:
      "bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 shadow-[0_0_16px_rgba(168,85,247,0.22)]",
    glowClassName: "shadow-[0_0_14px_rgba(168,85,247,0.08)]",
  };
}

function resolveStatusPill({
  shopUnlocked = false,
  gardenUnlocked = false,
  badgeVisibilityUnlocked = false,
  learnUnlocked = false,
  streamUnlocked = false,
  isListening = false,
  activeAudioTitle = "",
  streamMinutesToday = 0,
}) {
  if (isListening) {
    return {
      label: activeAudioTitle ? "Listening Now" : "Listening",
      detail: activeAudioTitle || `${streamMinutesToday} min today`,
      tone:
        "border-fuchsia-400/20 bg-[linear-gradient(180deg,rgba(70,16,82,0.34),rgba(16,10,28,0.78))] text-fuchsia-200 shadow-[0_0_16px_rgba(217,70,239,0.14)]",
      pulse: true,
    };
  }

  if (streamUnlocked) {
    return {
      label: "Stream Ready",
      detail: streamMinutesToday > 0 ? `${streamMinutesToday} min today` : "audio unlocked",
      tone:
        "border-violet-400/18 bg-[linear-gradient(180deg,rgba(67,56,202,0.20),rgba(10,12,24,0.78))] text-violet-200 shadow-[0_0_16px_rgba(139,92,246,0.14)]",
      pulse: false,
    };
  }

  if (learnUnlocked) {
    return {
      label: "Learn Open",
      detail: "Stream comes next",
      tone:
        "border-cyan-400/18 bg-[linear-gradient(180deg,rgba(8,65,84,0.26),rgba(6,14,20,0.80))] text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.10)]",
      pulse: false,
    };
  }

  if (badgeVisibilityUnlocked) {
    return {
      label: "Identity Rising",
      detail: "badges visible",
      tone:
        "border-amber-400/16 bg-[linear-gradient(180deg,rgba(96,52,12,0.24),rgba(18,12,8,0.78))] text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.10)]",
      pulse: false,
    };
  }

  if (gardenUnlocked) {
    return {
      label: "Garden Growing",
      detail: "consistency layer",
      tone:
        "border-emerald-400/16 bg-[linear-gradient(180deg,rgba(8,70,48,0.24),rgba(7,14,10,0.80))] text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.10)]",
      pulse: false,
    };
  }

  if (shopUnlocked) {
    return {
      label: "Shop Open",
      detail: "value sink unlocked",
      tone:
        "border-cyan-400/16 bg-[linear-gradient(180deg,rgba(8,38,58,0.24),rgba(7,12,18,0.80))] text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.10)]",
      pulse: false,
    };
  }

  return {
    label: "Shop Locked",
    detail: "reach 1,000 zPts",
    tone:
      "border-white/10 bg-[linear-gradient(180deg,rgba(18,22,28,0.92),rgba(8,10,14,0.96))] text-white/72 shadow-[0_0_14px_rgba(255,255,255,0.03)]",
    pulse: false,
  };
}

function ProgressLane({
  label,
  valueText,
  progress = 0,
  glowClassName = "",
  fillClassName = "",
}) {
  const safeProgress = clamp(progress);

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-white/42">
          {label}
        </span>

        <span className="shrink-0 text-[11px] font-medium tracking-[-0.02em] text-white/70">
          {valueText}
        </span>
      </div>

      <div
        className={`h-2 overflow-hidden rounded-full bg-white/8 ${glowClassName}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${fillClassName}`}
          style={{ width: `${safeProgress * 100}%` }}
        />
      </div>
    </div>
  );
}

function StatusPill({ label, detail, tone, pulse = false }) {
  return (
    <div
      className={[
        "min-w-0 rounded-[14px] border px-2.5 py-2",
        tone,
      ].join(" ")}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={[
            "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
            pulse
              ? "bg-fuchsia-300 shadow-[0_0_10px_rgba(232,121,249,0.8)]"
              : "bg-white/45",
          ].join(" ")}
        />
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>

      <div className="mt-1 truncate text-[11px] tracking-[-0.02em] opacity-80">
        {detail}
      </div>
    </div>
  );
}

export default function AppHeaderV1({
  zptsBalance = 0,
  zwapBalance = 0,
  todaySteps = 0,
  dailyStepGoal = 10000,
  completedTasks = 0,
  totalTasks = 4,
  displayName = "Zwapper",
  username = "",
  initials,
  isOnline = true,
  isSticky = true,
  className = "",

  user,
  authUser,
  subtext = "",
  tier = "zwapper",
  walletAddress = "",

  inventoryItems = [],
  achievements = [],
  trophyCount = 0,
  trophyBonusPercent = 0,

  shopUnlocked = false,
  gardenUnlocked = false,
  badgeVisibilityUnlocked = false,
  learnUnlocked = false,
  streamUnlocked = false,

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
}) {
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);

  const accountInitials = useMemo(() => {
    return initials || buildInitials(displayName || username || "Zwapper");
  }, [initials, displayName, username]);

  const progressModel = useMemo(() => {
    return resolveDayProgress({
      todaySteps,
      dailyStepGoal,
      completedTasks,
      totalTasks,
      streamMinutesToday,
      streamDailyGoalMinutes,
      streamUnlocked,
    });
  }, [
    todaySteps,
    dailyStepGoal,
    completedTasks,
    totalTasks,
    streamMinutesToday,
    streamDailyGoalMinutes,
    streamUnlocked,
  ]);

  const statusModel = useMemo(() => {
    return resolveStatusPill({
      shopUnlocked,
      gardenUnlocked,
      badgeVisibilityUnlocked,
      learnUnlocked,
      streamUnlocked,
      isListening,
      activeAudioTitle,
      streamMinutesToday,
    });
  }, [
    shopUnlocked,
    gardenUnlocked,
    badgeVisibilityUnlocked,
    learnUnlocked,
    streamUnlocked,
    isListening,
    activeAudioTitle,
    streamMinutesToday,
  ]);

  return (
    <>
      <div
        className={[
          isSticky ? "sticky top-0 z-30" : "",
          "w-full px-3 pt-3",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,26,0.94),rgba(5,10,16,0.97))] px-3 py-3 shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <ProgressLane
                label={progressModel.label}
                valueText={progressModel.valueText}
                progress={progressModel.progress}
                glowClassName={progressModel.glowClassName}
                fillClassName={progressModel.fillClassName}
              />

              <div className="mt-2.5">
                <StatusPill
                  label={statusModel.label}
                  detail={statusModel.detail}
                  tone={statusModel.tone}
                  pulse={statusModel.pulse}
                />
              </div>
            </div>

            <div className="shrink-0 pt-0.5 text-center">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/42">
                zPts
              </div>
              <div className="mt-1 text-[1rem] font-semibold tracking-[-0.04em] text-cyan-300">
                {formatZpts(zptsBalance)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAccountDrawerOpen(true)}
              className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-400/18 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_42%),linear-gradient(180deg,rgba(15,28,38,0.96),rgba(8,14,20,0.98))] text-sm font-semibold tracking-[0.02em] text-white shadow-[0_0_18px_rgba(34,211,238,0.10)] transition active:scale-[0.97]"
              aria-label="Open account"
            >
              {accountInitials}

              {isOnline ? (
                <span className="absolute bottom-[2px] right-[2px] h-2.5 w-2.5 rounded-full border border-[#081018] bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.55)]" />
              ) : null}
            </button>
          </div>
        </div>
      </div>

      <AccountDrawerV1
        open={accountDrawerOpen}
        onOpenChange={setAccountDrawerOpen}
        user={user}
        authUser={authUser}
        displayName={displayName}
        username={username}
        subtext={subtext}
        initials={initials}
        tier={tier}
        zptsBalance={zptsBalance}
        zwapBalance={zwapBalance}
        walletAddress={walletAddress}
        inventoryItems={inventoryItems}
        achievements={achievements}
        trophyCount={trophyCount}
        trophyBonusPercent={trophyBonusPercent}
        learnUnlocked={learnUnlocked}
        streamUnlocked={streamUnlocked}
        onAdminTrigger={onAdminTrigger}
        onLearnOpen={onLearnOpen}
        onStreamOpen={onStreamOpen}
        onOpenFAQ={onOpenFAQ}
        onOpenContact={onOpenContact}
        onOpenAbout={onOpenAbout}
        onOpenSupportChat={onOpenSupportChat}
      />
    </>
  );
}