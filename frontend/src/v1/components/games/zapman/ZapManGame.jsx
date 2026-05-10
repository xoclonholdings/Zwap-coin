import React, { useEffect, useRef, useState } from "react";

import ZapManBoard from "./ZapManBoard";
import ZapManHud from "./ZapManHud";
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
  reviveGame,
  getResult,
} from "./ZapManEngine";

import { GAME_TICK_MS } from "./ZapManConstants";

const SWIPE_THRESHOLD = 24;

function buildRoundResult(state, overrides = {}) {
  return {
    gameId: "zap-man",
    game_type: "zap-man",
    score: Number(state?.score || 0),
    round: Number(state?.completedRound || state?.round || 1),
    nextRound: Number(state?.nextRound || Number(state?.round || 1) + 1),
    level: Number(state?.completedRound || state?.round || 1),
    lives: Number(state?.lives || 0),
    baseZpts: Number(state?.baseZpts || state?.roundReward || 0),
    finalZpts: Number(state?.totalZptsEarned || state?.baseZpts || 0),
    totalZptsEarned: Number(state?.totalZptsEarned || 0),
    pelletsCollected: Number(state?.pelletsCollected || 0),
    powerPelletsCollected: Number(state?.powerPelletsCollected || 0),
    enemiesZapped: Number(state?.enemiesZapped || 0),
    sessionDurationSeconds: Number(state?.sessionDurationSeconds || 0),
    completed: true,
    ...overrides,
  };
}

export default function ZapManGame({
  onGameEnd,
  onRoundComplete,
  onOutOfLives,
  isPlaying,
  reviveUsed = false,
  level = 1,
  round = 1,
}) {
  const [gameState, setGameState] = useState("idle");
  const [state, setState] = useState(() =>
    createInitialState({
      round,
    })
  );
  const [exitOpen, setExitOpen] = useState(false);
  const touchStartRef = useRef(null);
  const handledRoundRef = useRef(false);
  const handledGameOverRef = useRef(false);
  const previousReviveUsedRef = useRef(Boolean(reviveUsed));

  useEffect(() => {
    if (!isPlaying) return;

    handledRoundRef.current = false;
    handledGameOverRef.current = false;
    previousReviveUsedRef.current = Boolean(reviveUsed);

    setState(
      createInitialState({
        round,
      })
    );
    setGameState("splash");
    setExitOpen(false);
  }, [isPlaying, round]);

  useEffect(() => {
    if (!isPlaying) return;

    const previousReviveUsed = previousReviveUsedRef.current;
    const nextReviveUsed = Boolean(reviveUsed);

    if (!previousReviveUsed && nextReviveUsed) {
      handledGameOverRef.current = false;
      setState((current) => reviveGame(current));
      setGameState("live");
      setExitOpen(false);
    }

    previousReviveUsedRef.current = nextReviveUsed;
  }, [isPlaying, reviveUsed]);

  useEffect(() => {
    if (gameState !== "live") return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setGameState("paused");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

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

        if (next.roundCompleted && !handledRoundRef.current) {
          handledRoundRef.current = true;
          setGameState("roundComplete");
          onRoundComplete?.(buildRoundResult(next));
          return next;
        }

        if (next.isGameOver && !handledGameOverRef.current) {
          handledGameOverRef.current = true;
          setGameState("ended");

          if (typeof onOutOfLives === "function") {
            onOutOfLives(buildRoundResult(next));
          }
        }

        return next;
      });
    }, GAME_TICK_MS);

    return () => clearInterval(interval);
  }, [gameState, onRoundComplete, onOutOfLives]);

  function handleStart() {
    handledRoundRef.current = false;
    handledGameOverRef.current = false;

    setState(
      createInitialState({
        round,
      })
    );
    setGameState("live");
  }

  function handlePause() {
    setGameState("paused");
  }

  function handleResume() {
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
    setGameState("exit");
    setExitOpen(false);
    onGameEnd?.(getResult(state));
  }

  function handleRestart() {
    handledRoundRef.current = false;
    handledGameOverRef.current = false;
    setState(restartGame());
    setGameState("live");
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050816] text-white">
      <ZapManHud
        state={state}
        onPause={handlePause}
        gameState={gameState}
      />

      <div
        className="flex min-h-0 flex-1 touch-none select-none flex-col px-2 pb-2 pt-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <ZapManBoard state={state} />
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
        open={gameState === "ended" && typeof onOutOfLives !== "function"}
        round={state.round}
        score={state.score}
        onRestart={handleRestart}
        onBackToArcade={handleConfirmExit}
      />
    </div>
  );
}