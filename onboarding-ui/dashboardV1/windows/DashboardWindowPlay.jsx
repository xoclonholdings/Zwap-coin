import React, { useMemo } from "react";
import { Footprints, ChevronRight } from "lucide-react";

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

function buildStatusLine({ isActive, todaySteps, stepGoal, progress }) {
  if (isActive) {
    return "Active now";
  }

  if (progress >= 1) {
    return "Goal reached";
  }

  if (Number(todaySteps || 0) > 0) {
    return `${formatCompactSteps(todaySteps)} of ${formatCompactSteps(stepGoal)}`;
  }

  return "Idle";
}

export default function DashboardWindowMove({
  todaySteps = 0,
  stepGoal = 10000,
  isActive = false,
  progressPercent,
  onOpenMove,
  className = "",
}) {
  const safeGoal = Math.max(1, Number(stepGoal || 1));

  const progress = useMemo(() => {
    if (typeof progressPercent === "number") {
      return clamp(progressPercent / 100);
    }

    return clamp(Number(todaySteps || 0) / safeGoal);
  }, [progressPercent, todaySteps, safeGoal]);

  const statusLine = useMemo(() => {
    return buildStatusLine({
      isActive,
      todaySteps,
      stepGoal: safeGoal,
      progress,
    });
  }, [isActive, todaySteps, safeGoal, progress]);

  const handleClick = () => {
    if (typeof onOpenMove === "function") {
      onOpenMove();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "group relative w-full overflow-hidden rounded-[26px] border p-4 text-left transition active:scale-[0.99]",
        isActive
          ? "border-cyan-400/24 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_38%),linear-gradient(180deg,rgba(10,25,35,0.96),rgba(5,15,20,0.98))] shadow-[0_0_28px_rgba(34,211,238,0.12)]"
          : "border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_36%),linear-gradient(180deg,rgba(12,18,26,0.96),rgba(6,10,16,0.98))] shadow-[0_14px_34px_rgba(0,0,0,0.26)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Open Move"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute inset-x-8 top-0 h-16 rounded-full bg-cyan-400/10 blur-2xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                  isActive
                    ? "border-cyan-400/24 bg-cyan-400/12 text-cyan-300"
                    : "border-cyan-400/16 bg-cyan-400/8 text-cyan-200"
                }`}
              >
                <Footprints className="h-[17px] w-[17px]" strokeWidth={2.1} />
              </div>

              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                Move
              </div>
            </div>

            <div className="mt-3 text-sm font-medium tracking-[-0.02em] text-white/72">
              {statusLine}
            </div>
          </div>

          <div className="mt-0.5 shrink-0 text-white/32 transition group-hover:text-white/56">
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.1} />
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium tracking-[-0.02em] text-white/46">
              Today
            </span>
            <span className="text-[11px] font-medium tracking-[-0.02em] text-white/62">
              {formatCompactSteps(todaySteps)} / {formatCompactSteps(safeGoal)}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 shadow-[0_0_16px_rgba(34,211,238,0.22)]"
                  : "bg-gradient-to-r from-cyan-400/90 via-teal-400/90 to-violet-400/80 shadow-[0_0_12px_rgba(34,211,238,0.14)]"
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
