import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { GAMES, getGameById } from "@/components/games/gamesIndex";

export default function PlayArcadeCard({ onStartGame }) {
  const [selectedGameId, setSelectedGameId] = useState(GAMES[0]?.id || "brainz");
  const railRef = useRef(null);

  const selectedGame = useMemo(() => {
    return getGameById(selectedGameId) || GAMES[0];
  }, [selectedGameId]);

  useEffect(() => {
    if (!selectedGame && GAMES.length > 0) {
      setSelectedGameId(GAMES[0].id);
    }
  }, [selectedGame]);

  const handlePlay = () => {
    if (!selectedGame || selectedGame.status !== "live") return;
    onStartGame?.(selectedGame);
  };

  const scrollRail = (direction) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({
      left: direction * 180,
      behavior: "smooth",
    });
  };

  return (
    <div className="rounded-[30px] border border-cyan-400/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_26%),linear-gradient(180deg,rgba(7,16,24,0.98),rgba(5,10,18,1))] p-5 shadow-[0_26px_90px_rgba(0,0,0,0.46)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/72">
            Arcade
          </p>
          <p className="mt-1 text-sm text-white/48">
            Choose a game and open its session screen.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,0.10)]">
          <Sparkles className="h-4 w-4 text-cyan-300" />
        </div>
      </div>

      <div className="mb-5 h-px w-full bg-gradient-to-r from-transparent via-cyan-300/16 to-transparent" />

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] px-5 py-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-10 h-36 w-36 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-8 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-[320px] flex-col items-center justify-center">
          {selectedGame?.logo ? (
            <motion.img
              key={selectedGame.id}
              initial={{ opacity: 0.65, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              src={selectedGame.logo}
              alt={selectedGame.name}
              className="mx-auto mb-7 h-40 object-contain drop-shadow-[0_0_34px_rgba(255,255,255,0.12)]"
            />
          ) : null}

          {selectedGame?.status === "coming" ? (
            <div className="mb-4 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <p className="text-[11px] uppercase tracking-[0.20em] text-white/40">
                Coming Soon
              </p>
            </div>
          ) : null}

          <motion.button
            type="button"
            disabled={!selectedGame || selectedGame.status !== "live"}
            onClick={handlePlay}
            whileTap={selectedGame?.status === "live" ? { scale: 0.97 } : undefined}
            animate={
              selectedGame?.status === "live"
                ? {
                    boxShadow: [
                      "0 0 18px rgba(34,211,238,0.10)",
                      "0 0 28px rgba(139,92,246,0.22)",
                      "0 0 18px rgba(34,211,238,0.10)",
                    ],
                  }
                : undefined
            }
            transition={
              selectedGame?.status === "live"
                ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
            className={`min-w-[170px] rounded-[18px] px-6 py-2.5 text-base font-semibold tracking-[0.02em] transition-all ${
              selectedGame?.status === "live"
                ? "bg-[linear-gradient(90deg,rgba(34,211,238,1),rgba(139,92,246,1),rgba(236,72,153,0.95))] text-[#071019]"
                : "border border-white/10 bg-white/[0.05] text-white/35"
            }`}
          >
            Play
          </motion.button>
        </div>
      </div>

      <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-cyan-300/16 to-transparent" />

      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => scrollRail(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/68 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Scroll games left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent" />
        </div>

        <button
          type="button"
          onClick={() => scrollRail(1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/68 transition hover:bg-white/[0.08] hover:text-white"
          aria-label="Scroll games right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={railRef}
        className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {GAMES.map((game) => {
          const isSelected = selectedGame?.id === game.id;

          return (
            <motion.button
              key={game.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedGameId(game.id)}
              className={`flex h-[54px] min-w-fit items-center gap-2.5 rounded-[20px] border px-4 transition ${
                isSelected
                  ? "border-cyan-400/45 bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(34,211,238,0.10))] text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.14)]"
                  : "border-white/10 bg-white/[0.04] text-white/68 hover:bg-white/[0.07]"
              }`}
              aria-label={game.name}
              title={game.name}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl border text-[15px] ${
                  isSelected
                    ? "border-cyan-300/30 bg-cyan-300/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                {game.icon}
              </span>

              <span
                className={`whitespace-nowrap text-[15px] font-semibold tracking-[0.01em] ${
                  isSelected ? "text-white" : "text-white/78"
                }`}
              >
                {game.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}