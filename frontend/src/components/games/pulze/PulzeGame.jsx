import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, ChevronLeft, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import PulzeGame from "./PulzeGame";

const BASE_LEVEL = 1;

function getRank(score) {
  if (score >= 1600) return "S";
  if (score >= 1200) return "A";
  if (score >= 800) return "B";
  if (score >= 450) return "C";
  return "D";
}

export default function PulzeSessionView({
  onExit,
  onSessionComplete,
  startingLevel = BASE_LEVEL,
  title = "Pulze",
  subtitle = "Precision timing under pressure",
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(startingLevel);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [sessionSeed, setSessionSeed] = useState(0);

  useEffect(() => {
    setLevel(startingLevel);
  }, [startingLevel]);

  const resetSession = useCallback(() => {
    setSessionEnded(false);
    setFinalScore(0);
  }, []);

  const startSession = useCallback(() => {
    resetSession();
    setIsPlaying(false);
    setSessionSeed((prev) => prev + 1);

    requestAnimationFrame(() => {
      setIsPlaying(true);
    });
  }, [resetSession]);

  const handleReplay = useCallback(() => {
    startSession();
  }, [startSession]);

  const handleGameEnd = useCallback(
    (score, _stars, completedLevel, _perfectClear) => {
      setIsPlaying(false);
      setSessionEnded(true);
      setFinalScore(score);

      if (typeof onSessionComplete === "function") {
        onSessionComplete({
          game: "pulze",
          score,
          level: completedLevel,
          rank: getRank(score),
        });
      }
    },
    [onSessionComplete]
  );

  const handleExit = useCallback(() => {
    setIsPlaying(false);

    if (typeof onExit === "function") {
      onExit();
    }
  }, [onExit]);

  const rank = useMemo(() => getRank(finalScore), [finalScore]);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
      <div className="rounded-[1.75rem] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,13,30,0.96),rgba(9,11,24,0.98))] p-4 shadow-[0_0_28px_rgba(0,245,255,0.08)]">
        <div className="flex items-start justify-between gap-3 mb-4">
          <button
            type="button"
            onClick={handleExit}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Exit Pulze session"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex-1 text-center px-2">
            <div className="inline-flex items-center gap-2 text-cyan-400 text-[11px] font-semibold uppercase tracking-[0.22em]">
              <Zap className="h-3.5 w-3.5" />
              Session View
            </div>

            <h2 className="mt-2 text-white text-2xl font-black leading-none">
              {title}
            </h2>

            <p className="mt-2 text-[12px] text-gray-400">{subtitle}</p>
          </div>

          <div className="min-w-[44px]" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-1">
              Level
            </div>
            <div className="text-2xl font-black text-white">{level}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-1">
              Rank
            </div>
            <div className="text-2xl font-black text-cyan-400">
              {sessionEnded ? rank : "–"}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isPlaying && !sessionEnded ? (
            <motion.div
              key="pulze-prestart"
              initial={{ opacity: 0, y: 8, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.985 }}
              transition={{ duration: 0.18 }}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="rounded-2xl border border-cyan-400/20 bg-[radial-gradient(circle_at_top,rgba(0,245,255,0.12),transparent_45%)] px-4 py-5 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10">
                  <Play className="h-6 w-6 text-cyan-300" />
                </div>

                <h3 className="text-white text-lg font-black uppercase tracking-wide">
                  Ready to Pulse
                </h3>

                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  Stop the moving pulse inside the hit zone. Perfect timing
                  builds combo pressure and pushes your score higher.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-3">
                    <div className="text-[10px] uppercase tracking-wide text-gray-500">
                      Beats
                    </div>
                    <div className="mt-1 text-white font-black">10</div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-3">
                    <div className="text-[10px] uppercase tracking-wide text-gray-500">
                      Style
                    </div>
                    <div className="mt-1 text-purple-300 font-black">Timing</div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 px-2 py-3">
                    <div className="text-[10px] uppercase tracking-wide text-gray-500">
                      Goal
                    </div>
                    <div className="mt-1 text-cyan-300 font-black">Precision</div>
                  </div>
                </div>

                <Button
                  onClick={startSession}
                  className="w-full mt-5 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-base font-black hover:opacity-90"
                >
                  START SESSION
                </Button>
              </div>
            </motion.div>
          ) : null}

          {isPlaying ? (
            <motion.div
              key={`pulze-playing-${sessionSeed}`}
              initial={{ opacity: 0, y: 8, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.985 }}
              transition={{ duration: 0.18 }}
            >
              <PulzeGame
                key={sessionSeed}
                isPlaying={isPlaying}
                level={level}
                onGameEnd={handleGameEnd}
              />
            </motion.div>
          ) : null}

          {!isPlaying && sessionEnded ? (
            <motion.div
              key="pulze-results"
              initial={{ opacity: 0, y: 8, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.985 }}
              transition={{ duration: 0.18 }}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-yellow-400/25 bg-yellow-400/10">
                  <Trophy className="h-6 w-6 text-yellow-300" />
                </div>

                <div className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                  Session Complete
                </div>

                <div className="mt-3 text-4xl font-black text-white">
                  {finalScore}
                </div>

                <div className="mt-1 text-sm text-gray-400">Final Score</div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                      Rank
                    </div>
                    <div className="mt-1 text-2xl font-black text-cyan-400">
                      {rank}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                      Level
                    </div>
                    <div className="mt-1 text-2xl font-black text-white">
                      {level}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <Button
                    onClick={handleReplay}
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-base font-black hover:opacity-90"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    PLAY AGAIN
                  </Button>

                  <Button
                    onClick={handleExit}
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    EXIT
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}