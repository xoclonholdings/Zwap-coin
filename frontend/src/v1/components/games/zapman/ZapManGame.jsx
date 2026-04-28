import React, { useEffect, useState } from "react";

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

export default function ZapManGame({
  onGameEnd,
  isPlaying,
  level = 1,
  round = 1,
}) {
  const [gameState, setGameState] = useState("idle");
  const [state, setState] = useState(createInitialState());
  const [exitOpen, setExitOpen] = useState(false);

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

      <div className="flex flex-1 flex-col items-center justify-center px-3 py-3">
        <ZapManBoard state={state} />

        <ZapManControls
          open={gameState === "live"}
          onDirection={handleDirection}
        />
      </div>

      {/* SPLASH */}
      <ZapManSplashOverlay
        open={gameState === "splash"}
        onStart={handleStart}
        onBackToArcade={handleConfirmExit}
      />

      {/* PAUSE */}
      <ZapManPauseOverlay
        open={gameState === "paused" && !exitOpen}
        round={state.round}
        score={state.score}
        lives={state.lives}
        pellets={state.pellets.length}
        onResume={handleResume}
        onExit={handleRequestExit}
      />

      {/* EXIT */}
      <ZapManExitOverlay
        open={exitOpen}
        round={state.round}
        score={state.score}
        onCancel={handleCancelExit}
        onConfirmExit={handleConfirmExit}
      />

      {/* GAME OVER */}
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
