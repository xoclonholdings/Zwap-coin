import React, { useMemo, useState } from "react";
import { Gamepad2, ChevronLeft, ChevronRight, Play } from "lucide-react";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

const DEFAULT_GAMES = [
  {
    id: "stackz",
    name: "Stackz",
    status: "Tap to start",
  },
  {
    id: "breakerz",
    name: "Breakerz",
    status: "Tap to start",
  },
  {
    id: "pulze",
    name: "Pulze",
    status: "Tap to start",
  },
  {
    id: "zap-man",
    name: "Zap-Man",
    status: "Tap to start",
  },
];

function buildStatusLine({ isActive, gamesPlayedToday, playGoal, progress }) {
  if (isActive) return "In session";
  if (progress >= 1) return "Goal reached";
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
  games = DEFAULT_GAMES,
  onOpenPlay,
  onStartGame,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeGames = Array.isArray(games) && games.length > 0 ? games : DEFAULT_GAMES;
  const activeGame = safeGames[activeIndex] || safeGames[0];

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

  function goPrevious(event) {
    event.stopPropagation();
    setActiveIndex((current) =>
      current === 0 ? safeGames.length - 1 : current - 1
    );
  }

  function goNext(event) {
    event.stopPropagation();
    setActiveIndex((current) =>
      current === safeGames.length - 1 ? 0 : current + 1
    );
  }

  function handleStart(event) {
    event.stopPropagation();

    if (onStartGame) {
      onStartGame(activeGame);
      return;
    }

    if (onOpenPlay) {
      onOpenPlay(activeGame);
    }
  }

  return (
    <section
      className={[
        "group relative w-full overflow-hidden rounded-[26px] border p-4 text-left transition",
        isActive
          ? "border-violet-400/24 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_38%),linear-gradient(180deg,rgba(22,16,38,0.96),rgba(10,8,20,0.98))] shadow-[0_0_28px_rgba(168,85,247,0.12)]"
          : "border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.11),transparent_34%),linear-gradient(180deg,rgba(16,18,30,0.96),rgba(8,10,18,0.98))] shadow-[0_14px_34px_rgba(0,0,0,0.26)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Play arcade window"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(139,92,246,0.12),transparent_42%,rgba(34,211,238,0.08))]" />

      <div className="relative z-10 flex h-full min-h-[210px] flex-col justify-between">
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

          <button
            type="button"
            onClick={onOpenPlay}
            className="mt-0.5 shrink-0 text-white/32 transition hover:text-white/56"
            aria-label="Open Play"
          >
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.1} />
          </button>
        </div>

        <div className="mt-5 rounded-[22px] border border-white/10 bg-black/18 p-3 shadow-[inset_0_0_22px_rgba(255,255,255,0.03)]">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrevious}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/48 transition hover:bg-white/10 hover:text-white/80"
              aria-label="Previous game"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
            </button>

            <button
              type="button"
              onClick={handleStart}
              className="min-w-0 flex-1 rounded-[18px] border border-violet-300/16 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.20),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-3 py-4 text-center transition active:scale-[0.99]"
              aria-label={`Start ${activeGame.name}`}
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.10)]">
                <Play className="h-5 w-5 fill-current" strokeWidth={2.2} />
              </div>

              <div className="truncate text-[15px] font-black uppercase tracking-[0.18em] text-white">
                {activeGame.name}
              </div>

              <div className="mt-1 truncate text-[11px] font-medium text-white/48">
                {activeGame.status || "Tap to start"}
              </div>
            </button>

            <button
              type="button"
              onClick={goNext}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/48 transition hover:bg-white/10 hover:text-white/80"
              aria-label="Next game"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>

          <div className="mt-3 flex justify-center gap-1.5">
            {safeGames.map((game, index) => (
              <button
                key={game.id || game.name || index}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveIndex(index);
                }}
                className={`h-1.5 rounded-full transition ${
                  index === activeIndex
                    ? "w-5 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.45)]"
                    : "w-1.5 bg-white/20"
                }`}
                aria-label={`Show ${game.name}`}
              />
            ))}
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
    </section>
  );
}