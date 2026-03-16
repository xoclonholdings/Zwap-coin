import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Trophy, CircleDot } from "lucide-react";

const SYMBOLS = [
  {
    key: "zwap",
    glyph: "Z",
    name: "ZWAP",
    color: "#00f5ff",
    weight: 4,
    bg: "rgba(0,245,255,0.12)",
    border: "rgba(0,245,255,0.35)",
  },
  {
    key: "zpts",
    glyph: "P",
    name: "zPts",
    color: "#a855f7",
    weight: 7,
    bg: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.35)",
  },
  {
    key: "seven",
    glyph: "7",
    name: "Seven",
    color: "#ffd700",
    weight: 5,
    bg: "rgba(255,215,0,0.12)",
    border: "rgba(255,215,0,0.35)",
  },
  {
    key: "diamond",
    glyph: "◆",
    name: "Diamond",
    color: "#ec4899",
    weight: 8,
    bg: "rgba(236,72,153,0.12)",
    border: "rgba(236,72,153,0.35)",
  },
  {
    key: "pulse",
    glyph: "◉",
    name: "Pulse",
    color: "#22c55e",
    weight: 10,
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.35)",
  },
  {
    key: "bar",
    glyph: "▮",
    name: "Bar",
    color: "#f97316",
    weight: 12,
    bg: "rgba(249,115,22,0.12)",
    border: "rgba(249,115,22,0.35)",
  },
];

const TOTAL_WEIGHT = SYMBOLS.reduce((sum, symbol) => sum + symbol.weight, 0);

function getWeightedSymbol() {
  let roll = Math.random() * TOTAL_WEIGHT;

  for (let i = 0; i < SYMBOLS.length; i += 1) {
    roll -= SYMBOLS[i].weight;
    if (roll <= 0) return i;
  }

  return SYMBOLS.length - 1;
}

function getReelResult() {
  return [getWeightedSymbol(), getWeightedSymbol(), getWeightedSymbol()];
}

function getWinData(reels, level) {
  const [a, b, c] = reels;
  const allMatch = a === b && b === c;
  const anyPair = a === b || b === c || a === c;

  if (allMatch) {
    const sym = SYMBOLS[a];

    if (sym.key === "zwap") {
      return {
        points: 500 * level,
        title: "ZWAP JACKPOT",
        subtitle: "Rare triple hit",
        accent: "#00f5ff",
        tier: "jackpot",
      };
    }

    if (sym.key === "seven") {
      return {
        points: 320 * level,
        title: "LUCKY SEVENS",
        subtitle: "High-value triple",
        accent: "#ffd700",
        tier: "major",
      };
    }

    if (sym.key === "diamond") {
      return {
        points: 220 * level,
        title: "DIAMOND BURST",
        subtitle: "Premium triple",
        accent: "#ec4899",
        tier: "major",
      };
    }

    return {
      points: 150 * level,
      title: `TRIPLE ${sym.name.toUpperCase()}`,
      subtitle: "Clean reel match",
      accent: sym.color,
      tier: "triple",
    };
  }

  if (anyPair) {
    return {
      points: 50 * level,
      title: "PAIR HIT",
      subtitle: "Small bonus secured",
      accent: "#a855f7",
      tier: "pair",
    };
  }

  return {
    points: 0,
    title: null,
    subtitle: null,
    accent: "#64748b",
    tier: "none",
  };
}

const Reel = memo(function Reel({ target, spinning, delay, highlighted }) {
  const [display, setDisplay] = useState(target);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!spinning) {
      setDisplay(target);
      return;
    }

    intervalRef.current = setInterval(() => {
      setDisplay(getWeightedSymbol());
    }, 70);

    const stopTimer = setTimeout(() => {
      clearInterval(intervalRef.current);
      setDisplay(target);
    }, 1050 + delay);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(stopTimer);
    };
  }, [spinning, target, delay]);

  const sym = SYMBOLS[display];

  return (
    <motion.div
      className="w-20 h-24 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden"
      animate={{
        boxShadow: highlighted
          ? [
              `0 0 10px ${sym.color}55`,
              `0 0 24px ${sym.color}aa`,
              `0 0 10px ${sym.color}55`,
            ]
          : [
              `0 0 6px ${sym.color}22`,
              `0 0 14px ${sym.color}44`,
              `0 0 6px ${sym.color}22`,
            ],
        scale: highlighted ? [1, 1.03, 1] : 1,
      }}
      transition={{ duration: 1.4, repeat: Infinity }}
      style={{
        borderColor: sym.border,
        background: `linear-gradient(180deg, ${sym.bg}, rgba(10,11,30,0.94))`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-8 opacity-60"
        style={{
          background: `linear-gradient(180deg, ${sym.color}22, transparent)`,
        }}
      />
      <div
        className="text-4xl font-black leading-none"
        style={{
          color: sym.color,
          textShadow: `0 0 14px ${sym.color}88`,
        }}
      >
        {sym.glyph}
      </div>
      <div
        className="mt-1 text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: sym.color }}
      >
        {sym.name}
      </div>
    </motion.div>
  );
});

function WinningLine({ active, color }) {
  if (!active) return <div className="h-1.5 mb-3" />;

  return (
    <motion.div
      className="h-1.5 mb-3 rounded-full"
      animate={{
        opacity: [0.5, 1, 0.5],
        boxShadow: [
          `0 0 6px ${color}66`,
          `0 0 16px ${color}cc`,
          `0 0 6px ${color}66`,
        ],
      }}
      transition={{ duration: 0.9, repeat: Infinity }}
      style={{
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }}
    />
  );
}

export default function SlotsGame({ onGameEnd, isPlaying, level }) {
  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [lastWin, setLastWin] = useState(null);
  const [lastAccent, setLastAccent] = useState("#00f5ff");
  const [bestHit, setBestHit] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const gameEnded = useRef(false);

  const endGame = useCallback(
    (finalScore) => {
      if (gameEnded.current) return;
      gameEnded.current = true;
      onGameEnd(finalScore, 0, level, false);
    },
    [onGameEnd, level]
  );

  useEffect(() => {
    if (!isPlaying) return;

    setSpinsLeft(10);
    setScore(0);
    setLastWin(null);
    setLastAccent("#00f5ff");
    setBestHit(0);
    setComboCount(0);
    setReels([0, 0, 0]);
    setSpinning(false);
    gameEnded.current = false;
  }, [isPlaying]);

  const highlighted =
    reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2];

  const spin = () => {
    if (spinning || spinsLeft <= 0) return;

    setSpinning(true);
    setLastWin(null);

    const result = getReelResult();
    setReels(result);

    setTimeout(() => {
      setSpinning(false);

      const remaining = spinsLeft - 1;
      setSpinsLeft(remaining);

      const winData = getWinData(result, level);
      const comboBonus = winData.points > 0 ? comboCount * 10 * level : 0;
      const totalWin = winData.points + comboBonus;
      const newScore = score + totalWin;

      setScore(newScore);

      if (totalWin > 0) {
        setLastWin({
          ...winData,
          points: totalWin,
          comboBonus,
        });
        setLastAccent(winData.accent);
        setBestHit((prev) => Math.max(prev, totalWin));
        setComboCount((prev) => prev + 1);
      } else {
        setComboCount(0);
      }

      if (remaining <= 0) {
        setTimeout(() => endGame(newScore), 950);
      }
    }, 1650);
  };

  if (!isPlaying) return null;

  return (
    <div
      className="w-full max-w-sm mx-auto flex flex-col items-center"
      data-testid="slots-game"
    >
      <div className="w-full rounded-2xl border border-cyan-500/20 bg-[#0f1328] p-4 shadow-[0_0_24px_rgba(0,245,255,0.08)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-[0.18em]">
              <Sparkles className="w-3.5 h-3.5" />
              zSpin Arcade
            </div>
            <p className="text-gray-500 text-[11px] mt-1">
              Weighted neon reels
            </p>
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-[10px]">Level</p>
            <p className="text-white font-bold">{level}</p>
          </div>
        </div>

        <WinningLine active={highlighted && !spinning} color={lastAccent} />

        <div className="grid grid-cols-3 gap-3 mb-4">
          <Reel
            target={reels[0]}
            spinning={spinning}
            delay={0}
            highlighted={highlighted && !spinning}
          />
          <Reel
            target={reels[1]}
            spinning={spinning}
            delay={180}
            highlighted={highlighted && !spinning}
          />
          <Reel
            target={reels[2]}
            spinning={spinning}
            delay={360}
            highlighted={highlighted && !spinning}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-gray-400 text-[11px] uppercase tracking-wide mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Spins Left
            </div>
            <div className="text-2xl font-black text-white">{spinsLeft}</div>
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
          transition={{ duration: 1.4, repeat: lastWin ? Infinity : 0 }}
          style={{
            borderColor: `${lastAccent}33`,
            background: `linear-gradient(180deg, ${lastAccent}10, rgba(255,255,255,0.02))`,
          }}
        >
          <AnimatePresence mode="wait">
            {lastWin ? (
              <motion.div
                key={lastWin.title}
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
                  {lastWin.title}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">
                  +{lastWin.points} points
                  {lastWin.comboBonus > 0 ? ` • Combo +${lastWin.comboBonus}` : ""}
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
                Match 3 for jackpots • Match 2 for pair bonuses
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <Button
          data-testid="slots-spin-button"
          onClick={spin}
          disabled={spinning || spinsLeft <= 0}
          className="w-full py-6 text-lg font-black rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-40"
        >
          {spinning
            ? "PULSING..."
            : spinsLeft <= 0
            ? "SESSION COMPLETE"
            : "PULSE REELS"}
        </Button>
      </div>

      <p className="text-gray-600 text-[10px] mt-3 text-center">
        ZWAP is rare, Sevens are hot, and combo hits stack your score.
      </p>
    </div>
  );
}