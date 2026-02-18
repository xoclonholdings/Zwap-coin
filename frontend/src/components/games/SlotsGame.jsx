import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

const SYMBOLS = [
  { label: "Z", color: "#00f5ff", name: "ZWAP" },
  { label: "P", color: "#a855f7", name: "zPts" },
  { label: "7", color: "#ffd700", name: "Seven" },
  { label: "D", color: "#ec4899", name: "Diamond" },
  { label: "C", color: "#22c55e", name: "Cherry" },
  { label: "B", color: "#f97316", name: "Bar" },
];

function getRandomSymbol() {
  return Math.floor(Math.random() * SYMBOLS.length);
}

function Reel({ target, spinning, delay }) {
  const [display, setDisplay] = useState(target);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (spinning) {
      intervalRef.current = setInterval(() => setDisplay(getRandomSymbol()), 80);
      const stopTimer = setTimeout(() => {
        clearInterval(intervalRef.current);
        setDisplay(target);
      }, 1000 + delay);
      return () => { clearInterval(intervalRef.current); clearTimeout(stopTimer); };
    } else {
      setDisplay(target);
    }
  }, [spinning, target, delay]);

  const sym = SYMBOLS[display];
  return (
    <div className="w-20 h-24 rounded-xl border-2 flex items-center justify-center text-3xl font-black transition-all duration-200"
      style={{ borderColor: sym.color + "60", background: sym.color + "15", color: sym.color, textShadow: `0 0 12px ${sym.color}80` }}>
      {sym.label}
    </div>
  );
}

export default function SlotsGame({ onGameEnd, isPlaying, level }) {
  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [lastWin, setLastWin] = useState(null);
  const gameEnded = useRef(false);

  const endGame = useCallback((finalScore) => {
    if (gameEnded.current) return;
    gameEnded.current = true;
    onGameEnd(finalScore, 0, level, false);
  }, [onGameEnd, level]);

  useEffect(() => {
    if (isPlaying) {
      setSpinsLeft(10);
      setScore(0);
      setLastWin(null);
      setReels([0, 0, 0]);
      gameEnded.current = false;
    }
  }, [isPlaying]);

  const spin = () => {
    if (spinning || spinsLeft <= 0) return;
    setSpinning(true);
    setLastWin(null);

    const r = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    setReels(r);

    setTimeout(() => {
      setSpinning(false);
      const remaining = spinsLeft - 1;
      setSpinsLeft(remaining);

      // Score calculation
      let win = 0;
      let winText = null;
      if (r[0] === r[1] && r[1] === r[2]) {
        // Jackpot — 3 of a kind
        const sym = SYMBOLS[r[0]];
        if (sym.label === "Z") { win = 500 * level; winText = "ZWAP JACKPOT!"; }
        else if (sym.label === "7") { win = 300 * level; winText = "LUCKY SEVENS!"; }
        else { win = 150 * level; winText = `Triple ${sym.name}!`; }
      } else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) {
        win = 50 * level;
        winText = "Pair!";
      }

      const newScore = score + win;
      setScore(newScore);
      if (win > 0) setLastWin(winText);

      if (remaining <= 0) {
        setTimeout(() => endGame(newScore), 800);
      }
    }, 1600);
  };

  if (!isPlaying) return null;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center" data-testid="slots-game">
      {/* Score bar */}
      <div className="flex justify-between w-full mb-4 text-sm px-2">
        <span className="text-gray-400">Spins: <span className="text-white font-bold">{spinsLeft}</span></span>
        <span className="text-gray-400">Score: <span className="text-yellow-400 font-bold">{score}</span></span>
      </div>

      {/* Machine */}
      <div className="p-4 rounded-2xl border border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-transparent mb-4">
        <div className="flex gap-3 justify-center">
          <Reel target={reels[0]} spinning={spinning} delay={0} />
          <Reel target={reels[1]} spinning={spinning} delay={200} />
          <Reel target={reels[2]} spinning={spinning} delay={400} />
        </div>
      </div>

      {/* Win display */}
      <div className="h-8 flex items-center justify-center mb-3">
        {lastWin && (
          <span className="text-yellow-400 font-bold text-lg animate-pulse">{lastWin}</span>
        )}
      </div>

      {/* Spin button */}
      <Button
        data-testid="slots-spin-button"
        onClick={spin}
        disabled={spinning || spinsLeft <= 0}
        className="w-48 py-6 text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-2xl disabled:opacity-40"
      >
        {spinning ? "Spinning..." : spinsLeft <= 0 ? "No Spins Left" : "SPIN"}
      </Button>

      <p className="text-gray-600 text-[10px] mt-3">3 matching = Jackpot | 2 matching = Pair</p>
    </div>
  );
}
