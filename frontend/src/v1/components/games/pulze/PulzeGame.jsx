import React, { useEffect, useRef, useState } from "react";

import pulzeCover from "@/assets/games/pulze_game_cover.jpg";

import { PULZE_CANVAS } from "./pulzeConfig";
import { createPulzeEngine } from "./pulzeEngine";
import { renderPulzeFrame } from "./pulzeRenderer";
import { attachPulzeInput } from "./pulzeInput";

export default function PulzeGame({
  onGameEnd,
  onRoundComplete,
  onOutOfLives,
  isPlaying,
  reviveUsed = false,
  level = 1,
  round = 1,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const engineRef = useRef(null);
  const finalResultRef = useRef(null);
  const sessionStartedAtRef = useRef(null);
  const handledFinishRef = useRef(false);
  const previousReviveUsedRef = useRef(Boolean(reviveUsed));

  const [gameState, setGameState] = useState("idle");
  const [showSplashContent, setShowSplashContent] = useState(false);

  const [uiState, setUiState] = useState({
    round: Math.max(1, Number(round) || 1),
    level: Math.max(1, Number(level) || 1),
    score: 0,
    lives: 5,
    streak: 0,
    hits: 0,
    attempts: 0,
    paused: false,
    exitOpen: false,
    finished: false,
    feedback: "TAP ON THE PULZE",
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
      score: Number(result.score ?? uiState.score ?? 0),
      round: Number(result.round ?? uiState.round ?? round ?? 1),
      nextRound: Number(result.nextRound || Number(result.round || round || 1) + 1),
      level: Number(result.level ?? uiState.level ?? level ?? 1),
      cleared: Boolean(overrides.cleared ?? result.cleared),
      lives: Number(result.lives ?? uiState.lives ?? 0),
      hits: Number(result.hits ?? uiState.hits ?? 0),
      attempts: Number(result.attempts ?? uiState.attempts ?? 0),
      baseZpts: Number(result.baseZpts || 0),
      finalZpts: Number(result.finalZpts || result.baseZpts || 0),
      gameId: "pulze",
      game_type: "pulze",
      sessionDurationSeconds: getSessionDurationSeconds(),
      completed: true,
      ...overrides,
    };
  }

  useEffect(() => {
    if (!isPlaying) return;

    setGameState("splash");
    setShowSplashContent(false);
    finalResultRef.current = null;
    handledFinishRef.current = false;
    previousReviveUsedRef.current = Boolean(reviveUsed);

    setUiState({
      round: Math.max(1, Number(round) || 1),
      level: Math.max(1, Number(level) || 1),
      score: 0,
      lives: 5,
      streak: 0,
      hits: 0,
      attempts: 0,
      paused: false,
      exitOpen: false,
      finished: false,
      feedback: "TAP ON THE PULZE",
    });

    const timer = window.setTimeout(() => {
      setShowSplashContent(true);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [isPlaying, level, round]);

  useEffect(() => {
    if (!isPlaying) return;

    const previousReviveUsed = previousReviveUsedRef.current;
    const nextReviveUsed = Boolean(reviveUsed);

    if (!previousReviveUsed && nextReviveUsed && engineRef.current) {
      handledFinishRef.current = false;
      finalResultRef.current = null;
      engineRef.current.reviveWithExtraLife?.();
      setGameState("live");

      setUiState((prev) => ({
        ...prev,
        paused: false,
        exitOpen: false,
        finished: false,
      }));
    }

    previousReviveUsedRef.current = nextReviveUsed;
  }, [isPlaying, reviveUsed]);

  useEffect(() => {
    if (gameState !== "live") return undefined;

    if (!sessionStartedAtRef.current) {
      sessionStartedAtRef.current = Date.now();
    }

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const engine = createPulzeEngine({
      startingLevel: Math.max(1, Number(level) || 1),
      startingRound: Math.max(1, Number(round) || 1),
    });

    engineRef.current = engine;
    finalResultRef.current = null;
    handledFinishRef.current = false;

    const detachInput = attachPulzeInput({
      canvas,
      onTrigger: () => engine.trigger(),
      onTogglePause: () => {
        engine.togglePause();

        const publicState = engine.getPublicState();

        setGameState(publicState.paused ? "paused" : "live");
        setUiState((prev) => ({
          ...prev,
          ...publicState,
          exitOpen: false,
        }));
      },
    });

    let mounted = true;

    const loop = (time) => {
      if (!mounted) return;

      const activeEngine = engineRef.current;
      if (!activeEngine) return;

      const frame = activeEngine.tick(time);
      renderPulzeFrame(ctx, frame);

      const publicState = activeEngine.getPublicState();

      setUiState((prev) => ({
        ...prev,
        ...publicState,
      }));

      if (activeEngine.isFinished() && !handledFinishRef.current) {
        handledFinishRef.current = true;

        const result = activeEngine.getResult();
        const payload = buildGamePayload(result);

        finalResultRef.current = payload;

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
      mounted = false;
      detachInput?.();

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      engineRef.current = null;
    };
  }, [gameState, level, round, onGameEnd, onRoundComplete, onOutOfLives]);

  function handleStart() {
    finalResultRef.current = null;
    handledFinishRef.current = false;
    sessionStartedAtRef.current = Date.now();

    setGameState("live");
    setUiState((prev) => ({
      ...prev,
      score: 0,
      lives: 5,
      streak: 0,
      hits: 0,
      attempts: 0,
      paused: false,
      exitOpen: false,
      finished: false,
      feedback: "TAP ON THE PULZE",
    }));
  }

  function handlePause() {
    const engine = engineRef.current;
    if (!engine || gameState !== "live") return;

    engine.togglePause();

    const publicState = engine.getPublicState();

    setGameState(publicState.paused ? "paused" : "live");
    setUiState((prev) => ({
      ...prev,
      ...publicState,
      exitOpen: false,
    }));
  }

  function handleResume() {
    const engine = engineRef.current;
    if (!engine) return;

    engine.resumeFromPause();

    setGameState("live");
    setUiState((prev) => ({
      ...prev,
      paused: false,
      exitOpen: false,
    }));
  }

  function handleRequestExit() {
    const engine = engineRef.current;

    engine?.openExitOverlay?.();

    setGameState("paused");
    setUiState((prev) => ({
      ...prev,
      paused: true,
      exitOpen: true,
    }));
  }

  function handleCancelExit() {
    setUiState((prev) => ({
      ...prev,
      exitOpen: false,
    }));
  }

  function handleConfirmExit() {
    const engine = engineRef.current;
    const result = engine?.getResult?.() || finalResultRef.current || {};

    engine?.confirmExit?.();

    onGameEnd?.(buildGamePayload(result, { cleared: false }));
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-[220px] w-[220px] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[10%] h-[220px] w-[220px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[20%] h-[220px] w-[220px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 border-b border-fuchsia-200/10 bg-[linear-gradient(180deg,rgba(5,8,22,0.96),rgba(3,6,18,0.78))] px-3 py-3 shadow-[0_12px_34px_rgba(0,0,0,0.32)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-300/70">
              Pulze
            </p>
            <p className="mt-1 text-sm font-black text-white">
              Round {uiState.round}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-fuchsia-200/10 bg-white/[0.045] px-3 py-2 text-center">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/38">
                Score
              </p>
              <p className="mt-1 text-sm font-black text-fuchsia-300">
                {Number(uiState.score || 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-200/10 bg-white/[0.045] px-3 py-2 text-center">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/38">
                Lives
              </p>
              <p className="mt-1 text-sm font-black text-cyan-300">
                {uiState.lives}
              </p>
            </div>

            {gameState === "live" ? (
              <button
                type="button"
                onClick={handlePause}
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
          width={PULZE_CANVAS.width}
          height={PULZE_CANVAS.height}
          className="h-full w-full max-h-full max-w-[360px] touch-none rounded-[24px] border border-fuchsia-400/20 bg-[#050912] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
        />

        {gameState === "paused" && !uiState.exitOpen ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
            <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.10),transparent_35%),linear-gradient(180deg,rgba(11,18,28,0.96),rgba(7,11,18,0.98))] p-5 text-white">
              <p className="text-[11px] uppercase tracking-[0.24em] text-fuchsia-300/70">
                Paused
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    Round
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {uiState.round}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    Score
                  </p>
                  <p className="mt-1 text-sm font-semibold text-fuchsia-300">
                    {Number(uiState.score || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">
                    Lives
                  </p>
                  <p className="mt-1 text-sm font-semibold text-cyan-300">
                    {uiState.lives}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleResume}
                  className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(236,72,153,1),rgba(168,85,247,0.95),rgba(34,211,238,1))] px-5 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
                >
                  Resume
                </button>

                <button
                  type="button"
                  onClick={handleRequestExit}
                  className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75"
                >
                  Exit Session
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {uiState.exitOpen ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
            <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.10),transparent_35%),linear-gradient(180deg,rgba(16,10,18,0.96),rgba(8,8,12,0.98))] p-5 text-white">
              <p className="text-[11px] uppercase tracking-[0.24em] text-pink-300/75">
                Exit Game
              </p>

              <h3 className="mt-2 text-lg font-semibold text-white">
                Leave Pulze?
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Your current session will end if you exit now.
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleCancelExit}
                  className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75"
                >
                  Back to Game
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(244,114,182,0.95),rgba(239,68,68,0.95))] px-5 py-3.5 text-base font-semibold text-white"
                >
                  Confirm Exit
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {gameState === "splash" ? (
        <div className="absolute inset-0 z-40 overflow-hidden rounded-[32px] bg-[#050816]">
          <img
            src={pulzeCover}
            alt="Pulze Cover"
            className="absolute inset-0 h-full w-full object-contain"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.16)_40%,rgba(2,6,23,0.82)_100%)]" />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.08),transparent_60%)]" />

          <div
            className={`absolute inset-x-0 bottom-0 flex justify-center px-5 pb-6 transition-all duration-700 ${
              showSplashContent
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="w-full max-w-[340px] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,24,0.84),rgba(4,8,16,0.92))] px-5 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.52)] backdrop-blur-xl">
              <div className="mt-1 text-center">
                <p className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-300/70">
                  Hit The Core
                </p>

                <p className="mt-3 text-sm leading-relaxed text-white/58">
                  Tap when the moving Pulze lands inside the glowing core.
                  Land enough hits to clear the round and unlock your reward.
                </p>
              </div>

              <div className="mt-6 flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full rounded-full border border-white/45 bg-[linear-gradient(90deg,rgba(236,72,153,1),rgba(168,85,247,0.95),rgba(34,211,238,1))] px-6 py-4 text-lg font-bold text-white transition active:scale-[0.98]"
                >
                  Start
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="w-full rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-medium text-white/72"
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