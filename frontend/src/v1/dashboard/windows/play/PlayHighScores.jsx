import React, { useMemo, useState } from "react";
import { ChevronRight, Lock, Trophy } from "lucide-react";

function formatScore(value) {
  return Number(value || 0).toLocaleString();
}

function normalizeGameName(value = "") {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function buildScoreRows({ games = [], highScores = {} }) {
  return games.map((game) => {
    const scoreData = highScores?.[game.id] || {};

    return {
      id: game.id,
      name: game.name || normalizeGameName(game.id),
      locked: Boolean(game.locked),
      score: Number(scoreData.score || scoreData.highScore || 0),
      level: Number(scoreData.level || 1),
      plays: Number(scoreData.plays || scoreData.playCount || 0),
    };
  });
}

export default function PlayHighScores({
  games = [],
  highScores = {},
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const scoreRows = useMemo(() => {
    return buildScoreRows({ games, highScores });
  }, [games, highScores]);

  const safeRows = scoreRows.length > 0 ? scoreRows : [];

  function showNextScore() {
    if (!safeRows.length) return;
    setActiveIndex((current) => (current + 1) % safeRows.length);
  }

  function showPreviousScore() {
    if (!safeRows.length) return;
    setActiveIndex((current) =>
      current === 0 ? safeRows.length - 1 : current - 1
    );
  }

  function handleTouchEnd(event) {
    if (touchStartX === null) return;

    const touchEndX = event.changedTouches[0]?.clientX;
    const distance = touchStartX - touchEndX;

    if (distance > 35) showNextScore();
    if (distance < -35) showPreviousScore();

    setTouchStartX(null);
  }

  return (
    <section
      className={[
        "relative flex h-full w-full flex-col overflow-hidden rounded-[26px] border border-violet-300/16 p-4 text-left",
        "bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.1),transparent_38%),linear-gradient(180deg,rgba(17,24,39,0.98),rgba(7,10,18,1))]",
        "shadow-[0_16px_38px_rgba(0,0,0,0.34),0_0_28px_rgba(168,85,247,0.1)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full bg-violet-400/14 blur-3xl" />
        <div className="absolute bottom-0 right-3 h-20 w-24 rounded-full bg-cyan-400/8 blur-2xl" />
      </div>

      <div className="relative z-10 flex items-center gap-3 pr-10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-300/35 bg-violet-400/14 text-violet-100 shadow-[0_0_18px_rgba(168,85,247,0.18)]">
          <Trophy size={17} strokeWidth={2.3} />
        </div>

        <div className="bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200 bg-clip-text text-[13px] font-black uppercase tracking-[0.22em] text-transparent">
          SCORES
        </div>
      </div>

      <div className="relative z-10 mt-2 text-[0.95rem] font-black tracking-[-0.03em] text-white">
        High Scores
      </div>

      <div
        className="relative z-10 mt-2 min-h-0 flex-1 overflow-hidden"
        onClick={showNextScore}
        onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {safeRows.map((game) => (
            <div
              key={game.id}
              className="flex min-w-full flex-col justify-center"
            >
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[0.78rem] font-black uppercase tracking-[0.14em] text-white">
                      {game.name}
                    </div>

                    <div className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/35">
                      {game.locked ? "Locked" : "Unlocked"}
                    </div>
                  </div>

                  {game.locked ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/35">
                      <Lock size={14} strokeWidth={2.4} />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/24 bg-cyan-300/10 text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.12)]">
                      <Trophy size={14} strokeWidth={2.4} />
                    </div>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  <div className="rounded-[1rem] border border-white/8 bg-black/18 px-2 py-2 text-center">
                    <div className="text-[8px] font-black uppercase tracking-[0.12em] text-white/35">
                      Score
                    </div>
                    <div className="mt-1 text-[0.82rem] font-black tracking-[-0.04em] text-white">
                      {game.locked ? "—" : formatScore(game.score)}
                    </div>
                  </div>

                  <div className="rounded-[1rem] border border-white/8 bg-black/18 px-2 py-2 text-center">
                    <div className="text-[8px] font-black uppercase tracking-[0.12em] text-white/35">
                      Level
                    </div>
                    <div className="mt-1 text-[0.82rem] font-black tracking-[-0.04em] text-white">
                      {game.locked ? "—" : game.level}
                    </div>
                  </div>

                  <div className="rounded-[1rem] border border-white/8 bg-black/18 px-2 py-2 text-center">
                    <div className="text-[8px] font-black uppercase tracking-[0.12em] text-white/35">
                      Plays
                    </div>
                    <div className="mt-1 text-[0.82rem] font-black tracking-[-0.04em] text-white">
                      {game.locked ? "—" : game.plays}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!safeRows.length ? (
            <div className="flex min-w-full items-center justify-center">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] px-4 py-5 text-center text-[0.78rem] font-bold leading-relaxed text-white/55">
                No score data yet.
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="pointer-events-none relative z-10 mt-2 flex shrink-0 justify-center gap-1.5 pb-0.5"
        aria-hidden="true"
      >
        {safeRows.map((game, index) => (
          <span
            key={game.id}
            className={[
              "h-1.5 rounded-full transition-all duration-300",
              index === activeIndex
                ? "w-4 bg-cyan-200/65 shadow-[0_0_8px_rgba(103,242,255,0.22)]"
                : "w-1.5 bg-white/22",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}