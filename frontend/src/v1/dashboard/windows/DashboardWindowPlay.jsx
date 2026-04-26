import React, { useMemo, useState } from "react";
import { Gamepad2, ChevronRight } from "lucide-react";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

const DEFAULT_GAMES = [
  { id: "stackz", name: "STACKZ" },
  { id: "breakerz", name: "BREAKERZ" },
  { id: "pulze", name: "PULZE" },
  { id: "zap-man", name: "ZAP-MAN" },
];

function buildStatusLine({ isActive, gamesPlayedToday, playGoal, progress }) {
  if (isActive) return "In session";
  if (progress >= 1) return "Goal reached";
  if (Number(gamesPlayedToday || 0) > 0) return `${gamesPlayedToday} of ${playGoal} today`;
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
  const [touchStartX, setTouchStartX] = useState(null);

  const safeGames = Array.isArray(games) && games.length > 0 ? games : DEFAULT_GAMES;
  const activeGame = safeGames[activeIndex] || safeGames[0];
  const safeGoal = Math.max(1, Number(playGoal || 1));

  const progress = useMemo(() => {
    if (typeof progressPercent === "number") return clamp(progressPercent / 100);
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

  function showNextGame() {
    setActiveIndex((current) => (current + 1) % safeGames.length);
  }

  function showPreviousGame() {
    setActiveIndex((current) =>
      current === 0 ? safeGames.length - 1 : current - 1
    );
  }

  function handleTouchEnd(event) {
    if (touchStartX === null) return;

    const touchEndX = event.changedTouches[0]?.clientX;
    const distance = touchStartX - touchEndX;

    if (distance > 35) showNextGame();
    if (distance < -35) showPreviousGame();

    setTouchStartX(null);
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
        "relative w-full overflow-hidden rounded-[26px] border border-white/10 p-4 text-left",
        "bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_38%),linear-gradient(180deg,rgba(16,18,30,0.96),rgba(8,10,18,0.98))]",
        "shadow-[0_14px_34px_rgba(0,0,0,0.26)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Play arcade window"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(139,92,246,0.12),transparent_42%,rgba(34,211,238,0.08))]" />

      <div className="relative z-10 flex min-h-[250px] flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-400/18 bg-violet-400/10 text-violet-200">
              <Gamepad2 className="h-[17px] w-[17px]" strokeWidth={2.1} />
            </div>

            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
              Play
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

        <div className="mt-4 text-sm font-medium tracking-[-0.02em] text-white/72">
          {statusLine}
        </div>

        <div
          className="mt-5 flex flex-1 touch-pan-y flex-col items-center justify-center rounded-[24px] border border-white/10 bg-black/18 px-4 py-5 shadow-[inset_0_0_22px_rgba(255,255,255,0.03)]"
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX)}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex min-h-[78px] items-center justify-center text-center">
            <div className="bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-300 bg-clip-text text-[28px] font-black uppercase italic tracking-[-0.08em] text-transparent drop-shadow-[0_0_16px_rgba(34,211,238,0.22)]">
              {activeGame.name}
            </div>
          </div>

          <div className="mt-4 text-[11px] font-black uppercase tracking-[0.36em] text-cyan-200/80">
            Ready
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="mt-5 w-full rounded-[22px] border border-white/50 bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 px-5 py-3 text-center text-lg font-black text-white shadow-[0_0_24px_rgba(34,211,238,0.20)] transition active:scale-[0.98]"
            aria-label={`Start ${activeGame.name}`}
          >
            Start
          </button>

          <div className="mt-4 flex justify-center gap-1.5">
            {safeGames.map((game, index) => (
              <span
                key={game.id || game.name || index}
                className={`h-1.5 rounded-full transition ${
                  index === activeIndex
                    ? "w-5 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.45)]"
                    : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-white/46">Today</span>
            <span className="text-[11px] font-medium text-white/62">
              {gamesPlayedToday} / {safeGoal}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.14)] transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}