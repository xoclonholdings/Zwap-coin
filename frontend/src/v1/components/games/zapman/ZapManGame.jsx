import React, { useEffect, useRef, useState } from "react";

import ZapManBoard from "./ZapManBoard";
import ZapManHud from "./ZapManHud";
import ZapManControls from "./ZapManControls";
import {
  ZapManSplashOverlay,
  ZapManPauseOverlay,
  ZapManExitOverlay,
  ZapManGameOverOverlay,
} from "./ZapManOverlays";

import {
  createInitialState,
  setQueuedDirection,
  advancePlayer,
  advanceEnemies,
  checkCollision,
  resolveCollision,
  maybeAdvanceRound,
  restartGame,
  getResult,
} from "./ZapManEngine";

import { GAME_TICK_MS } from "./ZapManConstants";

const SWIPE_THRESHOLD = 24;

export default function ZapManGame({
  onGameEnd,
  isPlaying,
  level = 1,
  round = 1,
}) {
  const [gameState, setGameState] = useState("idle");
  const [state, setState] = useState(createInitialState());
  const [exitOpen, setExitOpen] = useState(false);
  const touchStartRef = useRef(null);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    if (!isPlaying) return;

    setState(createInitialState());
    setGameState("splash");
    setExitOpen(false);
  }, [isPlaying]);

  /* ---------------- INPUT ---------------- */

  useEffect(() => {
    if (gameState !== "live") return;

    function handleKeyDown(event) {
      const map = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        a: "left",
        s: "down",
        d: "right",
      };

      if (event.key === "Escape") {
        setGameState("paused");
        return;
      }

      const dir = map[event.key];
      if (!dir) return;

      event.preventDefault();
      setState((prev) => setQueuedDirection(prev, dir));
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  /* ---------------- SWIPE INPUT ---------------- */

  function handleTouchStart(event) {
    if (gameState !== "live") return;

    const touch = event.touches?.[0];
    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleTouchMove(event) {
    if (gameState !== "live") return;
    if (!touchStartRef.current) return;

    event.preventDefault();

    const touch = event.touches?.[0];
    if (!touch) return;

    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
      return;
    }

    const direction =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";

    setState((prev) => setQueuedDirection(prev, direction));

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleTouchEnd() {
    touchStartRef.current = null;
  }

  /* ---------------- GAME LOOP ---------------- */

  useEffect(() => {
    if (gameState !== "live") return;

    const interval = setInterval(() => {
      setState((prev) => {
        let next = advancePlayer(prev);
        const now = Date.now();

        const hit1 = checkCollision(next.player, next.enemies);
        if (hit1) next = resolveCollision(next, hit1, now);

        next = advanceEnemies(next, now);

        const hit2 = checkCollision(next.player, next.enemies);
        if (hit2) next = resolveCollision(next, hit2, now);

        next = maybeAdvanceRound(next);

        if (next.isGameOver) {
          setGameState("ended");
        }

        return next;
      });
    }, GAME_TICK_MS);

    return () => clearInterval(interval);
  }, [gameState]);

  /* ---------------- HANDLERS ---------------- */

  function handleStart() {
    setState(createInitialState());
    setGameState("live");
  }

  function handlePause() {
    setGameState("paused");
  }

  function handleResume() {
    setGameState("live");
  }

  function handleDirection(dir) {
    setState((prev) => setQueuedDirection(prev, dir));
  }

  function handleRequestExit() {
    setExitOpen(true);
    setGameState("paused");
  }

  function handleCancelExit() {
    setExitOpen(false);
  }

  function handleConfirmExit() {
    setGameState("exit");
    setExitOpen(false);
    onGameEnd?.(getResult(state));
  }

  function handleRestart() {
    setState(restartGame());
    setGameState("live");
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050816] text-white">
      <ZapManHud
        state={state}
        onPause={handlePause}
        gameState={gameState}
      />

      <div
        className="flex flex-1 touch-none select-none flex-col items-center justify-center px-3 py-3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <ZapManBoard state={state} />

        <ZapManControls
          open={gameState === "live"}
          onDirection={handleDirection}
        />
      </div>

      <ZapManSplashOverlay
        open={gameState === "splash"}
        onStart={handleStart}
        onBackToArcade={handleConfirmExit}
      />

      <ZapManPauseOverlay
        open={gameState === "paused" && !exitOpen}
        round={state.round}
        score={state.score}
        lives={state.lives}
        pellets={state.pellets.length}
        onResume={handleResume}
        onExit={handleRequestExit}
      />

      <ZapManExitOverlay
        open={exitOpen}
        round={state.round}
        score={state.score}
        onCancel={handleCancelExit}
        onConfirmExit={handleConfirmExit}
      />

      <ZapManGameOverOverlay
        open={gameState === "ended"}
        round={state.round}
        score={state.score}
        onRestart={handleRestart}
        onBackToArcade={handleConfirmExit}
      />
    </div>
  );
}