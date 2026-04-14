import React, { useEffect, useState } from "react";
import {
  createInitialState,
  nextRound,
  checkCollision,
} from "./ZapManEngine";

export default function ZapManGame() {
  const [state, setState] = useState(createInitialState());

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.isGameOver) return prev;

        // Move enemies randomly (basic for now)
        const enemies = prev.enemies.map((e) => ({
          ...e,
          x: (e.x + (Math.random() > 0.5 ? 1 : -1) + 15) % 15,
          y: (e.y + (Math.random() > 0.5 ? 1 : -1) + 15) % 15,
        }));

        // Collision check
        if (checkCollision(prev.player, enemies)) {
          return { ...prev, isGameOver: true };
        }

        // Pellet collection
        const pellets = prev.pellets.filter(
          (p) => !(p.x === prev.player.x && p.y === prev.player.y)
        );

        // Round complete
        if (pellets.length === 0) {
          return nextRound(prev);
        }

        return { ...prev, enemies, pellets };
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 text-white">
      <h2>Zap-Man</h2>
      <p>Round: {state.round}</p>
      {state.isGameOver && <p>Game Over</p>}
    </div>
  );
}