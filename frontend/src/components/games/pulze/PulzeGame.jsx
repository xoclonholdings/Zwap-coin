import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Trophy, Sparkles, CircleDot } from "lucide-react";

/*
CORE RULES (Pulze):
- Moving pulse across track
- Player taps to stop pulse
- Accuracy determines reward
- Combo builds on consecutive hits
- Fixed session length
*/

const TOTAL_BEATS = 10;
const TRACK_MIN = 0;
const TRACK_MAX = 100;
const HIT_WINDOW = 8;
const PERFECT_WINDOW = 3;

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

function getTarget() {
  return 20 + Math.random() * 60;
}

function getSpeed(level) {
  return Math.max(1400 - level * 80, 650);
}

function evaluateHit(pos, target, level, combo) {
  const dist = Math.abs(pos - target);

  if (dist <= PERFECT_WINDOW) {
    const base = 120 * level;
    const comboBonus = combo * 12 * level;

    return {
      hit: true,
      tier: "perfect",
      title: "PERFECT",
      accent: "#00f5ff",
      points: base + comboBonus,
      comboBonus,
    };
  }

  if (dist <= HIT_WINDOW) {
    const base = 70 * level;
    const comboBonus = combo * 8 * level;

    return {
      hit: true,
      tier: "good",
      title: "HIT",
      accent: "#a855f7",
      points: base + comboBonus,
      comboBonus,
    };
  }

  return {
    hit: false,
    tier: "miss",
    title: "MISS",
    accent: "#64748b",
    points: 0,
    comboBonus: 0,
  };
}

export default function PulzeGame({ onGameEnd, isPlaying, level }) {
  const [beatsLeft, setBeatsLeft] = useState(TOTAL_BEATS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestHit, setBestHit] = useState(0);

  const [target, setTarget] = useState(getTarget());
  const [progress, setProgress] = useState(TRACK_MIN);
  const [direction, setDirection] = useState(1);

  const [active, setActive] = useState(true);
  const [result, setResult] = useState(null);
  const [accent, setAccent] = useState("#00f5ff");

  const rafRef = useRef(null);
  const lastTime = useRef(0);
  const ended = useRef(false);

  const endGame = useCallback(
    (finalScore) => {
      if (ended.current) return;
      ended.current = true;
      onGameEnd(finalScore, 0, level, false);
    },
    [onGameEnd, level]
  );

  // Reset on start
  useEffect(() => {
    if (!isPlaying) return;

    setBeatsLeft(TOTAL_BEATS);
    setScore(0);
    setCombo(0);
    setBestHit(0);
    setTarget(getTarget());
    setProgress(TRACK_MIN);
    setDirection(1);
    setActive(true);
    setResult(null);
    setAccent("#00f5ff");

    ended.current = false;
  }, [isPlaying]);

  // Pulse movement loop
  useEffect(() => {
    if (!isPlaying || !active) return;

    const speed = getSpeed(level);
    const unitsPerSec = (TRACK_MAX - TRACK_MIN) / (speed / 1000);

    const tick = (t) => {
      if (!lastTime.current) lastTime.current = t;
      const delta = (t - lastTime.current) / 1000;
      lastTime.current = t;

      setProgress((prev) => {
        let next = prev + direction * unitsPerSec * delta;

        if (next >= TRACK_MAX) {
          next = TRACK_MAX;
          setDirection(-1);
        } else if (next <= TRACK_MIN) {
          next = TRACK_MIN;
          setDirection(1);
        }

        return clamp(next, TRACK_MIN, TRACK_MAX);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTime.current = 0;
    };
  }, [isPlaying, active, direction, level]);

  const handlePulse = () => {
    if (!active || beatsLeft <= 0) return;

    setActive(false);

    const hit = evaluateHit(progress, target, level, combo);
    const newScore = score + hit.points;
    const remaining = beatsLeft - 1;

    setScore(newScore);
    setBeatsLeft(remaining);
    setResult(hit);
    setAccent(hit.accent);

    if (hit.hit) {
      setCombo((c) => c + 1);
      setBestHit((b) => Math.max(b, hit.points));
    } else {
      setCombo(0);
    }

    if (remaining <= 0) {
      setTimeout(() => endGame(newScore), 800);
      return;
    }

    setTimeout(() => {
      setTarget(getTarget());
      setActive(true);
      setResult(null);
    }, 600);
  };

  if (!isPlaying) return null;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <div className="w-full rounded-2xl border border-cyan-500/20 bg-[#0f1328] p-4">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <div>
            <div className="text-cyan-400 text-xs uppercase flex gap-2 items-center">
              <Sparkles className="w-3 h-3" />
              Pulze
            </div>
            <p className="text-gray-500 text-[11px]">Timing game</p>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-[10px]">Lvl</p>
            <p className="text-white font-bold">{level}</p>
          </div>
        </div>

        {/* TRACK */}
        <div className="h-20 relative mb-4 border border-white/10 rounded-xl overflow-hidden">
          {/* Target */}
          <div
            className="absolute top-0 bottom-0 w-10 bg-purple-500/20 border border-purple-400/40"
            style={{ left: `${target}%`, transform: "translateX(-50%)" }}
          />

          {/* Pulse */}
          <motion.div
            className="absolute top-0 bottom-0 w-2 bg-cyan-400"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
          <div>Spins: {beatsLeft}</div>
          <div>Score: {score}</div>
          <div>Combo: {combo}</div>
        </div>

        {/* RESULT */}
        <div className="h-12 flex items-center justify-center text-xs mb-3">
          {result ? (
            <span style={{ color: accent }}>
              {result.title} +{result.points}
            </span>
          ) : (
            <span className="text-gray-500">Tap to stop the pulse</span>
          )}
        </div>

        {/* BUTTON */}
        <Button onClick={handlePulse} disabled={!active || beatsLeft <= 0}>
          {beatsLeft <= 0 ? "DONE" : active ? "PULSE" : "WAIT"}
        </Button>
      </div>
    </div>
  );
}