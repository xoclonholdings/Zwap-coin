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
  onOpenMove,
  className = "",
}) {
  const [panelIndex, setPanelIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const handleRingClick = (event) => {
    event.stopPropagation();

    if (typeof onOpenMove === "function") {
      onOpenMove();
    }
  };

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (!touch) return;
    setTouchStartX(touch.clientX);
  };

  const handleTouchEnd = (event) => {
    const touch = event.changedTouches?.[0];
    if (!touch || touchStartX === null) return;

    const diff = touch.clientX - touchStartX;

    if (Math.abs(diff) < 35) return;

    if (diff < 0) {
      setPanelIndex(1);
    } else {
      setPanelIndex(0);
    }

    setTouchStartX(null);
  };

  return (
    <section
      className={[
        "relative w-full overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.11),transparent_38%),linear-gradient(180deg,rgba(12,18,26,0.96),rgba(6,10,16,0.98))] p-4 text-left shadow-[0_14px_34px_rgba(0,0,0,0.26)]",
        isActive
          ? "border-cyan-400/24 shadow-[0_0_30px_rgba(34,211,238,0.14)]"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center gap-2">
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
                onClick={handleRingClick}
                className={[
                  "relative flex h-[126px] w-[126px] items-center justify-center rounded-full border transition active:scale-[0.98]",
                  isActive
                    ? "border-cyan-300/60 bg-cyan-300/10 shadow-[0_0_34px_rgba(34,211,238,0.28)]"
                    : "border-cyan-200/26 bg-white/[0.03] shadow-[0_0_22px_rgba(34,211,238,0.12)]",
                ].join(" ")}
                aria-label={isActive ? "Stop Move" : "Start Move"}
              >
                <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16),transparent_64%)]" />

                <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
                  {isActive ? "Stop" : "Start"}
                </span>
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