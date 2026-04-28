import React, { useEffect, useRef, useState } from "react";
import pulzeLogo from "@/assets/games/pulze_game_logo.png";
import { PULZE_CANVAS } from "./pulzeConfig";
import { createPulzeEngine } from "./pulzeEngine";
import { renderPulzeFrame } from "./pulzeRenderer";
import { attachPulzeInput } from "./pulzeInput";

export default function PulzeGame({
  onGameEnd,
  isPlaying,
  level = 1,
  round = 1,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const engineRef = useRef(null);
  const finalResultRef = useRef(null);

  const [gameState, setGameState] = useState("idle");
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

  useEffect(() => {
    if (!isPlaying) return;
    setGameState("splash");
  }, [isPlaying]);

  useEffect(() => {
    if (gameState !== "live") return undefined;

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

      if (activeEngine.isFinished()) {
        const result = activeEngine.getResult();

        finalResultRef.current = {
          score: result.score,
          round: result.round,
          level: result.level,
          cleared: Boolean(result.cleared),
          lives: result.lives,
          hits: result.hits,
          attempts: result.attempts,
          gameId: "pulze",
        };

        setGameState("ended");
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
  }, [gameState, level, round]);

  const handleStart = () => {
    finalResultRef.current = null;

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
  };

  const handlePause = () => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.togglePause();

    const publicState = engine.getPublicState();

    setGameState(publicState.paused ? "paused" : "live");
    setUiState((prev) => ({
      ...prev,
      ...publicState,
      exitOpen: false,
    }));
  };

  const handleResume = () => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.resumeFromPause();

    setGameState("live");
    setUiState((prev) => ({
      ...prev,
      paused: false,
      exitOpen: false,
    }));
  };

  const handleRequestExit = () => {
    const engine = engineRef.current;

    engine?.openExitOverlay?.();

    setGameState("paused");
    setUiState((prev) => ({
      ...prev,
      paused: true,
      exitOpen: true,
    }));
  };

  const handleCancelExit = () => {
    setUiState((prev) => ({
      ...prev,
      exitOpen: false,
    }));
  };

  const handleConfirmExit = () => {
    const engine = engineRef.current;
    const result = engine?.getResult?.() || finalResultRef.current || {};

    engine?.confirmExit?.();

    onGameEnd?.({
      score: result.score ?? uiState.score,
      round: result.round ?? uiState.round,
      level: result.level ?? uiState.level,
      cleared: false,
      lives: result.lives ?? uiState.lives,
      hits: result.hits ?? uiState.hits,
      attempts: result.attempts ?? uiState.attempts,
      gameId: "pulze",
    });
  };

  const handleRestart = () => {
    finalResultRef.current = null;
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
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050816]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-[220px] w-[220px] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[10%] h-[220px] w-[220px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[20%] h-[220px] w-[220px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-fuchsia-300/70">
            Pulze
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            Round {uiState.round}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Score
          </p>
          <p className="mt-1 text-sm font-semibold text-fuchsia-300">
            {Number(uiState.score || 0).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Lives
            </p>
            <p className="mt-1 text-sm font-semibold text-cyan-300">
              {uiState.lives}
            </p>
          </div>

          {gameState === "live" ? (
            <button
              type="button"
              onClick={handlePause}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Pause
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 py-3">
        <canvas
          ref={canvasRef}
          width={PULZE_CANVAS.width}
          height={PULZE_CANVAS.height}
          className="h-full w-full max-h-full max-w-[360px] rounded-[24px] border border-fuchsia-400/20 bg-[#050912] shadow-[0_20px_60px_rgba(0,0,0,0.35)] touch-none"
        />

        {gameState === "splash" ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
            <div className="w-full max-w-[320px] rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl">
              <img
                src={pulzeLogo}
                alt="Pulze"
                className="mx-auto mb-6 h-24 object-contain drop-shadow-[0_0_32px_rgba(236,72,153,0.20)]"
              />

              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                How to Play
              </p>

              <p className="mx-auto mt-3 max-w-[240px] text-sm leading-relaxed text-white/68">
                Tap the screen, Space, or Enter when the moving Pulze lands
                inside the glowing core.
              </p>

              <div className="mt-7 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleStart}
                  className="min-w-[170px] rounded-[18px] bg-[linear-gradient(90deg,rgba(236,72,153,1),rgba(168,85,247,0.95),rgba(34,211,238,1))] px-6 py-2.5 text-base font-semibold tracking-[0.02em] text-white transition active:scale-[0.98]"
                >
                  Start
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="min-w-[170px] rounded-[18px] border border-white/10 bg-white/[0.05] px-6 py-2.5 text-sm font-medium text-white/72 transition hover:bg-white/[0.08]"
                >
                  Back to Arcade
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {gameState === "paused" && !uiState.exitOpen ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
            <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.10),transparent_35%),linear-gradient(180deg,rgba(11,18,28,0.96),rgba(7,11,18,0.98))] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
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
                  className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
                >
                  Exit Session
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {uiState.exitOpen ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
            <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.10),transparent_35%),linear-gradient(180deg,rgba(16,10,18,0.96),rgba(8,8,12,0.98))] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.50)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-pink-300/75">
                Exit Game
              </p>

              <h3 className="mt-2 text-lg font-semibold text-white">
                Leave Pulze?
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Your current session will end if you exit now.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
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
                    Round
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {uiState.round}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleCancelExit}
                  className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
                >
                  Back to Game
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(244,114,182,0.95),rgba(239,68,68,0.95))] px-5 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
                >
                  Confirm Exit
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {gameState === "ended" ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
            <div className="w-full max-w-[320px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.12),transparent_35%),linear-gradient(180deg,rgba(11,18,28,0.96),rgba(7,11,18,0.98))] p-5 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-fuchsia-300/70">
                Session Complete
              </p>

              <h3 className="mt-2 text-lg font-semibold text-white">
                Pulze Finished
              </h3>

              <p className="mt-2 text-sm text-white/60">
                Score: {Number(uiState.score || 0).toLocaleString()} • Hits{" "}
                {uiState.hits} / {uiState.attempts}
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex w-full items-center justify-center rounded-[20px] bg-[linear-gradient(90deg,rgba(236,72,153,1),rgba(168,85,247,0.95),rgba(34,211,238,1))] px-5 py-3.5 text-base font-semibold text-white transition active:scale-[0.98]"
                >
                  Restart
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="flex w-full items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/75 transition hover:bg-white/[0.08]"
                >
                  Back to Arcade
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
