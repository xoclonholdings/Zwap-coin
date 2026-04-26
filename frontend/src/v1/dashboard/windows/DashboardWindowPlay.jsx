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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 text-violet-200">
              <Gamepad2 className="h-[17px] w-[17px]" strokeWidth={2.1} />
            </div>

            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
              PLAY
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPlay}
            className="shrink-0 text-white/32 transition hover:text-white/56"
            aria-label="Open Play"
          >
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.1} />
          </button>
        </div>

        <div
          className="mt-5 flex flex-1 touch-pan-y flex-col items-center justify-center rounded-[24px] border border-white/10 bg-black/18 px-4 py-6 shadow-[inset_0_0_22px_rgba(255,255,255,0.03)]"
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX)}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative flex min-h-[96px] w-full items-center justify-center">
            <img
              src={activeGame.logo}
              alt={activeGame.name}
              className={[
                "max-h-[86px] w-auto max-w-full object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.25)] transition",
                activeGame.locked ? "opacity-30 blur-[1px]" : "",
              ].join(" ")}
            />

            {activeGame.locked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Lock className="h-6 w-6 text-white/70" strokeWidth={2.2} />
                <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
                  Locked
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={activeGame.locked}
            className={[
              "mt-6 w-full rounded-[22px] border px-5 py-3 text-center text-lg font-black transition",
              activeGame.locked
                ? "cursor-not-allowed border-white/10 bg-white/10 text-white/30"
                : "border-white/50 bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 text-white shadow-[0_0_24px_rgba(34,211,238,0.20)] active:scale-[0.98]",
            ].join(" ")}
            aria-label={
              activeGame.locked
                ? `${activeGame.name} locked`
                : `Start ${activeGame.name}`
            }
          >
            {activeGame.locked ? "Locked" : "Start"}
          </button>

          <div className="mt-4 flex justify-center gap-1.5" aria-hidden="true">
            {safeGames.map((_, index) => (
              <span
                key={index}
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  index === activeIndex
                    ? "w-4 bg-cyan-200/65 shadow-[0_0_8px_rgba(103,242,255,0.22)]"
                    : "w-1.5 bg-white/22",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}