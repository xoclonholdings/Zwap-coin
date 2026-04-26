import React, { useState } from "react";
import { Gamepad2, ChevronRight, Lock } from "lucide-react";

import brainzLogo from "@/assets/games/brainz_game_logo.PNG";
import breakerzLogo from "@/assets/games/breakerz_game_logo.PNG";
import pulzeLogo from "@/assets/games/pulze_game_logo.PNG";
import stackzLogo from "@/assets/games/stackz_game_logo.PNG";
import triplezLogo from "@/assets/games/triplez_game_logo.PNG";
import werdzLogo from "@/assets/games/werdz_game_logo.PNG";
import zapManLogo from "@/assets/games/zap_man_logo.PNG";

const DEFAULT_GAMES = [
  { id: "stackz", name: "STACKZ", logo: stackzLogo, locked: false },
  { id: "breakerz", name: "BREAKERZ", logo: breakerzLogo, locked: false },
  { id: "pulze", name: "PULZE", logo: pulzeLogo, locked: false },
  { id: "zap-man", name: "ZAP-MAN", logo: zapManLogo, locked: false },

  { id: "brainz", name: "BRAINZ", logo: brainzLogo, locked: true },
  { id: "triplez", name: "TRIPLEZ", logo: triplezLogo, locked: true },
  { id: "werdz", name: "WERDZ", logo: werdzLogo, locked: true },
];

export default function DashboardWindowPlay({
  games = DEFAULT_GAMES,
  onOpenPlay,
  onStartGame,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const safeGames =
    Array.isArray(games) && games.length > 0 ? games : DEFAULT_GAMES;

  const activeGame = safeGames[activeIndex] || safeGames[0];

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

    if (activeGame.locked) return;

    if (onStartGame) {
      onStartGame(activeGame);
      return;
    }

    if (onOpenPlay) {
      onOpenPlay(activeGame);
    }
  }

  function handleOpenPlay(event) {
    event.stopPropagation();

    if (onOpenPlay) {
      onOpenPlay(activeGame);
    }
  }

  return (
    <section
      className={[
        "relative flex h-full w-full overflow-hidden rounded-[26px] border border-white/10 p-4",
        "bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_38%),linear-gradient(180deg,rgba(16,18,30,0.96),rgba(8,10,18,0.98))]",
        "shadow-[0_14px_34px_rgba(0,0,0,0.26)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative z-10 flex min-h-0 w-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 text-violet-200">
              <Gamepad2 className="h-[17px] w-[17px]" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/80">
              PLAY
            </span>
          </div>

          <button onClick={handleOpenPlay}>
            <ChevronRight className="h-[18px] w-[18px] text-white/40" />
          </button>
        </div>

        {/* Game Area */}
        <div
          className="mt-4 flex flex-1 flex-col items-center justify-center rounded-[22px] border border-white/10 bg-black/20 px-4 py-4"
          onClick={showNextGame}
          onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX)}
          onTouchEnd={handleTouchEnd}
        >
          {/* Logo FULL WIDTH */}
          <div className="w-full flex justify-center">
            <img
              src={activeGame.logo}
              alt={activeGame.name}
              className={[
                "w-full max-w-[220px] object-contain",
                activeGame.locked ? "opacity-30" : "",
              ].join(" ")}
            />

            {activeGame.locked && (
              <div className="absolute">
                <Lock className="text-white/70" />
              </div>
            )}
          </div>

          {/* Start Button (reference width) */}
          <button
            onClick={handleStart}
            disabled={activeGame.locked}
            className={[
              "mt-4 w-full max-w-[220px] rounded-[20px] py-2.5 text-white font-bold",
              activeGame.locked
                ? "bg-white/10 text-white/30"
                : "bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300",
            ].join(" ")}
          >
            {activeGame.locked ? "Locked" : "Start"}
          </button>

          {/* Indicator */}
          <div className="mt-3 flex gap-1.5">
            {safeGames.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full ${
                  i === activeIndex
                    ? "w-4 bg-cyan-300"
                    : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}