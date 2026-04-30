import React, { useState } from "react";
import { Gamepad2, ChevronRight, Lock } from "lucide-react";

import brainzLogo from "@/assets/games/brainz_game_logo.png";
import breakerzLogo from "@/assets/games/breakerz_game_logo.png";
import pulzeLogo from "@/assets/games/pulze_game_logo.png";
import stackzLogo from "@/assets/games/stackz_game_logo.png";
import triplezLogo from "@/assets/games/triplez_game_logo.png";
import werdzLogo from "@/assets/games/werdz_game_logo.png";
import zapManLogo from "@/assets/games/zap_man_logo.png";

import PlayHighScores from "./play/PlayHighScores";

const DEFAULT_GAMES = [
  { id: "stackz", name: "STACKZ", logo: stackzLogo, locked: false },
  { id: "breakerz", name: "BREAKERZ", logo: breakerzLogo, locked: false },
  { id: "pulze", name: "PULZE", logo: pulzeLogo, locked: false },
  { id: "zap-man", name: "ZAP-MAN", logo: zapManLogo, locked: false },

  { id: "brainz", name: "BRAINZ", logo: brainzLogo, locked: true },
  { id: "triplez", name: "TRIPLEZ", logo: triplezLogo, locked: true },
  { id: "werdz", name: "WERDZ", logo: werdzLogo, locked: true },
];

function WindowAltIndicator({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-3 z-30"
      aria-label="Toggle Play high scores"
    >
      <ChevronRight
        size={22}
        strokeWidth={2.8}
        className="text-white/70 drop-shadow-[0_0_10px_rgba(168,85,247,0.25)]"
      />
    </button>
  );
}

function ZapManLogoFallback({ isSwitching = false, locked = false }) {
  return (
    <div
      className={[
        "flex h-full w-full items-center justify-center transition-all duration-200",
        isSwitching ? "scale-95 opacity-40 blur-[1px]" : "scale-100 opacity-100",
        locked ? "opacity-30" : "",
      ].join(" ")}
    >
      <div className="rounded-[18px] border border-fuchsia-300/18 bg-black/20 px-4 py-3 shadow-[0_0_18px_rgba(236,72,153,0.12)]">
        <div className="bg-gradient-to-r from-fuchsia-100 via-pink-300 to-fuchsia-500 bg-clip-text text-[1.55rem] font-black uppercase leading-none tracking-[-0.055em] text-transparent drop-shadow-[0_0_8px_rgba(236,72,153,0.25)]">
          ZAP-MAN
        </div>
      </div>
    </div>
  );
}

export default function DashboardWindowPlay({
  games = DEFAULT_GAMES,
  highScores = {},
  onOpenPlay,
  onStartGame,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isAltView, setIsAltView] = useState(false);

  const safeGames =
    Array.isArray(games) && games.length > 0 ? games : DEFAULT_GAMES;

  const activeGame = safeGames[activeIndex] || safeGames[0];

  function handleToggleAltView(event) {
    event.stopPropagation();
    setIsAltView((current) => !current);
  }

  function switchToGame(nextIndex) {
    setIsSwitching(true);

    window.setTimeout(() => {
      setActiveIndex(nextIndex);
      window.setTimeout(() => setIsSwitching(false), 90);
    }, 90);
  }

  function showNextGame() {
    switchToGame((activeIndex + 1) % safeGames.length);
  }

  function showPreviousGame() {
    switchToGame(activeIndex === 0 ? safeGames.length - 1 : activeIndex - 1);
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

  if (isAltView) {
    return (
      <div className="relative h-full">
        <WindowAltIndicator onClick={handleToggleAltView} />

        <PlayHighScores
          games={safeGames}
          highScores={highScores}
          className={className}
        />
      </div>
    );
  }

  return (
    <section
      className={[
        "relative flex h-full w-full overflow-hidden rounded-[26px] border border-white/10 p-4 text-left",
        "bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_38%),linear-gradient(180deg,rgba(16,18,30,0.96),rgba(8,10,18,0.98))]",
        "shadow-[0_14px_34px_rgba(0,0,0,0.26)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Play arcade window"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(139,92,246,0.12),transparent_42%,rgba(34,211,238,0.08))]" />

      <WindowAltIndicator onClick={handleToggleAltView} />

      <div className="relative z-10 flex min-h-0 w-full flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 pr-10">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-400/10 text-violet-200">
              <Gamepad2 className="h-[17px] w-[17px]" strokeWidth={2.1} />
            </div>

            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
              PLAY
            </div>
          </div>
        </div>

        <div
          className="mt-4 flex min-h-0 flex-1 flex-col items-center justify-center rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 shadow-[inset_0_0_22px_rgba(255,255,255,0.03)]"
          onClick={showNextGame}
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX)}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            <div className="relative flex h-[86px] w-full max-w-[220px] items-center justify-center overflow-visible">
              {activeGame.id === "zap-man" ? (
                <ZapManLogoFallback
                  isSwitching={isSwitching}
                  locked={activeGame.locked}
                />
              ) : (
                <img
                  src={activeGame.logo}
                  alt={activeGame.name}
                  className={[
                    "block h-full max-h-full w-auto max-w-none object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.25)] transition-all duration-200",
                    isSwitching
                      ? "scale-95 opacity-40 blur-[1px]"
                      : "scale-100 opacity-100",
                    activeGame.locked ? "opacity-30" : "",
                  ].join(" ")}
                />
              )}

              {activeGame.locked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Lock className="h-6 w-6 text-white/70" strokeWidth={2.2} />
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
                    Locked
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={activeGame.locked}
            className={[
              "mt-3 w-full max-w-[220px] shrink-0 rounded-[20px] border px-5 py-2.5 text-center text-base font-black transition active:scale-[0.98]",
              activeGame.locked
                ? "cursor-not-allowed border-white/10 bg-white/10 text-white/30"
                : "border-white/50 bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-300 text-white shadow-[0_0_24px_rgba(34,211,238,0.20)]",
            ].join(" ")}
          >
            {activeGame.locked ? "Locked" : "Start"}
          </button>

          <div
            className="mt-2 flex shrink-0 justify-center gap-1.5 pb-0.5"
            aria-hidden="true"
          >
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