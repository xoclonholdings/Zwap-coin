import React, { useEffect, useMemo, useState } from "react";
import zapManLogo from "@/assets/games/zap_man_logo.PNG";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  GAME_TICK_MS,
  WALLS,
} from "./ZapManConstants";
import {
  createInitialState,
  setQueuedDirection,
  advancePlayer,
  advanceEnemies,
  checkCollision,
  maybeAdvanceRound,
  applyGameOver,
  restartGame,
} from "./ZapManEngine";

const WALL_SET = new Set(WALLS);

function key(x, y) {
  return `${x},${y}`;
}

function buildResult(state) {
  return {
    score: state.score,
    round: state.round,
    lives: state.lives,
    cleared: false,
    pelletsCollected: state.pelletsCollected,
    pelletsRemaining: state.pellets.length,
    gameId: "zap-man",
  };
}

export default function ZapManGame({
  onGameEnd,
  isPlaying,
  level = 1,
  round = 1,
}) {
  const [gameState, setGameState] = useState("idle");
  const [exitOpen, setExitOpen] = useState(false);
  const [state, setState] = useState(() => createInitialState());

  useEffect(() => {
    if (!isPlaying) return;

    setState(() => {
      const initial = createInitialState();

      return {
        ...initial,
        round: Math.max(1, Number(round) || 1),
      };
    });

    setGameState("splash");
    setExitOpen(false);
  }, [isPlaying, round]);

  useEffect(() => {
    if (gameState !== "live") return undefined;

    function handleKeyDown(event) {
      const directionMap = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
        W: "up",
        S: "down",
        A: "left",
        D: "right",
      };

      if (event.key === "Escape") {
        event.preventDefault();
        setGameState("paused");
        return;
      }

      const direction = directionMap[event.key];

      if (!direction) return;

      event.preventDefault();
      setState((prev) => setQueuedDirection(prev, direction));
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "live") return undefined;

    const interval = window.setInterval(() => {
      setState((prev) => {
        if (prev.isGameOver) return prev;

        const now = Date.now();

        let next = advancePlayer(prev);

        if (checkCollision(next.player, next.enemies)) {
          return applyGameOver(next);
        }

        next = advanceEnemies(next, now);

        if (checkCollision(next.player, next.enemies)) {
          return applyGameOver(next);
        }

        return maybeAdvanceRound(next);
      });
    }, GAME_TICK_MS);

    return () => window.clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (!state.isGameOver) return;
    if (gameState === "ended") return;

    setGameState("ended");
  }, [state.isGameOver, gameState]);

  const cells = useMemo(() => {
    const pelletSet = new Set(
      state.pellets.map((pellet) => key(pellet.x, pellet.y))
    );
    const enemySet = new Set(
      state.enemies.map((enemy) => key(enemy.x, enemy.y))
    );
    const playerKey = key(state.player.x, state.player.y);

    const output = [];

    for (let y = 0; y < GRID_HEIGHT; y += 1) {
      for (let x = 0; x < GRID_WIDTH; x += 1) {
        const cellKey = key(x, y);

        let type = "empty";

        if (WALL_SET.has(cellKey)) type = "wall";
        if (pelletSet.has(cellKey)) type = "pellet";
        if (enemySet.has(cellKey)) type = "enemy";
        if (playerKey === cellKey) type = "player";

        output.push({ x, y, key: cellKey, type });
      }
    }

    return output;
  }, [state]);

  function handleStart() {
    setState(() => {
      const initial = restartGame();

      return {
        ...initial,
        round: Math.max(1, Number(round) || 1),
      };
    });

    setExitOpen(false);
    setGameState("live");
  }

  function handlePause() {
    setExitOpen(false);
    setGameState("paused");
  }

  function handleResume() {
    setExitOpen(false);
    setGameState("live");
  }

  function handleRequestExit() {
    setExitOpen(true);
    setGameState("paused");
  }

  function handleCancelExit() {
    setExitOpen(false);
  }

  function handleConfirmExit() {
    const result = buildResult(state);

    setExitOpen(false);
    setGameState("exit");

    onGameEnd?.({
      ...result,
      level: Math.max(1, Number(level) || 1),
    });
  }

  function handleRestart() {
    setState(() => {
      const initial = restartGame();

      return {
        ...initial,
        round: Math.max(1, Number(round) || 1),
      };
    });

    setExitOpen(false