import React, { useMemo, useState } from "react";
import { Lock, Trophy } from "lucide-react";

function formatScore(value) {
  return Number(value || 0).toLocaleString();
}

function normalizeGameName(value = "") {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

// ✅ Convert backend personalBests → usable highScores map
function mapPersonalBestsToScores(personalBests = []) {
  const map = {};

  for (const item of personalBests) {
    if (item.type === "game" && item.gameId) {
      map[item.gameId] = {
        score: Number(item.value || 0),
        level: 1,
        plays: 0,
      };
    }
  }

  return map;
}

function buildScoreRows({ games = [], personalBests = [] }) {
  const highScores = mapPersonalBestsToScores(personalBests);

  return games.map((game) => {
    const scoreData = highScores?.[game.id] || {};

    return {
      id: game.id,
      name: game.name || normalizeGameName(game.id),
      locked: Boolean(game.locked),
      score: Number(scoreData.score || 0),
      level: Number(scoreData.level || 1),
      plays: Number(scoreData.plays || 0),
    };
  });
}

export default function PlayHighScores({
  games = [],
  personalBests = [], // ✅ CHANGED INPUT
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const scoreRows = useMemo(() => {
    return buildScoreRows({ games, personalBests });
  }, [games, personalBests]);

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
        "shadow-[0_16px_38px_rgba(0,0,0,0.34)]",
        className,
      ].join(" ")}
    >
      <div
        className="relative mt-2 min-h-0 flex-1 overflow-hidden"
        onClick={showNextScore}
        onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {safeRows.map((game) => (
            <div key={game.id} className="flex min-w-full flex-col justify-center">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[0.78rem] font-black uppercase text-white">
                      {game.name}
                    </div>
                  </div>

                  {game.locked ? (
                    <Lock size={14} className="text-white/35" />
                  ) : (
                    <Trophy size={14} className="text-cyan-200" />
                  )}
                </div>

                <div className="mt-3 text-center text-white">
                  {game.locked ? "—" : formatScore(game.score)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}