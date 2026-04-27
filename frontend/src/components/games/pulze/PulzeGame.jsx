import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Pause, Play, RotateCcw, Trophy, Zap } from "lucide-react";

const BEATS_PER_SESSION = 10;
const BASE_SPEED = 1.15;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getRank(score) {
  if (score >= 1600) return "S";
  if (score >= 1200) return "A";
  if (score >= 800) return "B";
  if (score >= 450) return "C";
  return "D";
}

function getHitResult(position) {
  const distanceFromCenter = Math.abs(position - 50);

  if (distanceFromCenter <= 5) {
    return { label: "Perfect", points: 200, zone: "perfect" };
  }

  if (distanceFromCenter <= 12) {
    return { label: "Great", points: 120, zone: "great" };
  }

  if (distanceFromCenter <= 22) {
    return { label: "Good", points: 60, zone: "good" };
  }

  return { label: "Miss", points: 0, zone: "miss" };
}

export default function PulzeGame({
  onGameEnd,
  isPlaying = true,
  level = 1,
  round = 1,
}) {
  const animationRef = useRef(null);
  const lastFrameRef = useRef(null);

  const safeLevel = Math.max(1, Number(level) || 1);
  const safeRound = Math.max(1, Number(round) || 1);

  const [gameState, setGameState] = useState(isPlaying ? "ready" : "idle");
  const [position, setPosition] = useState(10);
  const [direction, setDirection] = useState(1);
  const [beat, setBeat] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lastHit, setLastHit] = useState(null);

  const speed = useMemo(() => {
    return BASE_SPEED + safeLevel * 0.12 + safeRound * 0.05;
  }, [safeLevel, safeRound]);

  useEffect(() => {
    if (!isPlaying) {
      setGameState("idle");
      return;
    }

    setGameState("ready");
  }, [isPlaying]);

  useEffect(() => {
    if (gameState !== "live") return undefined;

    const tick = (timestamp) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }

      const delta = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;

      setPosition((current) => {
        let next = current + direction * speed * (delta / 16.67);

        if (next >= 100) {
          next = 100;
          setDirection(-1);
        }

        if (next <= 0) {
          next = 0;
          setDirection(1);
        }

        return next;
      });

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      lastFrameRef.current = null;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, direction, speed]);

  const resetSession = () => {
    setPosition(10);
    setDirection(1);
    setBeat(1);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setLastHit(null);
    setGameState("ready");
  };

  const startSession = () => {
    resetSession();
    setGameState("live");
  };

  const pauseSession = () => {
    setGameState("paused");
  };

  const resumeSession = () => {
    setGameState("live");
  };

  const finishSession = (finalScore = score) => {
    setGameState("finished");

    onGameEnd?.({
      score: finalScore,
      round: safeRound,
      level: safeLevel,
      cleared: true,
      combo: bestCombo,
      gameId: "pulze",
    });
  };

  const exitSession = () => {
    onGameEnd?.({
      score,
      round: safeRound,
      level: safeLevel,
      cleared: false,
      combo: bestCombo,
      gameId: "pulze",
    });
  };

  const hitPulse = () => {
    if (gameState !== "live") return;

    const result = getHitResult(position);
    const nextCombo = result.points > 0 ? combo + 1 : 0;
    const comboBonus = result.points > 0 ? nextCombo * 10 : 0;
    const gained = result.points + comboBonus;
    const nextScore = score + gained;
    const nextBeat = beat + 1;

    setScore(nextScore);
    setCombo(nextCombo);
    setBestCombo((current) => Math.max(current, nextCombo));
    setLastHit({
      ...result,
      gained,
    });

    if (nextBeat > BEATS_PER_SESSION) {
      finishSession(nextScore);
      return;
    }

    setBeat(nextBeat);
  };

  const rank = getRank(score);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-[220px] w-[220px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[10%] h-[220px] w-[220px] rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[20%] h-[220px] w-[220px] rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
            <Zap size={12} />
            Pulze
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            Beat {Math.min(beat, BEATS_PER_SESSION)} / {BEATS_PER_SESSION}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Score
          </p>
          <p className="mt-1 text-sm font-semibold text-cyan-300">
            {Number(score || 0).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {gameState === "live" ? (
            <button
              type="button"
              onClick={pauseSession}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75"
            >
              <Pause size={14} />
            </button>
          ) : null}

          <button
            type="button"
            onClick={exitSession}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-5">
        <div className="w-full max-w-[340px] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,32,0.92),rgba(5,8,18,0.98))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                Level
              </p>
              <p className="mt-1 text-sm font-black text-white">{safeLevel}</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                Combo
              </p>
              <p className="mt-1 text-sm font-black text-purple-300">{combo}</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                Rank
              </p>
              <p className="mt-1 text-sm font-black text-cyan-300">{rank}</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="relative h-14 rounded-full border border-white/10 bg-black/30 px-3">
              <div className="absolute left-1/2 top-1/2 h-10 w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]" />
              <div className="absolute left-1/2 top-1/2 h-10 w-[10%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10" />

              <div
                className="absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-white/20 bg-[linear-gradient(135deg,rgba(34,211,238,1),rgba(168,85,247,1),rgba(236,72,153,1))] shadow-[0_0_24px_rgba(34,211,238,0.28)]"
                style={{
                  left: `calc(${clamp(position, 0, 100)}% - 16px)`,
                }}
              />
            </div>

            <p className="mt-3 text-center text-xs text-white/45">
              Tap when the pulse enters the center zone.
            </p>
          </div>

          {lastHit ? (
            <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-center">
              <p className="text-lg font-black text-white">{lastHit.label}</p>
              <p className="mt-1 text-xs text-cyan-200/70">
                +{lastHit.gained} zPts-style score
              </p>
            </div>
          ) : null}

          <div className="mt-6">
            {gameState === "ready" || gameState === "idle" ? (
              <button
                type="button"
                onClick={startSession}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(90deg,rgba(34,211,238,1),rgba(168,85,247,1),rgba(236,72,153,1))] text-base font-black text-white active:scale-[0.98]"
              >
                <Play size={18} />
                Start Session
              </button>
            ) : null}

            {gameState === "live" ? (
              <button
                type="button"
                onClick={hitPulse}
                className="h-16 w-full rounded-[22px] bg-[linear-gradient(90deg,rgba(34,211,238,1),rgba(168,85,247,1),rgba(236,72,153,1))] text-lg font-black text-white shadow-[0_0_28px_rgba(34,211,238,0.18)] active:scale-[0.98]"
              >
                HIT
              </button>
            ) : null}

            {gameState === "paused" ? (
              <button
                type="button"
                onClick={resumeSession}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(90deg,rgba(34,211,238,1),rgba(168,85,247,1),rgba(236,72,153,1))] text-base font-black text-white active:scale-[0.98]"
              >
                <Play size={18} />
                Resume
              </button>
            ) : null}

            {gameState === "finished" ? (
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-yellow-300/20 bg-yellow-300/10 text-yellow-200">
                  <Trophy size={24} />
                </div>

                <p className="text-xl font-black text-white">Session Complete</p>

                <button
                  type="button"
                  onClick={resetSession}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.06] text-base font-black text-white active:scale-[0.98]"
                >
                  <RotateCcw size={18} />
                  Play Again
                </button>

                <button
                  type="button"
                  onClick={exitSession}
                  className="h-12 w-full rounded-[18px] border border-white/10 bg-white/[0.04] text-sm font-bold text-white/70"
                >
                  Back to Arcade
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}