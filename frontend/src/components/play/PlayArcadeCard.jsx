import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GAMES, getGameById } from "@/components/games/gamesIndex";

export default function PlayArcadeCard({ onStartGame }) {
  const [selectedGameId, setSelectedGameId] = useState(GAMES[0]?.id || "brainz");

  const selectedGame = useMemo(() => {
    return getGameById(selectedGameId) || GAMES[0];
  }, [selectedGameId]);

  useEffect(() => {
    if (!selectedGame && GAMES.length > 0) {
      setSelectedGameId(GAMES[0].id);
    }
  }, [selectedGame]);

  const handleStart = () => {
    if (!selectedGame || selectedGame.status !== "live") return;
    onStartGame?.(selectedGame);
  };

  return (
    <div className="rounded-[28px] border border-cyan-400/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_28%),linear-gradient(180deg,rgba(8,16,23,0.98),rgba(6,10,18,1))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
            Arcade
          </p>
          <p className="mt-1 text-sm text-white/45">
            Choose a game and enter the session.
          </p>
        </div>

        <div className="h-10 w-10 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,0.10)]" />
      </div>

      <div className="mb-5 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-5 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-8 h-28 w-28 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-6 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-[360px] flex-col items-center justify-center">
          {selectedGame?.logo ? (
            <img
              src={selectedGame.logo}
              alt={selectedGame.name}
              className="mx-auto mb-8 h-36 object-contain drop-shadow-[0_0_28px_rgba(255,255,255,0.10)]"
            />
          ) : null}

          {selectedGame?.status === "coming" ? (
            <div className="mb-4 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <p className="text-[11px] uppercase tracking-[0.20em] text-white/40">
                Coming Soon
              </p>
            </div>
          ) : null}

          <button
            type="button"
            disabled={!selectedGame || selectedGame.status !== "live"}
            onClick={handleStart}
            className={`min-w-[220px] rounded-[20px] px-7 py-3.5 text-lg font-semibold transition-all ${
              selectedGame?.status === "live"
                ? "bg-[linear-gradient(90deg,rgba(34,211,238,1),rgba(139,92,246,1),rgba(236,72,153,0.95))] text-[#071019] shadow-[0_0_34px_rgba(139,92,246,0.30)] active:scale-[0.98]"
                : "border border-white/10 bg-white/[0.05] text-white/35"
            }`}
          >
            Start
          </button>

          {selectedGame?.mechanic ? (
            <div className="mt-5 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-md">
              <p className="text-xs tracking-[0.08em] text-white/45">
                {selectedGame.mechanic}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GAMES.map((game) => (
          <motion.button
            key={game.id}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedGameId(game.id)}
            className={`flex h-12 min-w-fit items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
              selectedGame?.id === game.id
                ? "border-cyan-400/45 bg-cyan-400/15 text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.12)]"
                : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.06]"
            }`}
            aria-label={game.name}
            title={game.name}
          >
            <span className="text-base">{game.icon}</span>
            <span className="whitespace-nowrap">{game.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}