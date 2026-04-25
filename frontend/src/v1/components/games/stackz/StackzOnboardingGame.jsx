import React, { useEffect, useRef, useState } from "react";
import stackzLogo from "@/assets/games/stackz_game_logo.PNG";
import { STACKZ_CANVAS } from "./stackzConfig";
import { createStackzEngine } from "./StackzEngine";
import { renderStackzFrame } from "./stackzRenderer";
import { attachStackzInput } from "./stackzInput";

const ONBOARDING_REWARD_ZPTS = 50;
const ONBOARDING_DROP_SPEED_MULTIPLIER = 0.72;

export default function StackzOnboardingGame({
  onGameEnd,
  isPlaying,
  level = 1,
  round = 1,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const engineRef = useRef(null);
  const endedRef = useRef(false);

  const [gameState, setGameState] = useState("idle");
  const [uiState, setUiState] = useState({
    round: Math.max(1, Number(round) || 1),
    level: Math.max(1, Number(level) || 1),
    score: 0,
    lines: 0,
    finished: false,
  });

  useEffect(() => {
    if (!isPlaying) return;

    endedRef.current = false;
    setGameState("splash");
  }, [isPlaying]);

  useEffect(() => {
    if (gameState !== "live") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = createStackzEngine({
      startingLevel: Math.max(1, Number(level) || 1),
      startingRound: Math.max(1, Number(round) || 1),
      dropSpeedMultiplier: ONBOARDING_DROP_SPEED_MULTIPLIER,
    });

    engineRef.current = engine;

    const detachInput = attachStackzInput({
      canvas,
      onMoveLeft: () => engine.moveLeft(),
      onMoveRight: () => engine.moveRight(),
      onRotate: () => engine.rotateActive(),
      onSoftDropStart: () => engine.softDropStart(),
      onSoftDropStop: () => engine.softDropStop(),
      onHardDrop: () => engine.hardDrop(),
      onTogglePause: () => {},
    });

    let mounted = true;

    const finishOnboardingRound = () => {
      if (endedRef.current) return;

      endedRef.current = true;

      const result = engine.getResult();

      setGameState("finished");
      setUiState((prev) => ({
        ...prev,
        score: result.score,
        round: result.round,
        level: result.level,
        lines: result.lines,
        finished: true,
      }));

      onGameEnd?.({
        score: result.score,
        round: result.round,
        level: result.level,
        cleared: false,
        lines: result.lines,
        gameId: "stackz",
        onboarding: true,
        zpts: ONBOARDING_REWARD_ZPTS,
      });
    };

    const loop = (ts) => {
      if (!mounted) return;

      const activeEngine = engineRef.current;
      if (!activeEngine) return;

      const frame = activeEngine.tick(ts);
      renderStackzFrame(ctx, frame);

      setUiState((prev) => ({
        ...prev,
        round: frame.round,
        level: frame.level,
        score: frame.score,
        lines: frame.lines,
        finished: frame.finished,
      }));

      if (activeEngine.isFinished()) {
        finishOnboardingRound();
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
  }, [gameState, level, round, onGameEnd]);

  const handleStart = () => {
    setGameState("live");
    setUiState((prev) => ({
      ...prev,
      finished: false,
    }));
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-8%] h-[220px] w-[220px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[10%] h-[220px] w-[220px] rounded-full bg-pink-500/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[20%] h-[220px] w-[220px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 grid grid-cols-3 items-center border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-violet-300/70">
            Stackz
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            Round {uiState.round}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Score
          </p>
          <p className="mt-1 text-sm font-semibold text-violet-300">
            {Number(uiState.score || 0).toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Reward
          </p>
          <p className="mt-1 text-sm font-semibold text-cyan-300">
            +{ONBOARDING_REWARD_ZPTS} zPts
          </p>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={STACKZ_CANVAS.width}
          height={STACKZ_CANVAS.height}
          className="h-full w-full bg-[#050912] object-contain touch-none"
        />

        {gameState === "splash" ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
            <div className="w-full max-w-[320px] rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl">
              <img
                src={stackzLogo}
                alt="Stackz"
                className="mx-auto mb-8 w-[230px] max-w-[82%] object-contain drop-shadow-[0_0_36px_rgba(168,85,247,0.28)]"
              />

              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
                Ready
              </p>

              <button
                type="button"
                onClick={handleStart}
                className="mt-7 min-w-[170px] rounded-[18px] bg-[linear-gradient(90deg,rgba(168,85,247,1),rgba(236,72,153,0.95),rgba(34,211,238,1))] px-6 py-2.5 text-base font-semibold tracking-[0.02em] text-white transition active:scale-[0.98]"
              >
                Start
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}