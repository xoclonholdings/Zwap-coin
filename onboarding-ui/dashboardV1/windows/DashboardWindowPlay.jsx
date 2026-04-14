import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Layers3,
  Shield,
  Ghost,
} from "lucide-react";

import PulzeSessionView from "@/components/play/pulze/PulzeSessionView";

const GAMES = [
  {
    key: "stackz",
    title: "Stackz",
    subtitle: "Balance and build",
    accent: "from-violet-500 via-purple-500 to-fuchsia-500",
    border: "border-violet-400/20",
    icon: Layers3,
    available: false,
  },
  {
    key: "breakerz",
    title: "Breakerz",
    subtitle: "Arcade impact",
    accent: "from-cyan-500 via-sky-500 to-blue-500",
    border: "border-cyan-400/20",
    icon: Shield,
    available: false,
  },
  {
    key: "pulze",
    title: "Pulze",
    subtitle: "Precision timing",
    accent: "from-cyan-500 via-purple-500 to-pink-500",
    border: "border-cyan-400/20",
    icon: Zap,
    available: true,
  },
  {
    key: "zapman",
    title: "Zap-Man",
    subtitle: "Maze chase energy",
    accent: "from-yellow-400 via-orange-500 to-pink-500",
    border: "border-yellow-400/20",
    icon: Ghost,
    available: false,
  },
];

function wrapIndex(index, length) {
  if (index < 0) return length - 1;
  if (index >= length) return 0;
  return index;
}

function PlayGameCard({ game, onLaunch }) {
  const Icon = game.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-[1.5rem] border ${game.border} bg-[linear-gradient(180deg,rgba(8,13,30,0.96),rgba(9,11,24,0.98))] p-4 shadow-[0_0_24px_rgba(0,245,255,0.06)]`}
      style={{ opacity: game.available ? 1 : 0.68 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_42%)]" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
            <Icon className="h-3.5 w-3.5" />
            Current Game
          </div>

          <h3 className="mt-2 text-white text-2xl font-black leading-none">
            {game.title}
          </h3>

          <p className="mt-2 text-sm text-gray-400">{game.subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${game.accent} shadow-[0_0_18px_rgba(255,255,255,0.08)]`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-gray-500">
          <span>Status</span>
          <span className={game.available ? "text-cyan-300" : "text-gray-500"}>
            {game.available ? "Ready" : "Locked"}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-400">
          {game.available
            ? "Tap to enter the live session."
            : "This game surface is visible in the carousel but not active yet."}
        </p>
      </div>

      <button
        type="button"
        onClick={onLaunch}
        disabled={!game.available}
        className={`relative mt-4 w-full rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition ${
          game.available
            ? `bg-gradient-to-r ${game.accent} hover:opacity-90`
            : "bg-white/10 text-gray-500 cursor-not-allowed"
        }`}
      >
        {game.available ? `Play ${game.title}` : `${game.title} Locked`}
      </button>
    </div>
  );
}

export default function DashboardWindowPlay({
  gamesPlayedToday = 0,
  gameGoal = 1,
  playPercent = 0,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sessionKey, setSessionKey] = useState(null);

  const safePercent = Math.max(0, Math.min(playPercent, 100));
  const activeGame = useMemo(() => GAMES[activeIndex], [activeIndex]);

  const goPrev = () => {
    setActiveIndex((prev) => wrapIndex(prev - 1, GAMES.length));
  };

  const goNext = () => {
    setActiveIndex((prev) => wrapIndex(prev + 1, GAMES.length));
  };

  const handleLaunch = () => {
    if (!activeGame.available) return;
    setSessionKey(activeGame.key);
  };

  const handleExitSession = () => {
    setSessionKey(null);
  };

  const handleSessionComplete = () => {
    setSessionKey(null);
  };

  const renderSession = () => {
    switch (sessionKey) {
      case "pulze":
        return (
          <PulzeSessionView
            onExit={handleExitSession}
            onSessionComplete={handleSessionComplete}
            startingLevel={1}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {sessionKey ? (
          <motion.div
            key={`session-${sessionKey}`}
            initial={{ opacity: 0, y: 8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.18 }}
          >
            {renderSession()}
          </motion.div>
        ) : (
          <motion.div
            key="play-window"
            initial={{ opacity: 0, y: 8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.18 }}
            className="rounded-[1.75rem] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,13,30,0.96),rgba(9,11,24,0.98))] p-4 shadow-[0_0_28px_rgba(0,245,255,0.08)]"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-cyan-400 text-[11px] font-semibold uppercase tracking-[0.22em]">
                  <Gamepad2 className="h-3.5 w-3.5" />
                  Play
                </div>

                <h2 className="mt-2 text-white text-xl font-black leading-none">
                  Current Game
                </h2>

                <p className="mt-2 text-[12px] text-gray-400">
                  Swipe horizontally to rotate through the 4 game surfaces.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  Today
                </div>
                <div className="mt-1 text-lg font-black text-white">
                  {gamesPlayedToday}/{gameGoal}
                </div>
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em]">
                <span className="text-gray-500">Daily Play Progress</span>
                <span className="font-bold text-cyan-300">
                  {Math.round(safePercent)}%
                </span>
              </div>

              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/8">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#8b5cf6,#ec4899)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${safePercent}%` }}
                  transition={{ duration: 0.35 }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Previous game"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeGame.key}
                    initial={{ opacity: 0, x: 18, scale: 0.985 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -18, scale: 0.985 }}
                    transition={{ duration: 0.18 }}
                  >
                    <PlayGameCard game={activeGame} onLaunch={handleLaunch} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={goNext}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Next game"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2">
              {GAMES.map((game, index) => (
                <button
                  key={game.key}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-8 bg-cyan-400"
                      : "w-2.5 bg-white/20 hover:bg-white/35"
                  }`}
                  aria-label={`Show ${game.title}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}