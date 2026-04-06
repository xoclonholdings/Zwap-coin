import React, { useState } from "react";
import { motion } from "framer-motion";
import { GAMES } from "@/games";

export default function PlayTab({ onStartGame }) {
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);

  return (
    <div className="w-full px-4 pb-6">
      <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_30%),linear-gradient(180deg,rgba(8,16,23,0.96),rgba(7,12,18,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
            Arcade
          </p>
          <div className="mt-3 h-px w-full bg-white/10" />
        </div>

        <div className="relative flex min-h-[320px] flex-col items-center justify-center px-4 text-center">
          <img
            src={selectedGame.logo}
            alt={selectedGame.name}
            className="mx-auto mb-4 h-28 object-contain"
          />

          {selectedGame.mechanic && (
            <p className="mb-5 max-w-[260px] text-sm text-white/45">
              {selectedGame.mechanic}
            </p>
          )}

          {selectedGame.status === "coming" && (
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/35">
              Coming Soon
            </p>
          )}

          <button
            disabled={selectedGame.status !== "live"}
            onClick={() => onStartGame(selectedGame)}
            className={`min-w-[180px] rounded-2xl px-6 py-3 text-lg font-semibold transition ${
              selectedGame.status === "live"
                ? "bg-gradient-to-r from-cyan-400 to-violet-500 text-[#081017]"
                : "bg-white/10 text-white/40"
            }`}
          >
            Start
          </button>
        </div>

        <div className="my-4 h-px w-full bg-white/10" />

        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GAMES.map((game) => (
            <motion.button
              key={game.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSelectedGame(game)}
              className={`flex h-12 min-w-[56px] items-center justify-center rounded-2xl border px-3 text-lg transition ${
                selectedGame.id === game.id
                  ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.10)]"
                  : "border-white/10 bg-white/5 text-white/65"
              }`}
            >
              {game.icon}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}