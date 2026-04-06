import React, { useEffect, useRef, useState } from "react";

export default function BreakerzGame({
  onGameEnd,
  isPlaying,
  level = 1,
  round = 1,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const [gameState, setGameState] = useState("idle"); 
  // idle → playing → paused → gameover → exit

  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(round);

  // =========================
  // CORE GAME LOOP (TEMP BASE)
  // =========================
  useEffect(() => {
    if (!isPlaying) return;

    setGameState("playing");
  }, [isPlaying]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;

    let ball = {
      x: width / 2,
      y: height - 60,
      dx: 3 + currentRound * 0.2,
      dy: -3 - currentRound * 0.2,
      r: 7,
    };

    let paddle = {
      w: 90 - currentRound * 2,
      h: 10,
      x: width / 2 - 45,
      y: height - 30,
    };

    const handleMove = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;

      paddle.x = Math.max(
        0,
        Math.min(width - paddle.w, x - paddle.w / 2)
      );
    };

    const handleTouch = (e) => {
      e.preventDefault();
      if (!e.touches?.[0]) return;
      handleMove(e.touches[0].clientX);
    };

    const handleMouse = (e) => {
      handleMove(e.clientX);
    };

    canvas.addEventListener("touchmove", handleTouch, { passive: false });
    canvas.addEventListener("mousemove", handleMouse);

    const loop = () => {
      if (gameState !== "playing") return;

      // movement
      ball.x += ball.dx;
      ball.y += ball.dy;

      // walls
      if (ball.x <= ball.r || ball.x >= width - ball.r) ball.dx *= -1;
      if (ball.y <= ball.r) ball.dy *= -1;

      // paddle
      if (
        ball.y + ball.r >= paddle.y &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.w
      ) {
        ball.dy = -Math.abs(ball.dy);
      }

      // miss
      if (ball.y > height) {
        setLives((prev) => {
          const next = prev - 1;

          if (next <= 0) {
            setGameState("gameover");
            onGameEnd?.({ score, round: currentRound });
          }

          return next;
        });

        ball.x = width / 2;
        ball.y = height - 60;
      }

      // draw
      ctx.fillStyle = "#060b14";
      ctx.fillRect(0, 0, width, height);

      // paddle
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

      // ball
      ctx.beginPath();
      ctx.fillStyle = "#c084fc";
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      canvas.removeEventListener("touchmove", handleTouch);
      canvas.removeEventListener("mousemove", handleMouse);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, currentRound, score, isPlaying, onGameEnd]);

  // =========================
  // CONTROLS
  // =========================
  const handlePause = () => {
    if (gameState === "playing") setGameState("paused");
  };

  const handleResume = () => {
    setGameState("playing");
  };

  const handleExit = () => {
    setGameState("exit");
    onGameEnd?.({ score, round: currentRound });
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="relative flex w-full flex-col items-center justify-center">
      {/* HUD */}
      <div className="mb-3 flex w-full max-w-[360px] items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">
            Breakerz
          </p>
          <p className="text-sm font-semibold text-white">
            Round {currentRound}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-white/50">Score</p>
          <p className="text-sm font-semibold text-cyan-300">{score}</p>
        </div>

        <button
          onClick={handlePause}
          className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70"
        >
          Pause
        </button>
      </div>

      {/* GAME */}
      <canvas
        ref={canvasRef}
        width={340}
        height={420}
        className="w-full max-w-[360px] rounded-2xl border border-cyan-400/20 bg-black"
      />

      {/* PAUSE */}
      {gameState === "paused" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-center">
            <p className="mb-4 text-white">Paused</p>
            <button onClick={handleResume} className="mb-2 text-cyan-300">
              Resume
            </button>
            <br />
            <button onClick={handleExit} className="text-red-400">
              Exit
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {gameState === "gameover" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-center">
            <p className="text-white text-lg">Game Over</p>
            <p className="text-sm text-white/60 mt-2">Score: {score}</p>
            <button
              onClick={handleExit}
              className="mt-4 text-cyan-300"
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}