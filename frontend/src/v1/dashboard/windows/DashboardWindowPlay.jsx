import React, { useMemo, useState } from "react";
import { Gamepad2, ChevronLeft, ChevronRight, Play } from "lucide-react";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

const DEFAULT_GAMES = [
  { id: "stackz", name: "Stackz", status: "Tap to start" },
  { id: "breakerz", name: "Breakerz", status: "Tap to start" },
  { id: "pulze", name: "Pulze", status: "Tap to start" },
  { id: "zap-man", name: "Zap-Man", status: "Tap to start" },
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
  playPercent,
  games = DEFAULT_GAMES,
  onOpenPlay,
  onStartGame,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeGames =
    Array.isArray(games) && games.length > 0 ? games : DEFAULT_GAMES;
  const activeGame = safeGames[activeIndex] || safeGames[0];
  const safeGoal = Math.max(1, Number(playGoal || 1));
  const resolvedPercent = progressPercent ?? playPercent;

  const progress = useMemo(() => {
    if (typeof resolvedPercent === "number") {
      return clamp(resolvedPercent / 100);
    }

    return clamp(Number(gamesPlayedToday || 0) / safeGoal);
  }, [resolvedPercent, gamesPlayedToday, safeGoal]);

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
        "group relative h-full w-full overflow-hidden rounded-[28px] border text-left",
        isActive
          ? "border-violet-300/28 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_44%),linear-gradient(180deg,rgba(22,16,38,0.97),rgba(9,7,18,0.99))] shadow-[0_0_34px_rgba(168,85,247,0.15)]"
          : "border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.14),transparent_42%),linear-gradient(180deg,rgba(16,18,30,0.97),rgba(7,9,17,0.99))] shadow-[0_16px_38px_rgba(0,0,0,0.30)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Play arcade window"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-5 top-0 h-16 rounded-full bg-violet-300/12 blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(139,92,246,0.13),transparent_40%,rgba(34,211,238,0.07))]" />
      </div>

      <div className="relative z-10 flex h-full flex-col p-3">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-300/20 bg-violet-300/10 text-violet-200">
              <Gamepad2 className="h-4 w-4" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/88">
                Play
              </div>
              <div className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-100/46">
                {statusLine}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPlay}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/[0.035] text-white/34 active:scale-[0.96]"
            aria-label="Open Play"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center py-2">
          <div className="grid w-full grid-cols-[28px_1fr_28px] items-center gap-2">
            <button
              type="button"
              onClick={goPrevious}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/48 active:scale-[0.96]"
              aria-label="Previous game"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
            </button>

            <button
              type="button"
              onClick={handleStart}
              className="min-w-0 rounded-[24px] border border-violet-300/16 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-2.5 py-4 text-center shadow-[inset_0_0_24px_rgba(255,255,255,0.035)] active:scale-[0.99]"
              aria-label={`Start ${activeGame.name}`}
            >
              <div className="mx-auto mb-3 flex h-[clamp(44px,12vw,60px)] w-[clamp(44px,12vw,60px)] items-center justify-center rounded-full border border-cyan-300/22 bg-cyan-300/10 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                <Play className="h-6 w-6 fill-current" strokeWidth={2.2} />
              </div>

              <div className="truncate text-[clamp(14px,4vw,18px)] font-black uppercase tracking-[0.16em] text-white">
                {activeGame.name}
              </div>

              <div className="mt-1 truncate text-[10px] font-semibold text-white/46">
                {activeGame.status || "Tap to start"}
              </div>
            </button>

            <button
              type="button"
              onClick={goNext}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/48 active:scale-[0.96]"
              aria-label="Next game"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        <div className="shrink-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/38">
              Today
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/56">
              {gamesPlayedToday} / {safeGoal}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 shadow-[0_0_14px_rgba(168,85,247,0.18)]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="mt-2 flex justify-center gap-1.5">
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
                    : "w-1.5 bg-white/22"
                }`}
                aria-label={`Show ${game.name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}