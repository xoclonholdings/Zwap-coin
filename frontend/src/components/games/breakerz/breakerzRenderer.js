import { formatScore } from "./breakerzUtils";

function drawBackground(ctx, width, height, round) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#07111b");
  gradient.addColorStop(0.55, "#08101a");
  gradient.addColorStop(1, "#050912");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const glowA = ctx.createRadialGradient(
    width * 0.22,
    height * 0.14,
    10,
    width * 0.22,
    height * 0.14,
    140
  );
  glowA.addColorStop(0, "rgba(34,211,238,0.16)");
  glowA.addColorStop(1, "rgba(34,211,238,0)");

  const glowB = ctx.createRadialGradient(
    width * 0.78,
    height * 0.22,
    10,
    width * 0.78,
    height * 0.22,
    150
  );
  glowB.addColorStop(0, "rgba(168,85,247,0.14)");
  glowB.addColorStop(1, "rgba(168,85,247,0)");

  const glowC = ctx.createRadialGradient(
    width * 0.5,
    height * 0.92,
    10,
    width * 0.5,
    height * 0.92,
    170
  );
  glowC.addColorStop(0, "rgba(236,72,153,0.10)");
  glowC.addColorStop(1, "rgba(236,72,153,0)");

  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = glowC;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  ctx.lineWidth = 1;

  for (let y = 0; y < height; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  for (let x = 0; x < width; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.045)";
  for (let i = 0; i < 28; i += 1) {
    const px = (i * 37 + round * 11) % width;
    const py = (i * 23 + round * 17) % height;
    ctx.beginPath();
    ctx.arc(px, py, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTopLane(ctx, width) {
  const laneHeight = 40;

  const laneGradient = ctx.createLinearGradient(0, 0, width, 0);
  laneGradient.addColorStop(0, "rgba(255,255,255,0.03)");
  laneGradient.addColorStop(0.5, "rgba(255,255,255,0.06)");
  laneGradient.addColorStop(1, "rgba(255,255,255,0.03)");

  ctx.fillStyle = laneGradient;
  ctx.fillRect(0, 0, width, laneHeight);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.moveTo(0, laneHeight + 0.5);
  ctx.lineTo(width, laneHeight + 0.5);
  ctx.stroke();
}

function drawBrickBody(ctx, brick) {
  const fill = ctx.createLinearGradient(
    brick.x,
    brick.y,
    brick.x,
    brick.y + brick.height
  );
  fill.addColorStop(0, brick.color);
  fill.addColorStop(1, "rgba(255,255,255,0.18)");

  ctx.shadowColor = brick.glow || brick.color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = fill;
  ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  ctx.strokeRect(brick.x + 0.5, brick.y + 0.5, brick.width - 1, brick.height - 1);
}

function drawBrickHp(ctx, brick) {
  if (brick.maxHp <= 1) return;

  const barX = brick.x + 4;
  const barY = brick.y + brick.height - 5;
  const barW = brick.width - 8;
  const barH = 2.5;

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(barX, barY, barW, barH);

  const hpRatio = Math.max(0, brick.hp) / brick.maxHp;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillRect(barX, barY, barW * hpRatio, barH);
}

function drawBricks(ctx, bricks = []) {
  bricks.forEach((brick) => {
    if (!brick.alive) return;
    drawBrickBody(ctx, brick);
    drawBrickHp(ctx, brick);
  });
}

function drawPaddle(ctx, paddle) {
  const paddleGradient = ctx.createLinearGradient(
    paddle.x,
    paddle.y,
    paddle.x,
    paddle.y + paddle.height
  );
  paddleGradient.addColorStop(0, "#8cf3ff");
  paddleGradient.addColorStop(1, "#22d3ee");

  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 16;
  ctx.fillStyle = paddleGradient;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(paddle.x + 8, paddle.y + 2, paddle.width - 16, 2);
}

function drawBall(ctx, ball) {
  const ballGradient = ctx.createRadialGradient(
    ball.x - 2,
    ball.y - 2,
    1,
    ball.x,
    ball.y,
    ball.radius
  );
  ballGradient.addColorStop(0, "#ffffff");
  ballGradient.addColorStop(0.35, "#f0abfc");
  ballGradient.addColorStop(1, "#c084fc");

  ctx.beginPath();
  ctx.shadowColor = "#c084fc";
  ctx.shadowBlur = 18;
  ctx.fillStyle = ballGradient;
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawHud(ctx, {
  score = 0,
  round = 1,
  lives = 5,
  pattern = "full",
}) {
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 12px sans-serif";
  ctx.fillText(`Score ${formatScore(score)}`, 14, 17);

  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.font = "500 11px sans-serif";
  ctx.fillText(`Round ${round}`, 138, 17);

  ctx.fillStyle = "rgba(255,255,255,0.50)";
  ctx.fillText(String(pattern).replace("-", " "), 196, 17);

  ctx.fillStyle = "#fb7185";
  ctx.font = "600 13px sans-serif";
  ctx.fillText("♥".repeat(Math.max(0, lives)), Math.max(250, 330 - lives * 10), 17);
}

function drawRoundIntro(ctx, width, height, round) {
  ctx.fillStyle = "rgba(3,6,12,0.38)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.font = "700 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Round ${round}`, width / 2, height / 2 - 6);

  ctx.fillStyle = "rgba(255,255,255,0.56)";
  ctx.font = "500 13px sans-serif";
  ctx.fillText("Get ready", width / 2, height / 2 + 22);

  ctx.textAlign = "start";
}

function drawPausedState(ctx, width, height) {
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.font = "700 24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Paused", width / 2, height / 2 - 2);

  ctx.fillStyle = "rgba(255,255,255,0.56)";
  ctx.font = "500 12px sans-serif";
  ctx.fillText("Resume or exit from the overlay", width / 2, height / 2 + 22);

  ctx.textAlign = "start";
}

export function renderBreakerzFrame(ctx, frame) {
  const {
    width = 340,
    height = 420,
    round = 1,
    score = 0,
    lives = 5,
    pattern = "full",
    paddle,
    ball,
    bricks = [],
    showRoundIntro = false,
    paused = false,
  } = frame || {};

  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  drawBackground(ctx, width, height, round);
  drawTopLane(ctx, width);
  drawBricks(ctx, bricks);

  if (paddle) drawPaddle(ctx, paddle);
  if (ball) drawBall(ctx, ball);

  drawHud(ctx, {
    score,
    round,
    lives,
    pattern,
  });

  if (showRoundIntro) {
    drawRoundIntro(ctx, width, height, round);
  }

  if (paused) {
    drawPausedState(ctx, width, height);
  }
}