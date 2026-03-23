import React, { useEffect, useRef } from "react";

export default function BricklesGame({
  onGameEnd,
  isPlaying,
  level = 1,
  round = 1,
}) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    const safeLevel = Math.max(1, level);
    const safeRound = Math.max(1, round);

    const ballSpeed = 4 + safeLevel * 0.45 + safeRound * 0.15;
    const brickRows = Math.min(4 + Math.floor(safeLevel / 2) + (safeRound - 1), 8);
    const brickCols = 7;
    const brickWidth = (width - 30) / brickCols;
    const brickHeight = 18;

    const game = {
      paddle: {
        x: width / 2 - 40,
        y: height - 28,
        width: Math.max(52, 84 - safeLevel * 2 - safeRound),
        height: 10,
      },
      ball: {
        x: width / 2,
        y: height - 50,
        dx: ballSpeed,
        dy: -ballSpeed,
        radius: 7,
      },
      bricks: [],
      score: 0,
      blocksDestroyed: 0,
      lives: 3,
      isRunning: true,
    };

    for (let row = 0; row < brickRows; row++) {
      for (let col = 0; col < brickCols; col++) {
        game.bricks.push({
          x: 15 + col * brickWidth,
          y: 34 + row * (brickHeight + 4),
          width: brickWidth - 4,
          height: brickHeight,
          alive: true,
          color: `hsl(${185 + row * 22}, 100%, ${58 - row * 4}%)`,
        });
      }
    }

    const clampPaddle = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      game.paddle.x = Math.max(
        0,
        Math.min(width - game.paddle.width, x - game.paddle.width / 2)
      );
    };

    const handleTouch = (e) => {
      e.preventDefault();
      if (!e.touches?.[0]) return;
      clampPaddle(e.touches[0].clientX);
    };

    const handleMouse = (e) => {
      clampPaddle(e.clientX);
    };

    canvas.addEventListener("touchmove", handleTouch, { passive: false });
    canvas.addEventListener("mousemove", handleMouse);

    const finishGame = (cleared) => {
      game.isRunning = false;
      onGameEnd?.({
        score: game.score,
        blocksDestroyed: game.blocksDestroyed,
        level: safeLevel,
        round: safeRound,
        cleared,
      });
    };

    const update = () => {
      if (!game.isRunning) return;

      game.ball.x += game.ball.dx;
      game.ball.y += game.ball.dy;

      if (
        game.ball.x <= game.ball.radius ||
        game.ball.x >= width - game.ball.radius
      ) {
        game.ball.dx *= -1;
      }

      if (game.ball.y <= game.ball.radius) {
        game.ball.dy *= -1;
      }

      if (
        game.ball.y + game.ball.radius >= game.paddle.y &&
        game.ball.y - game.ball.radius <= game.paddle.y + game.paddle.height &&
        game.ball.x >= game.paddle.x &&
        game.ball.x <= game.paddle.x + game.paddle.width
      ) {
        game.ball.dy = -Math.abs(game.ball.dy);
        const hitPos = (game.ball.x - game.paddle.x) / game.paddle.width;
        game.ball.dx = (ballSpeed + 2) * (hitPos - 0.5);
      }

      game.bricks.forEach((brick) => {
        if (!brick.alive) return;

        if (
          game.ball.x >= brick.x &&
          game.ball.x <= brick.x + brick.width &&
          game.ball.y - game.ball.radius <= brick.y + brick.height &&
          game.ball.y + game.ball.radius >= brick.y
        ) {
          brick.alive = false;
          game.ball.dy *= -1;
          game.score += 10 + safeLevel * 2 + safeRound;
          game.blocksDestroyed += 1;
        }
      });

      if (game.ball.y > height) {
        game.lives -= 1;

        if (game.lives <= 0) {
          finishGame(false);
          return;
        }

        game.ball.x = width / 2;
        game.ball.y = height - 50;
        game.ball.dx = ballSpeed;
        game.ball.dy = -ballSpeed;
      }

      if (game.bricks.every((brick) => !brick.alive)) {
        game.score += 450 + safeLevel * 80 + safeRound * 40;
        finishGame(true);
      }
    };

    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#0a1320");
      gradient.addColorStop(0.6, "#08111c");
      gradient.addColorStop(1, "#070d16");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(255,255,255,0.05)";
      for (let i = 0; i < 24; i += 1) {
        const x = (i * 41) % width;
        const y = (i * 29) % height;
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawBricks = () => {
      game.bricks.forEach((brick) => {
        if (!brick.alive) return;
        ctx.shadowColor = brick.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      });
    };

    const drawPaddle = () => {
      ctx.shadowColor = "#22d3ee";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#67e8f9";
      ctx.fillRect(
        game.paddle.x,
        game.paddle.y,
        game.paddle.width,
        game.paddle.height
      );
      ctx.shadowBlur = 0;
    };

    const drawBall = () => {
      ctx.beginPath();
      ctx.shadowColor = "#c084fc";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#e879f9";
      ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawHud = () => {
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Score ${game.score}`, 14, 18);
      ctx.fillText(`Level ${safeLevel}`, 126, 18);
      ctx.fillText(`Round ${safeRound}`, 222, 18);

      ctx.fillStyle = "#fda4af";
      ctx.font = "13px sans-serif";
      ctx.fillText("♥".repeat(game.lives), width - 38, 18);
    };

    const draw = () => {
      drawBackground();
      drawBricks();
      drawPaddle();
      drawBall();
      drawHud();
    };

    const loop = () => {
      update();
      draw();

      if (game.isRunning) {
        animationRef.current = requestAnimationFrame(loop);
      }
    };

    loop();

    return () => {
      canvas.removeEventListener("touchmove", handleTouch);
      canvas.removeEventListener("mousemove", handleMouse);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, level, round, onGameEnd]);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/70">
            Brickles
          </p>
          <p className="text-sm font-semibold text-white">Neon Wall Breaker</p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Session
          </p>
          <p className="text-sm font-medium text-cyan-300">
            L{level} • R{round}
          </p>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={320}
        height={400}
        className="w-full max-w-[340px] rounded-[24px] border border-cyan-400/20 bg-[#08111c] shadow-[0_12px_40px_rgba(0,0,0,0.28)] touch-none"
      />
    </div>
  );
}