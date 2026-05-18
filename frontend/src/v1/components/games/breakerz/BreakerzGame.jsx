import React, { useEffect, useRef, useState } from "react";

import breakerzCover from "@/assets/games/breakerz_game_cover.jpg";

import { BREAKERZ_CANVAS } from "./breakerzConfig";
import { attachBreakerzInput } from "./breakerzInput";
import { createBreakerzEngine } from "./breakerzEngine";
import { renderBreakerzFrame } from "./breakerzRenderer";
import BreakerzPauseOverlay from "./breakerzPauseOverlay";
import BreakerzExitOverlay from "./breakerzExitOverlay";

export default function BreakerzGame({
  onGameEnd,
  onRoundComplete,
  onOutOfLives,
  isPlaying,
  reviveUsed = false,
  reviveSignal = 0,
  level = 1,
  round = 1,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const engineRef = useRef(null);
  const sessionStartedAtRef = useRef(null);
  const handledFinishRef = useRef(false);
  const previousReviveSignalRef = useRef(Number(reviveSignal) || 0);

  const [gameState, setGameState] = useState("splash");
  const [showSplashContent, setShowSplashContent] = useState(false);

  const [overlayState, setOverlayState] = useState({
    pauseOpen: false,
    exitOpen: false,
  });

  const [uiState, setUiState] = useState({
    round: Math.max(1, Number(round) || 1),
    score: 0,
    lives: 5,
    finished: false,
  });

  function getSessionDurationSeconds() {
    if (!sessionStartedAtRef.current) return 0;

    return Math.max(
      0,
      Math.round((Date.now() - sessionStartedAtRef.current) / 1000)
    );
  }

  function buildGamePayload(result = {}, overrides = {}) {
    return {
      score: Number(result.score || uiState.score || 0),
      round: Number(result.round || uiState.round || round || 1),
      nextRound: Number(result.nextRound || Number(result.round || round || 1) + 1),
      level: Math.max(1, Number(level) || 1),
      cleared: Boolean(overrides.cleared ?? result.cleared),
      lives: Number(result.lives ?? uiState.lives ?? 0),
      blocksDestroyed: Number(
        result.blocksDestroyed ||
          result.blocks_destroyed ||
          result.bricksDestroyed ||
          result.bricks_destroyed ||
          0
      ),
      baseZpts: Number(result.baseZpts || 0),
      finalZpts: Number(result.finalZpts || result.baseZpts || 0),
      gameId: "breakerz",
      game_type: "breakerz",
      sessionDurationSeconds: getSessionDurationSeconds(),
      completed: true,
      ...overrides,
    };
  }

  useEffect(() => {
    if (!isPlaying) return;

    setGameState("splash");
    setShowSplashContent(false);
    setOverlayState({
      pauseOpen: false,
      exitOpen: false,
    });
    setUiState({
      round: Math.max(1, Number(round) || 1),
      score: 0,
      lives: 5,
      finished: false,
    });

    handledFinishRef.current = false;
    previousReviveSignalRef.current = Number(reviveSignal) || 0;

    const timer = window.setTimeout(() => {
      setShowSplashContent(true);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [isPlaying, round]);

  useEffect(() => {
    if (!isPlaying) return;

    const previousReviveSignal = previousReviveSignalRef.current;
    const nextReviveSignal = Number(reviveSignal) || 0;

    if (
      reviveUsed &&
      nextReviveSignal > previousReviveSignal &&
      engineRef.current
    ) {
      handledFinishRef.current = false;
      engineRef.current.reviveWithExtraLife?.();

      setGameState("live");
      setOverlayState({
        pauseOpen: false,
        exitOpen: false,
      });
    }

    previousReviveSignalRef.current = nextReviveSignal;
  }, [isPlaying, reviveUsed, reviveSignal]);

  useEffect(() => {
    if (!isPlaying || gameState !== "live") return undefined;

    if (!sessionStartedAtRef.current) {
      sessionStartedAtRef.current = Date.now();
    }

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const engine = createBreakerzEngine({
      width: BREAKERZ_CANVAS.width,
      height: BREAKERZ_CANVAS.height,
      startingRound: Math.max(1, Number(round) || 1),
    });

    engineRef.current = engine;
    handledFinishRef.current = false;

    const detachInput = attachBreakerzInput({
      canvas,
      getState: () => engine.getPublicState(),
      setPaddleX: (x) => engine.setPaddleX(x),
      togglePause: () => {
        if (overlayState.exitOpen) return;

        engine.togglePause();

        const publicState = engine.getPublicState();

        setOverlayState((prev) => ({
          ...prev,
          pauseOpen: Boolean(publicState.paused),
        }));
      },
    });

    const loop = (time) => {
      const activeEngine = engineRef.current;
      if (!activeEngine) return;

      const frame = activeEngine.tick(time);
      renderBreakerzFrame(ctx, frame);

      const publicState = activeEngine.getPublicState();

      setUiState({
        round: publicState.round,
        score: publicState.score,
        lives: publicState.lives,
        finished: activeEngine.isFinished(),
      });

      if (activeEngine.isFinished() && !handledFinishRef.current) {
        handledFinishRef.current = true;

        const result = activeEngine.getResult();
        const payload = buildGamePayload(result);

        if (activeEngine.isRoundComplete?.()) {
          setGameState("roundComplete");
          onRoundComplete?.(payload);
          return;
        }

        setGameState("ended");

        if (typeof onOutOfLives === "function") {
          onOutOfLives?.(payload);
          return;
        }

        onGameEnd?.(payload);
        return;
      }

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);

    return () => {
      detachInput?.();

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      engineRef.current = null;
    };
  }, [
    isPlaying,
    gameState,
    level,
    round,
    onGameEnd,
    onRoundComplete,
    onOutOfLives,
    overlayState.exitOpen,
  ]);

  function handleStart() {
    setGameState("live");
    setOverlayState({
      pauseOpen: false,
      exitOpen: false,
    });
  }

  function handlePauseClick() {
    const engine = engineRef.current;
    if (!engine || gameState !== "live") return;

    engine.togglePause();

    const publicState = engine.getPublicState();

    setOverlayState({
      pauseOpen: Boolean(publicState.paused),
      exitOpen: false,
    });
  }

  function handleResume() {
    const engine = engineRef.current;
    if (!engine) return;

    engine.resumeFromPause();

    setOverlayState({
      pauseOpen: false,
      exitOpen: false,
    });
  }

  function handleRequestExit() {
    const engine = engineRef.current;
    if (!engine) return;

    engine.openExitOverlay();

    setOverlayState({
      pauseOpen: false,
      exitOpen: true,
    });
  }

  function handleCancelExit() {
    const engine = engineRef.current;
    if (!engine) return;

    engine.closeExitOverlay();

    setOverlayState({
      pauseOpen: true,
      exitOpen: false,
    });
  }

  function handleConfirmExit() {
    const engine = engineRef.current;

    if (!engine) {
      onGameEnd?.(
        buildGamePayload(
          {
            score: uiState.score,
            round: uiState.round,
            lives: uiState.lives,
          },
          { cleared: false }
        )
      );
      return;
    }

    const result = engine.getResult();
    engine.confirmExit();

    onGameEnd?.(buildGamePayload(result, { cleared: false }));
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-[220px] w-[220px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[10%] h-[220px] w-[220px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[20%] h-[220px] w-[220px] rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 border-b border-cyan-200/10 bg-[linear-gradient(180deg,rgba(5,8,22,0.96),rgba(3,6,18,0.78))] px-3 py-3 shadow-[0_12px_34px_rgba(0,0,0,0.32)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/70">
              Breakerz
            </p>
            <p className="mt-1 text-sm font-black text-white">
              Round {uiState.round}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-cyan-200/10 bg-white/[0.045] px-3 py-2 text-center shadow-[inset_0_0_16px_rgba(34,211,238,0.05)]">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/38">
                Score
              </p>
              <p className="mt-1 text-sm font-black text-cyan-300">
                {Number(uiState.score || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-pink-200/10 bg-white/[0.045] px-3 py-2 text-center shadow-[inset_0_0_16px_rgba(236,72,153,0.05)]">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/38">
                Lives
              </p>
              <p className="mt-1 text-sm font-black text-pink-300">
                {uiState.lives}
              </p>
            </div>

            {gameState === "live" ? (
              <button
                type="button"
                onClick={handlePauseClick}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-xs font-black text-white/72 transition active:scale-[0.98]"
              >
                Pause
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 py-3">
        <canvas
          ref={canvasRef}
          width={BREAKERZ_CANVAS.width}
          height={BREAKERZ_CANVAS.height}
          className="h-full w-full max-h-full max-w-full touch-none rounded-[24px] border border-cyan-400/20 bg-[#050912] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
        />

        <BreakerzPauseOverlay
          open={overlayState.pauseOpen}
          round={uiState.round}
          score={uiState.score}
          lives={uiState.lives}
          onResume={handleResume}
          onExit={handleRequestExit}
        />

        <BreakerzExitOverlay
          open={overlayState.exitOpen}
          score={uiState.score}
          round={uiState.round}
          onCancel={handleCancelExit}
          onConfirmExit={handleConfirmExit}
        />
      </div>

      {gameState === "splash" ? (
        <div className="absolute inset-0 z-40 overflow-hidden rounded-[32px] bg-[#050816]">
          <img
            src={breakerzCover}
            alt="Breakerz Cover"
            className="absolute inset-0 h-full w-full object-contain"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.16)_40%,rgba(2,6,23,0.82)_100%)]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_60%)]" />

          <div
            className={`absolute inset-x-0 bottom-0 flex justify-center px-5 pb-6 transition-all duration-700 ${
              showSplashContent
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="w-full max-w-[340px] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,24,0.84),rgba(4,8,16,0.92))] px-5 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.52)] backdrop-blur-xl">
              <div className="mt-1 text-center">
                <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300/70">
                  Break The Wall
                </p>

                <p className="mt-3 text-sm leading-relaxed text-white/58">
                  Slide the paddle to keep the ball alive. Break every block,
                  build your score, and clear the round to unlock your reward.
                </p>
              </div>

              <div className="mt-6 flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full rounded-full border border-white/45 bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] px-6 py-4 text-lg font-bold tracking-[0.02em] text-white shadow-[0_0_28px_rgba(34,211,238,0.24)] transition active:scale-[0.98]"
                >
                  Start
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="w-full rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-medium text-white/72 transition hover:bg-white/[0.08]"
                >
                  Back to Arcade
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}