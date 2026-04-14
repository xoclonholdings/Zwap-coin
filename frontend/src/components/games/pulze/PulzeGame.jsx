import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Trophy, CircleDot } from "lucide-react";

const TOTAL_BEATS = 10;
const TRACK_MIN = 0;
const TRACK_MAX = 100;
const HIT_WINDOW = 8;
const PERFECT_WINDOW = 3;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getTarget() {
  return 20 + Math.random() * 60;
}

function getPulseDuration(level) {
  return Math.max(1400 - (level - 1) * 80, 650);
}

function evaluateHit(position, target, level, comboCount) {
  const distance = Math.abs(position - target);

  if (distance <= PERFECT_WINDOW) {
    const basePoints = 120 * level;
    const comboBonus = comboCount * 12 * level;

    return {
      hit: true,
      tier: "perfect",
      title: "PERFECT PULSE",
      subtitle: "Locked on beat",
      accent: "#00f5ff",
      points: basePoints + comboBonus,
      comboBonus,
      distance,
    };
  }

  if (distance <= HIT_WINDOW) {
    const closeness =
      1 - (distance - PERFECT_WINDOW) / (HIT_WINDOW - PERFECT_WINDOW);
    const scaledPoints = 70 + Math.round(closeness * 30);
    const basePoints = scaledPoints * level;
    const comboBonus = comboCount * 8 * level;

    return {
      hit: true,
      tier: "good",
      title: "CLEAN HIT",
      subtitle: "Pulse synced",
      accent: "#a855f7",
      points: basePoints + comboBonus,
      comboBonus,
      distance,
    };
  }

  return {
    hit: false,
    tier: "miss",
    title: "MISS",
    subtitle: "Outside target window",
    accent: "#64748b",
    points: 0,
    comboBonus: 0,
    distance,
  };
}

export default function PulzeGame({ onGameEnd, isPlaying, level }) {
  const [beatsLeft, setBeatsLeft] = useState(TOTAL_BEATS);
  const [score, setScore] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [bestHit, setBestHit] = useState(0);

  const [target, setTarget] = useState(getTarget());
  const [progress, setProgress] = useState(TRACK_MIN);
  const [direction, setDirection] = useState(1);

  const [roundActive, setRoundActive] = useState(true);
  const [lastResult, setLastResult] = useState(null);
  const [lastAccent, setLastAccent] = useState("#00f5ff");

  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const gameEndedRef = useRef(false);

  const endGame = useCallback(
    (finalScore) => {
      if (gameEndedRef.current) return;
      gameEndedRef.current = true;
      onGameEnd(finalScore, 0, level, false);
    },
    [onGameEnd, level]
  );

  useEffect(() => {
    if (!isPlaying) return;

    setBeatsLeft(TOTAL_BEATS);
    setScore(0);
    setComboCount(0);
    setBestHit(0);
    setTarget(getTarget());
    setProgress(TRACK_MIN);
    setDirection(1);
    setRoundActive(true);
    setLastResult(null);
    setLastAccent("#00f5ff");
    gameEndedRef.current = false;
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || !roundActive) return;

    const duration = getPulseDuration(level);
    const unitsPerSecond = (TRACK_MAX - TRACK_MIN) / (duration / 1000);

    const tick = (timestamp) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setProgress((prev) => {
        let next = prev + direction * unitsPerSecond * delta;
        let nextDirection = direction;

        if (next >= TRACK_MAX) {
          next = TRACK_MAX;
          nextDirection = -1;
        } else if (next <= TRACK_MIN) {
          next = TRACK_MIN;
          nextDirection = 1;
        }

        if (nextDirection !== direction) {
          setDirection(nextDirection);
        }

        return clamp(next, TRACK_MIN, TRACK_MAX);
      });

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = null;
      lastTimeRef.current = 0;
    };
  }, [isPlaying, roundActive, direction, level]);

  const resetRound = useCallback((remainingBeats) => {
    if (remainingBeats <= 0) return;

    setTarget(getTarget());
    setProgress(Math.random() > 0.5 ? TRACK_MIN : TRACK_MAX);
    setDirection(Math.random() > 0.5 ? 1 : -1);
    setRoundActive(true);
    setLastResult(null);
  }, []);

  const handlePulse = useCallback(() => {
    if (!isPlaying || !roundActive || beatsLeft <= 0) return;

    setRoundActive(false);

    const result = evaluateHit(progress, target, level, comboCount);
    const remainingBeats = beatsLeft - 1;
    const newScore = score + result.points;

    setLastResult(result);
    setLastAccent(result.accent);
    setScore(newScore);
    setBeatsLeft(remainingBeats);

    if (result.hit) {
      setComboCount((prev) => prev + 1);
      setBestHit((prev) => Math.max(prev, result.points));
    } else {
      setComboCount(0);
    }

    if (remainingBeats <= 0) {
      setTimeout(() => endGame(newScore), 850);
      return;
    }

    setTimeout(() => {
      resetRound(remainingBeats);
    }, 650);
  }, [
    isPlaying,
    roundActive,
    beatsLeft,
    progress,
    target,
    level,
    comboCount,
    score,
    endGame,
    resetRound,
  ]);

  if (!isPlaying) return null;

  return (
    <div
      className="w-full max-w-sm mx-auto flex flex-col items-center"
      data-testid="pulze-game"
    >
      <div className="w-full rounded-2xl border border-cyan-500/20 bg-[#0f1328] p-4 shadow-[0_0_24px_rgba(0,245,255,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-[0.18em]">
              <Sparkles className="w-3.5 h-3.5" />
              Pulze
            </div>
            <p className="text-gray-500 text-[11px] mt-1">
              Precision timing game
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-[10px]">Level</p>
            <p className="text-white font-bold">{level}</p>
          </div>
        </div>

        <div className="relative h-24 rounded-2xl border border-white/10 bg-[#0b1022] overflow-hidden mb-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,245,255,0.08),transparent_45%)]" />

          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
            <div className="relative h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden">
              <div
                className="absolute top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-xl border"
                style={{
                  left: `${target}%`,
                  background:
                    "linear-gradient(180deg, rgba(168,85,247,0.18), rgba(15,19,40,0.88))",
                  borderColor: "rgba(168,85,247,0.45)",
                  boxShadow: "0 0 18px rgba(168,85,247,0.35)",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.18em] text-purple-300">
                  HIT
                </div>
              </div>

              <motion.div
                className="absolute top-1/2 h-16 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
                animate={{
                  boxShadow: [
                    `0 0 8px ${lastAccent}55`,
                    `0 0 20px ${lastAccent}cc`,
                    `0 0 8px ${lastAccent}55`,
                  ],
                  scale: [1, 1.06, 1],
                }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                  left: `${progress}%`,
                  background: `linear-gradient(180deg, ${lastAccent}, rgba(255,255,255,0.92))`,
                }}
              />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-3 text-center">
            <span className="text-[11px] text-gray-400">
              Stop the pulse inside the hit zone
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-gray-400 text-[11px] uppercase tracking-wide mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Beats Left
            </div>
            <div className="text-2xl font-black text-white">{beatsLeft}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-gray-400 text-[11px] uppercase tracking-wide mb-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              Score
            </div>
            <div className="text-2xl font-black text-yellow-400">{score}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-gray-400 text-[11px] uppercase tracking-wide mb-1">
              <CircleDot className="w-3.5 h-3.5 text-purple-400" />
              Combo
            </div>
            <div className="text-2xl font-black text-purple-400">
              {comboCount}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-gray-400 text-[11px] uppercase tracking-wide mb-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Best Hit
            </div>
            <div className="text-2xl font-black text-pink-400">{bestHit}</div>
          </div>
        </div>

        <motion.div
          className="min-h-[64px] rounded-xl border flex items-center justify-center mb-4 px-3 text-center"
          animate={{
            boxShadow: [
              `0 0 8px ${lastAccent}22`,
              `0 0 18px ${lastAccent}55`,
              `0 0 8px ${lastAccent}22`,
            ],
          }}
          transition={{ duration: 1.4, repeat: lastResult ? Infinity : 0 }}
          style={{
            borderColor: `${lastAccent}33`,
            background: `linear-gradient(180deg, ${lastAccent}10, rgba(255,255,255,0.02))`,
          }}
        >
          <AnimatePresence mode="wait">
            {lastResult ? (
              <motion.div
                key={`${lastResult.title}-${beatsLeft}`}
                initial={{ opacity: 0, scale: 0.92, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                className="flex flex-col items-center"
              >
                <span
                  className="font-black text-sm uppercase tracking-wide"
                  style={{
                    color: lastAccent,
                    textShadow: `0 0 12px ${lastAccent}66`,
                  }}
                >
                  {lastResult.title}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">
                  {lastResult.points > 0 ? `+${lastResult.points} points` : "No points"}
                  {lastResult.comboBonus > 0
                    ? ` • Combo +${lastResult.comboBonus}`
                    : ""}
                </span>
              </motion.div>
            ) : (
              <motion.span
                key="idle-tip"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-500 text-xs uppercase tracking-wide"
              >
                Time the pulse • Build combos with consecutive hits
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <Button
          data-testid="pulze-hit-button"
          onClick={handlePulse}
          disabled={!roundActive || beatsLeft <= 0}
          className="w-full py-6 text-lg font-black rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-40"
        >
          {beatsLeft <= 0 ? "SESSION COMPLETE" : roundActive ? "PULSE" : "LOCKED"}
        </Button>
      </div>

      <p className="text-gray-600 text-[10px] mt-3 text-center">
        Hit the timing zone, build your combo, and chase precision.
      </p>
    </div>
  );
}