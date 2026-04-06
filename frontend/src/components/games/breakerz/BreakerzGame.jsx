import React, { useEffect, useRef, useState } from "react";
import { BREAKERZ_CANVAS } from "./breakerzConfig";
import { attachBreakerzInput } from "./breakerzInput";
import { createBreakerzEngine } from "./breakerzEngine";
import { renderBreakerzFrame } from "./breakerzRenderer";
import BreakerzPauseOverlay from "./breakerzPauseOverlay";
import BreakerzExitOverlay from "./breakerzExitOverlay";

export default function BreakerzGame({
  onGameEnd,
  isPlaying,
  level = 1,
  round = 1,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const engineRef = useRef(null);

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

  useEffect(() => {
    if (!isPlaying) return undefined;

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

      if (activeEngine.isFinished()) {
        const result = activeEngine.getResult();
        onGameEnd?.({
          score: result.score,
          round: result.round,
          cleared: result.cleared,
          level: Math.max(1, Number(level) || 1),
          lives: result.lives,
          gameId: "breakerz",
        });
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
  }, [isPlaying, level, round, onGameEnd, overlayState.exitOpen]);

  const handlePauseClick = () => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.togglePause();

    const publicState = engine.getPublicState();

    setOverlayState({
      pauseOpen: Boolean(publicState.paused),
      exitOpen: false,
    });
  };

  const handleResume = () => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.resumeFromPause();

    setOverlayState({
      pauseOpen: false,
      exitOpen: false,
    });
  };

  const handleRequestExit = () => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.openExitOverlay();

    setOverlayState({
      pauseOpen: false,
      exitOpen: true,
    });
  };

  const handleCancelExit = () => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.closeExitOverlay();

    setOverlayState({
      pauseOpen: true,
      exitOpen: false,
    });
  };

  const handleConfirmExit = () => {
    const engine = engineRef.current;
    if (!engine) {
      onGameEnd?.({
        score: uiState.score,
        round: uiState.round,
        level: Math.max(1, Number(level) || 1),
        cleared: false,
        lives: uiState.lives,
        gameId: "breakerz",
      });
      return;
    }

    const result = engine.getResult();
    engine.confirmExit();

    onGameEnd?.({
      score: result.score,
      round: result.round,
      level: Math.max(1, Number(level) || 1),
      cleared: false,
      lives: result.lives,
      gameId: "breakerz",
    });
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050816]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-[220px] w-[220px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[10%] h-[220px] w-[220px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[20%] h-[220px] w-[220px] rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/70">
            Breakerz
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            Round {uiState.round}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Score
          </p>
          <p className="mt-1 text-sm font-semibold text-cyan-300">
            {Number(uiState.score || 0).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Lives
            </p>
            <p className="mt-1 text-sm font-semibold text-pink-300">
              {uiState.lives}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePauseClick}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Pause
          </button>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 py-3">
        <canvas
          ref={canvasRef}
          width={BREAKERZ_CANVAS.width}
          height={BREAKERZ_CANVAS.height}
          className="h-full w-full max-h-full max-w-full rounded-[24px] border border-cyan-400/20 bg-[#050912] shadow-[0_20px_60px_rgba(0,0,0,0.35)] touch-none"
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
    </div>
  );
}