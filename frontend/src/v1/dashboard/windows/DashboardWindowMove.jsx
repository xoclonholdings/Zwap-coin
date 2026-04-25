import React, { useMemo, useState } from "react";
import { Footprints, ChevronRight, Timer, Flame, Activity } from "lucide-react";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(Number(value || 0), min), max);
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

function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function buildStatusLine({ isActive, todaySteps, stepGoal, progress }) {
  if (isActive) return "Active now";
  if (progress >= 1) return "Goal reached";
  if (Number(todaySteps || 0) > 0) {
    return `${formatCompactSteps(todaySteps)} of ${formatCompactSteps(stepGoal)}`;
  }

  return "Idle";
}

export default function DashboardWindowMove({
  todaySteps = 0,
  stepGoal = 10000,
  sessionSteps = 0,
  calories = 0,
  timerSeconds = 0,
  isActive = false,
  progressPercent,
  onOpenMove,
  className = "",
}) {
  const [panelIndex, setPanelIndex] = useState(0);

  const safeGoal = Math.max(1, Number(stepGoal || 1));

  const progress = useMemo(() => {
    if (typeof progressPercent === "number") {
      return clamp(progressPercent / 100);
    }

    return clamp(Number(todaySteps || 0) / safeGoal);
  }, [progressPercent, todaySteps, safeGoal]);

  const progressDegrees = Math.round(progress * 360);
  const progressText = Math.round(progress * 100);

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

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    event.currentTarget.dataset.touchStartX = String(touch.clientX);
  };

  const handleTouchEnd = (event) => {
    const startX = Number(event.currentTarget.dataset.touchStartX || 0);
    const touch = event.changedTouches?.[0];
    if (!touch || !startX) return;

    const diff = touch.clientX - startX;

    if (Math.abs(diff) < 35) return;

    if (diff < 0) {
      setPanelIndex(1);
    } else {
      setPanelIndex(0);
    }
  };

  const showStats = panelIndex === 1;

  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={[
        "group relative w-full overflow-hidden rounded-[26px] border p-4 text-left transition active:scale-[0.99]",
        isActive
          ? "border-cyan-400/24 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_42%),linear-gradient(180deg,rgba(10,25,35,0.96),rgba(5,15,20,0.98))] shadow-[0_0_30px_rgba(34,211,238,0.14)]"
          : "border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.11),transparent_38%),linear-gradient(180deg,rgba(12,18,26,0.96),rgba(6,10,16,0.98))] shadow-[0_14px_34px_rgba(0,0,0,0.26)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Open Move"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute inset-x-8 top-0 h-16 rounded-full bg-cyan-400/10 blur-2xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
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

          <div className="mt-0.5 shrink-0 text-white/32 transition group-hover:text-white/56">
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.1} />
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${panelIndex * 100}%)` }}
          >
            <div className="flex min-w-full flex-col items-center justify-center">
              <div
                className="relative flex h-[116px] w-[116px] items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(rgba(34,211,238,0.95) ${progressDegrees}deg, rgba(255,255,255,0.08) 0deg)`,
                  boxShadow: isActive
                    ? "0 0 26px rgba(34,211,238,0.22)"
                    : "0 0 18px rgba(34,211,238,0.12)",
                }}
              >
                <div className="absolute inset-[7px] rounded-full bg-[linear-gradient(180deg,rgba(10,18,27,0.98),rgba(4,9,15,0.98))]" />

                <div className="relative z-10 text-center">
                  <div className="text-[24px] font-black tracking-[-0.06em] text-white">
                    {formatCompactSteps(todaySteps)}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                    Steps
                  </div>
                  <div className="mt-1 text-[10px] font-medium text-white/42">
                    {progressText}%
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center text-sm font-medium tracking-[-0.02em] text-white/72">
                {statusLine}
              </div>
            </div>

            <div className="flex min-w-full flex-col justify-center">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
                  <div className="flex items-center gap-2 text-white/52">
                    <Activity className="h-4 w-4 text-cyan-200/70" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                      Session
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {formatCompactSteps(sessionSteps)}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
                  <div className="flex items-center gap-2 text-white/52">
                    <Flame className="h-4 w-4 text-cyan-200/70" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                      Calories
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {Number(calories || 0)}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
                  <div className="flex items-center gap-2 text-white/52">
                    <Timer className="h-4 w-4 text-cyan-200/70" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                      Timer
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {formatTime(timerSeconds)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            <span
              className={`h-1.5 rounded-full transition-all ${
                !showStats ? "w-5 bg-cyan-300" : "w-1.5 bg-white/24"
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all ${
                showStats ? "w-5 bg-cyan-300" : "w-1.5 bg-white/24"
              }`}
            />
          </div>

          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/34">
            {showStats ? "Stats" : "Today"}
          </div>
        </div>
      </div>
    </button>
  );
}