import React, { useMemo, useState } from "react";
import { Footprints, Timer, Flame, Activity } from "lucide-react";

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
  steps,
  stepGoal = 10000,
  sessionSteps = 0,
  calories = 0,
  timerSeconds = 0,
  isActive = false,
  progressPercent,
  stepsPercent,
  onOpenMove,
  className = "",
}) {
  const [panelIndex, setPanelIndex] = useState(0);

  const resolvedSteps = Number(steps ?? todaySteps ?? 0);
  const resolvedPercent = progressPercent ?? stepsPercent;
  const safeGoal = Math.max(1, Number(stepGoal || 1));

  const progress = useMemo(() => {
    if (typeof resolvedPercent === "number") {
      return clamp(resolvedPercent / 100);
    }

    return clamp(resolvedSteps / safeGoal);
  }, [resolvedPercent, resolvedSteps, safeGoal]);

  const progressDegrees = Math.round(progress * 360);
  const progressText = Math.round(progress * 100);

  const statusLine = useMemo(() => {
    return buildStatusLine({
      isActive,
      todaySteps: resolvedSteps,
      stepGoal: safeGoal,
      progress,
    });
  }, [isActive, resolvedSteps, safeGoal, progress]);

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
        "group relative h-full w-full overflow-hidden rounded-[28px] border text-left active:scale-[0.99]",
        isActive
          ? "border-cyan-300/28 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),transparent_44%),linear-gradient(180deg,rgba(10,25,35,0.97),rgba(4,12,18,0.99))] shadow-[0_0_34px_rgba(34,211,238,0.16)]"
          : "border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.13),transparent_42%),linear-gradient(180deg,rgba(12,18,26,0.97),rgba(5,9,15,0.99))] shadow-[0_16px_38px_rgba(0,0,0,0.30)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Open Move"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-5 top-0 h-16 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),transparent_34%,rgba(34,211,238,0.045))]" />
      </div>

      <div className="relative z-10 flex h-full flex-col p-3">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <Footprints className="h-4 w-4" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/88">
                Move
              </div>
              <div className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-100/46">
                {showStats ? "Stats" : statusLine}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-1">
            <span
              className={`h-1.5 rounded-full transition-all ${
                !showStats ? "w-4 bg-cyan-300" : "w-1.5 bg-white/24"
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all ${
                showStats ? "w-4 bg-cyan-300" : "w-1.5 bg-white/24"
              }`}
            />
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${panelIndex * 100}%)` }}
          >
            <div className="flex min-w-full flex-col items-center justify-center px-1 py-2">
              <div
                className="relative flex aspect-square w-[min(78%,142px)] max-w-[142px] items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(rgba(34,211,238,0.98) ${progressDegrees}deg, rgba(255,255,255,0.08) 0deg)`,
                  boxShadow: isActive
                    ? "0 0 30px rgba(34,211,238,0.24)"
                    : "0 0 22px rgba(34,211,238,0.14)",
                }}
              >
                <div className="absolute inset-[7px] rounded-full bg-[linear-gradient(180deg,rgba(10,18,27,0.99),rgba(4,9,15,0.99))]" />

                <div className="relative z-10 text-center">
                  <div className="text-[clamp(24px,7vw,34px)] font-black leading-none tracking-[-0.07em] text-white">
                    {formatCompactSteps(resolvedSteps)}
                  </div>

                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200/72">
                    Steps
                  </div>

                  <div className="mt-1 text-[10px] font-semibold text-white/42">
                    {progressText}%
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-w-full flex-col justify-center gap-2 px-1 py-2">
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
                <div className="flex items-center gap-2 text-white/52">
                  <Activity className="h-4 w-4 text-cyan-200/70" />
                  <span className="text-[10px] font-black uppercase tracking-[0.13em]">
                    Session
                  </span>
                </div>

                <div className="text-sm font-black text-white">
                  {formatCompactSteps(sessionSteps)}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
                <div className="flex items-center gap-2 text-white/52">
                  <Flame className="h-4 w-4 text-cyan-200/70" />
                  <span className="text-[10px] font-black uppercase tracking-[0.13em]">
                    Calories
                  </span>
                </div>

                <div className="text-sm font-black text-white">
                  {Number(calories || 0)}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
                <div className="flex items-center gap-2 text-white/52">
                  <Timer className="h-4 w-4 text-cyan-200/70" />
                  <span className="text-[10px] font-black uppercase tracking-[0.13em]">
                    Timer
                  </span>
                </div>

                <div className="text-sm font-black text-white">
                  {formatTime(timerSeconds)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 text-center text-[10px] font-black uppercase tracking-[0.16em] text-white/34">
          {showStats ? "Swipe for Today" : "Swipe for Stats"}
        </div>
      </div>
    </button>
  );
}