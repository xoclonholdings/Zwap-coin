import React, { useMemo } from "react";
import { Gamepad2, ChevronRight } from "lucide-react";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function buildStatusLine({ isActive, gamesPlayedToday, playGoal, progress }) {
  if (isActive) {
    return "In session";
  }

  if (progress >= 1) {
    return "Goal reached";
  }

  if (Number(gamesPlayedToday || 0) > 0) {
    return `${gamesPlayedToday} of ${playGoal} today`;
  }

  return "Ready";
}

export default function DashboardWindowPlay({
  gamesPlayedToday = 0,
  playGoal = 3,
  isActive = false,
  progressPercent,
  onOpenPlay,
  className = "",
}) {
  const safeGoal = Math.max(1, Number(playGoal || 1));

  const progress = useMemo(() => {
    if (typeof progressPercent === "number") {
      return clamp(progressPercent / 100);
    }

    return clamp(Number(gamesPlayedToday || 0) / safeGoal);
  }, [progressPercent, gamesPlayedToday, safeGoal]);

  const statusLine = useMemo(() => {
    return buildStatusLine({
      isActive,
      gamesPlayedToday,
      playGoal: safeGoal,
      progress,
    });
  }, [isActive, gamesPlayedToday, safeGoal, progress]);

  return (
    <button
      type="button"
      onClick={onOpenPlay}
      className={[
        "group relative w-full overflow-hidden rounded-[26px] border p-4 text-left transition active:scale-[0.99]",
        isActive
          ? "border-violet-400/24 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_38%),linear-gradient(180deg,rgba(22,16,38,0.96),rgba(10,8,20,0.98))] shadow-[0_0_28px_rgba(168,85,247,0.12)]"
          : "border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.11),transparent_34%),linear-gradient(180deg,rgba(16,18,30,0.96),rgba(8,10,18,0.98))] shadow-[0_14px_34px_rgba(0,0,0,0.26)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Open Play"
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                  isActive
                    ? "border-violet-400/24 bg-violet-400/12 text-violet-200"
                    : "border-violet-400/18 bg-violet-400/10 text-violet-200"
                }`}
              >
                <Gamepad2 className="h-[17px] w-[17px]" strokeWidth={2.1} />
              </div>

              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                Play
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
              {gamesPlayedToday} / {safeGoal}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 shadow-[0_0_16px_rgba(168,85,247,0.22)]"
                  : "bg-gradient-to-r from-violet-400/90 via-fuchsia-400/90 to-cyan-400/80 shadow-[0_0_12px_rgba(168,85,247,0.14)]"
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
