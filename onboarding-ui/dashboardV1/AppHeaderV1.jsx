import React, { useMemo } from "react";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function formatCompactSteps(value) {
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

function CompactProgress({
  label,
  valueText,
  progress = 0,
  glowClassName = "",
  fillClassName = "",
}) {
  const safeProgress = clamp(progress);

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-white/42">
          {label}
        </span>
        <span className="shrink-0 text-[11px] font-medium tracking-[-0.02em] text-white/70">
          {valueText}
        </span>
      </div>

      <div
        className={`h-1.5 overflow-hidden rounded-full bg-white/8 ${glowClassName}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${fillClassName}`}
          style={{ width: `${safeProgress * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function AppHeaderV1({
  zptsBalance = 0,
  todaySteps = 0,
  dailyStepGoal = 10000,
  completedTasks = 0,
  totalTasks = 4,
  displayName = "Zwapper",
  initials,
  isOnline = true,
  onOpenAccount,
  isSticky = true,
  className = "",
}) {
  const safeStepGoal = Math.max(1, Number(dailyStepGoal || 1));
  const safeCompletedTasks = Math.max(0, Number(completedTasks || 0));
  const safeTotalTasks = Math.max(1, Number(totalTasks || 1));

  const moveProgress = useMemo(() => {
    return clamp(Number(todaySteps || 0) / safeStepGoal);
  }, [todaySteps, safeStepGoal]);

  const taskProgress = useMemo(() => {
    return clamp(safeCompletedTasks / safeTotalTasks);
  }, [safeCompletedTasks, safeTotalTasks]);

  const accountInitials = useMemo(() => {
    return initials || buildInitials(displayName);
  }, [initials, displayName]);

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
        <div className="min-w-0 flex-[1.05]">
          <CompactProgress
            label="Move"
            valueText={`${formatCompactSteps(todaySteps)} / ${formatCompactSteps(
              dailyStepGoal
            )}`}
            progress={moveProgress}
            glowClassName="shadow-[0_0_14px_rgba(34,211,238,0.08)]"
            fillClassName="bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 shadow-[0_0_14px_rgba(34,211,238,0.22)]"
          />
        </div>

        <div className="h-9 w-px shrink-0 bg-white/8" />

        <div className="min-w-0 flex-[0.95]">
          <CompactProgress
            label="Today"
            valueText={`${safeCompletedTasks}/${safeTotalTasks}`}
            progress={taskProgress}
            glowClassName="shadow-[0_0_14px_rgba(168,85,247,0.07)]"
            fillClassName="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 shadow-[0_0_14px_rgba(168,85,247,0.16)]"
          />
        </div>

        <div className="h-9 w-px shrink-0 bg-white/8" />

        <div className="shrink-0 text-center">
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
