import React, { useState } from "react";
import { Footprints, Activity, Flame, Timer } from "lucide-react";

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

export default function DashboardWindowMove({
  sessionSteps = 0,
  calories = 0,
  timerSeconds = 0,
  isActive = false,
  onToggleMove,
  className = "",
}) {
  const [panelIndex, setPanelIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    setTouchStartX(touch.clientX);
  };

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch || touchStartX === null) return;

    const diff = touch.clientX - touchStartX;

    if (Math.abs(diff) >= 35) {
      if (diff < 0) setPanelIndex(1);
      if (diff > 0) setPanelIndex(0);
    }

    setTouchStartX(null);
  };

  const handleToggleMove = (event) => {
    event.stopPropagation();

    if (typeof onToggleMove === "function") {
      onToggleMove();
    }
  };

  return (
    <section
      className={[
        "relative w-full overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.11),transparent_38%),linear-gradient(180deg,rgba(12,18,26,0.96),rgba(6,10,16,0.98))] p-4 text-left shadow-[0_14px_34px_rgba(0,0,0,0.26)]",
        isActive
          ? "border-cyan-300/30 shadow-[0_0_30px_rgba(34,211,238,0.16)]"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-8 top-0 h-16 rounded-full bg-cyan-400/10 blur-2xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center gap-2">
          <div
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
              isActive
                ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-200"
                : "border-cyan-300/18 bg-cyan-300/8 text-cyan-200/80",
            ].join(" ")}
          >
            <Footprints className="h-[17px] w-[17px]" strokeWidth={2.1} />
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/82">
            MOVE
          </div>
        </div>

        <div className="relative flex flex-1 overflow-hidden">
          <div
            className="flex w-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${panelIndex * 100}%)` }}
          >
            <div className="flex min-w-full items-center justify-center">
              <button
                type="button"
                onClick={handleToggleMove}
                className={[
                  "relative flex h-[132px] w-[132px] items-center justify-center rounded-full transition active:scale-[0.98]",
                  "before:absolute before:inset-0 before:rounded-full before:bg-[conic-gradient(from_0deg,rgba(34,211,238,0.08),rgba(34,211,238,0.7),rgba(168,85,247,0.45),rgba(34,211,238,0.08))]",
                  "after:absolute after:inset-[8px] after:rounded-full after:bg-[linear-gradient(180deg,rgba(8,18,28,0.98),rgba(3,8,14,0.98))]",
                  isActive
                    ? "shadow-[0_0_36px_rgba(34,211,238,0.34)] animate-pulse"
                    : "shadow-[0_0_22px_rgba(34,211,238,0.13)]",
                ].join(" ")}
                aria-label={isActive ? "Stop Move" : "Start Move"}
              >
                <span
                  className={[
                    "absolute inset-[18px] rounded-full border",
                    isActive
                      ? "border-cyan-200/55 shadow-[inset_0_0_22px_rgba(34,211,238,0.22),0_0_24px_rgba(34,211,238,0.24)]"
                      : "border-cyan-200/24 shadow-[inset_0_0_18px_rgba(34,211,238,0.10)]",
                  ].join(" ")}
                />

                <span
                  className={[
                    "relative z-10 h-[42px] w-[42px] rounded-full",
                    isActive
                      ? "bg-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.72)]"
                      : "bg-cyan-200/18 shadow-[0_0_18px_rgba(34,211,238,0.22)]",
                  ].join(" ")}
                />
              </button>
            </div>

            <div className="flex min-w-full flex-col justify-center space-y-3">
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
    </section>
  );
}