import React, { useState } from "react";
import { Activity, ChevronRight, Flame, Footprints, Timer } from "lucide-react";

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

  const showStats = panelIndex === 1;

  const handleCardClick = () => {
    setPanelIndex((current) => (current === 0 ? 1 : 0));
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

    if (Math.abs(diff) >= 36) {
      setPanelIndex(diff < 0 ? 1 : 0);
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
        "relative w-full overflow-hidden rounded-[28px] border p-4 text-left",
        "border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.15),transparent_42%),linear-gradient(180deg,rgba(12,18,30,0.98),rgba(5,9,16,0.98))]",
        "shadow-[0_18px_42px_rgba(0,0,0,0.34)]",
        isActive
          ? "border-cyan-300/28 shadow-[0_0_34px_rgba(34,211,238,0.18)]"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      aria-label={showStats ? "Show Move action" : "Show Move stats"}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-6 top-0 h-20 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="absolute bottom-0 left-6 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-8 right-3 h-20 w-20 rounded-full bg-cyan-400/8 blur-2xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                isActive
                  ? "border-cyan-300/36 bg-cyan-300/14 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.18)]"
                  : "border-cyan-300/18 bg-cyan-300/8 text-cyan-200/80",
              ].join(" ")}
            >
              <Footprints className="h-[17px] w-[17px]" strokeWidth={2.1} />
            </div>

            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/84">
              MOVE
            </div>
          </div>

          <ChevronRight
            className="h-[18px] w-[18px] shrink-0 text-white/70"
            strokeWidth={2.4}
          />
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
                  "relative flex h-[136px] w-[136px] items-center justify-center rounded-full transition active:scale-[0.98]",
                  isActive ? "animate-pulse" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={isActive ? "Stop Move session" : "Start Move session"}
              >
                <span
                  className={[
                    "absolute inset-0 rounded-full",
                    "bg-[conic-gradient(from_220deg,rgba(34,211,238,0.08),rgba(34,211,238,0.95),rgba(168,85,247,0.62),rgba(34,211,238,0.08))]",
                    isActive
                      ? "shadow-[0_0_42px_rgba(34,211,238,0.42)]"
                      : "shadow-[0_0_26px_rgba(34,211,238,0.18)]",
                  ].join(" ")}
                />

                <span className="absolute inset-[5px] rounded-full bg-[linear-gradient(180deg,rgba(15,26,38,0.98),rgba(4,9,16,0.99))]" />

                <span
                  className={[
                    "absolute inset-[13px] rounded-full border",
                    isActive
                      ? "border-cyan-200/58 shadow-[inset_0_0_26px_rgba(34,211,238,0.22),0_0_24px_rgba(34,211,238,0.24)]"
                      : "border-cyan-200/24 shadow-[inset_0_0_18px_rgba(34,211,238,0.10)]",
                  ].join(" ")}
                />

                <span className="absolute inset-[25px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16),rgba(34,211,238,0.04)_46%,transparent_70%)]" />

                <span
                  className={[
                    "relative z-10 flex h-[58px] w-[58px] items-center justify-center rounded-full border",
                    isActive
                      ? "border-cyan-100/70 bg-cyan-200/24 shadow-[0_0_34px_rgba(34,211,238,0.72)]"
                      : "border-cyan-100/24 bg-cyan-200/10 shadow-[0_0_20px_rgba(34,211,238,0.24)]",
                  ].join(" ")}
                >
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-50">
                    {isActive ? "Stop" : "Start"}
                  </span>
                </span>
              </button>
            </div>

            <div className="flex min-w-full items-center justify-center">
              <div className="w-full rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.025))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_36px_rgba(0,0,0,0.22)] backdrop-blur-md">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 rounded-[16px] border border-cyan-200/10 bg-black/18 px-2.5 py-2">
                    <div className="flex min-w-0 items-center gap-1.5 text-white/58">
                      <Activity className="h-3.5 w-3.5 shrink-0 text-cyan-200/76" />
                      <span className="truncate text-[9px] font-bold uppercase tracking-[0.12em]">
                        Steps
                      </span>
                    </div>

                    <div className="shrink-0 text-[12px] font-black tracking-[-0.03em] text-white">
                      {formatCompactSteps(sessionSteps)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-[16px] border border-cyan-200/10 bg-black/18 px-2.5 py-2">
                    <div className="flex min-w-0 items-center gap-1.5 text-white/58">
                      <Flame className="h-3.5 w-3.5 shrink-0 text-cyan-200/76" />
                      <span className="truncate text-[9px] font-bold uppercase tracking-[0.12em]">
                        Calories
                      </span>
                    </div>

                    <div className="shrink-0 text-[12px] font-black tracking-[-0.03em] text-white">
                      {Number(calories || 0)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 rounded-[16px] border border-cyan-200/10 bg-black/18 px-2.5 py-2">
                    <div className="flex min-w-0 items-center gap-1.5 text-white/58">
                      <Timer className="h-3.5 w-3.5 shrink-0 text-cyan-200/76" />
                      <span className="truncate text-[9px] font-bold uppercase tracking-[0.12em]">
                        Timer
                      </span>
                    </div>

                    <div className="shrink-0 text-[12px] font-black tracking-[-0.03em] text-white">
                      {formatTime(timerSeconds)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none mt-3 flex items-center justify-center gap-1.5">
          <span
            className={[
              "h-1.5 rounded-full transition-all",
              !showStats ? "w-5 bg-cyan-200" : "w-1.5 bg-white/24",
            ].join(" ")}
          />
          <span
            className={[
              "h-1.5 rounded-full transition-all",
              showStats ? "w-5 bg-cyan-200" : "w-1.5 bg-white/24",
            ].join(" ")}
          />
        </div>
      </div>
    </section>
  );
}
