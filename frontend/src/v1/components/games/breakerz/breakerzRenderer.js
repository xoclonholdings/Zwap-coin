import { formatScore } from "./breakerzUtils";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getEventAge(event, time = 0) {
  return Math.max(0, Number(time || 0) - Number(event?.createdAt || 0));
}

function drawRoundedRect(ctx, x, y, width, height, radius = 8) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height
  );
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function drawBackground(ctx, width, height, round, time = 0) {
  const pulse = Math.sin(time / 900 + round * 0.35) * 0.5 + 0.5;

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#070022");
  gradient.addColorStop(0.35, "#090b2d");
  gradient.addColorStop(0.72, "#12051f");
  gradient.addColorStop(1, "#040711");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const glowA = ctx.createRadialGradient(
    width * 0.2,
    height * 0.18,
    10,
    width * 0.2,
    height * 0.18,
    170
  );
  glowA.addColorStop(0, `rgba(34,211,238,${0.2 + pulse * 0.08})`);
  glowA.addColorStop(1, "rgba(34,211,238,0)");

  const glowB = ctx.createRadialGradient(
    width * 0.82,
    height * 0.24,
    10,
    width * 0.82,
    height * 0.24,
    180
  );
  glowB.addColorStop(0, `rgba(236,72,153,${0.18 + pulse * 0.08})`);
  glowB.addColorStop(1, "rgba(236,72,153,0)");

  const glowC = ctx.createRadialGradient(
    width * 0.5,
    height * 0.82,
    10,
    width * 0.5,
    height * 0.82,
    210
  );
  glowC.addColorStop(0, "rgba(250,204,21,0.09)");
  glowC.addColorStop(1, "rgba(250,204,21,0)");

  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = glowC;
  ctx.fillRect(0, 0, width, height);

  drawArenaRails(ctx, width, height, time);
  drawPerspectiveFloor(ctx, width, height, time);
  drawParticles(ctx, width, height, round, time);
}

function drawArenaRails(ctx, width, height, time = 0) {
  const drift = Math.sin(time / 1200) * 8;

  ctx.save();
  ctx.lineWidth = 2;

  const leftRail = ctx.createLinearGradient(0, 0, 34, height);
  leftRail.addColorStop(0, "rgba(34,211,238,0)");
  leftRail.addColorStop(0.35, "rgba(34,211,238,0.36)");
  leftRail.addColorStop(0.75, "rgba(236,72,153,0.24)");
  leftRail.addColorStop(1, "rgba(34,211,238,0)");

  const rightRail = ctx.createLinearGradient(width - 34, 0, width, height);
  rightRail.addColorStop(0, "rgba(236,72,153,0)");
  rightRail.addColorStop(0.35, "rgba(236,72,153,0.34)");
  rightRail.addColorStop(0.75, "rgba(34,211,238,0.22)");
  rightRail.addColorStop(1, "rgba(236,72,153,0)");

  ctx.strokeStyle = leftRail;
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(22 + drift * 0.15, 42);
  ctx.lineTo(8, height - 18);
  ctx.stroke();

  ctx.strokeStyle = rightRail;
  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(width - 22 - drift * 0.15, 42);
  ctx.lineTo(width - 8, height - 18);
  ctx.stroke();

  ctx.restore();
}

function drawPerspectiveFloor(ctx, width, height, time = 0) {
  const horizonY = height * 0.61;
  const floorTop = height * 0.72;
  const floorBottom = height;
  const slide = (time / 55) % 28;

  ctx.save();

  const floorGradient = ctx.createLinearGradient(0, floorTop, 0, floorBottom);
  floorGradient.addColorStop(0, "rgba(34,211,238,0.02)");
  floorGradient.addColorStop(0.55, "rgba(168,85,247,0.07)");
  floorGradient.addColorStop(1, "rgba(236,72,153,0.12)");

  ctx.fillStyle = floorGradient;
  ctx.beginPath();
  ctx.moveTo(width * 0.1, floorTop);
  ctx.lineTo(width * 0.9, floorTop);
  ctx.lineTo(width, floorBottom);
  ctx.lineTo(0, floorBottom);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(34,211,238,0.12)";
  ctx.lineWidth = 1;

  for (let i = -5; i <= 5; i += 1) {
    const x = width / 2 + i * 32;
    ctx.beginPath();
    ctx.moveTo(width / 2, horizonY);
    ctx.lineTo(x + i * 22, floorBottom);
    ctx.stroke();
  }

  for (let y = floorTop + slide; y < floorBottom; y += 28) {
    const ratio = clamp((y - floorTop) / Math.max(1, floorBottom - floorTop), 0, 1);
    const inset = (1 - ratio) * width * 0.18;

    ctx.strokeStyle = `rgba(236,72,153,${0.08 + ratio * 0.14})`;
    ctx.beginPath();
    ctx.moveTo(inset, y + 0.5);
    ctx.lineTo(width - inset, y + 0.5);
    ctx.stroke();
  }

  ctx.restore();
}

function drawParticles(ctx, width, height, round, time = 0) {
  ctx.save();

  for (let i = 0; i < 42; i += 1) {
    const seedX = i * 37 + round * 19;
    const seedY = i * 29 + round * 13;
    const px = (seedX + time / (18 + (i % 5) * 6)) % width;
    const py = (seedY + time / (28 + (i % 7) * 4)) % height;
    const alpha = 0.025 + (i % 4) * 0.012;
    const size = 0.8 + (i % 3) * 0.45;

    ctx.fillStyle =
      i % 3 === 0
        ? `rgba(34,211,238,${alpha})`
        : i % 3 === 1
          ? `rgba(236,72,153,${alpha})`
          : `rgba(250,204,21,${alpha})`;

    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawTopLane(ctx, width) {
  const laneHeight = 42;

  const laneGradient = ctx.createLinearGradient(0, 0, width, 0);
  laneGradient.addColorStop(0, "rgba(34,211,238,0.08)");
  laneGradient.addColorStop(0.5, "rgba(255,255,255,0.08)");
  laneGradient.addColorStop(1, "rgba(236,72,153,0.08)");

  ctx.fillStyle = laneGradient;
  ctx.fillRect(0, 0, width, laneHeight);

  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 10;
  ctx.strokeStyle = "rgba(34,211,238,0.24)";
  ctx.beginPath();
  ctx.moveTo(0, laneHeight + 0.5);
  ctx.lineTo(width, laneHeight + 0.5);
  ctx.stroke();

  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = 8;
  ctx.strokeStyle = "rgba(236,72,153,0.16)";
  ctx.beginPath();
  ctx.moveTo(width * 0.18, laneHeight + 3.5);
  ctx.lineTo(width * 0.82, laneHeight + 3.5);
  ctx.stroke();

  ctx.shadowBlur = 0;
}

function drawBrickBody(ctx, brick) {
  const radius = Math.min(7, brick.height / 2);

  const fill = ctx.createLinearGradient(
    brick.x,
    brick.y,
    brick.x,
    brick.y + brick.height
  );
  fill.addColorStop(0, "rgba(255,255,255,0.9)");
  fill.addColorStop(0.16, brick.color);
  fill.addColorStop(0.72, brick.glow || brick.color);
  fill.addColorStop(1, "rgba(0,0,0,0.28)");

  ctx.save();

  ctx.shadowColor = brick.glow || brick.color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = fill;
  drawRoundedRect(ctx, brick.x, brick.y, brick.width, brick.height, radius);
  ctx.fill();

  ctx.shadowBlur = 0;

  const innerGlow = ctx.createLinearGradient(
    brick.x,
    brick.y,
    brick.x + brick.width,
    brick.y
  );
  innerGlow.addColorStop(0, "rgba(255,255,255,0.08)");
  innerGlow.addColorStop(0.5, "rgba(255,255,255,0.28)");
  innerGlow.addColorStop(1, "rgba(255,255,255,0.06)");

  ctx.strokeStyle = innerGlow;
  ctx.lineWidth = 1.2;
  drawRoundedRect(
    ctx,
    brick.x + 0.75,
    brick.y + 0.75,
    brick.width - 1.5,
    brick.height - 1.5,
    radius
  );
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  drawRoundedRect(ctx, brick.x + 5, brick.y + 3, brick.width - 10, 2.3, 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(brick.x + 4, brick.y + brick.height - 2);
  ctx.lineTo(brick.x + brick.width - 4, brick.y + brick.height - 2);
  ctx.stroke();

  ctx.restore();
}

function drawBrickHp(ctx, brick) {
  if (brick.maxHp <= 1) return;

  const barX = brick.x + 5;
  const barY = brick.y + brick.height - 5;
  const barW = brick.width - 10;
  const barH = 2.5;

  ctx.fillStyle = "rgba(0,0,0,0.32)";
  drawRoundedRect(ctx, barX, barY, barW, barH, 2);
  ctx.fill();

  const hpRatio = Math.max(0, brick.hp) / brick.maxHp;
  const hpGradient = ctx.createLinearGradient(barX, barY, barX + barW, barY);
  hpGradient.addColorStop(0, "#22d3ee");
  hpGradient.addColorStop(0.5, "#f0abfc");
  hpGradient.addColorStop(1, "#facc15");

  ctx.fillStyle = hpGradient;
  drawRoundedRect(ctx, barX, barY, barW * hpRatio, barH, 2);
  ctx.fill();
}

function drawBricks(ctx, bricks = []) {
  bricks.forEach((brick) => {
    if (!brick.alive) return;
    drawBrickBody(ctx, brick);
    drawBrickHp(ctx, brick);
  });
}

function drawPaddle(ctx, paddle) {
  ctx.save();

  const outerHeight = paddle.height + 7;
  const outerY = paddle.y - 3.5;

  const glowGradient = ctx.createLinearGradient(
    paddle.x,
    outerY,
    paddle.x + paddle.width,
    outerY
  );
  glowGradient.addColorStop(0, "#ec4899");
  glowGradient.addColorStop(0.5, "#22d3ee");
  glowGradient.addColorStop(1, "#facc15");

  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = 18;
  ctx.fillStyle = glowGradient;
  drawRoundedRect(ctx, paddle.x - 4, outerY, paddle.width + 8, outerHeight, 10);
  ctx.fill();

  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 14;

  const coreGradient = ctx.createLinearGradient(
    paddle.x,
    paddle.y,
    paddle.x,
    paddle.y + paddle.height
  );
  coreGradient.addColorStop(0, "#e0faff");
  coreGradient.addColorStop(0.25, "#22d3ee");
  coreGradient.addColorStop(1, "#07111b");

  ctx.fillStyle = coreGradient;
  drawRoundedRect(ctx, paddle.x, paddle.y, paddle.width, paddle.height, 7);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.34)";
  drawRoundedRect(ctx, paddle.x + 12, paddle.y + 2, paddle.width - 24, 2, 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.18)";
  drawRoundedRect(ctx, paddle.x + 18, paddle.y + paddle.height - 3, paddle.width - 36, 2, 2);
  ctx.fill();

  ctx.restore();
}

function drawBallTrail(ctx, ball) {
  if (!ball || typeof ball.prevX !== "number" || typeof ball.prevY !== "number") return;

  ctx.save();

  const trail = ctx.createLinearGradient(ball.prevX, ball.prevY, ball.x, ball.y);
  trail.addColorStop(0, "rgba(34,211,238,0)");
  trail.addColorStop(0.35, "rgba(34,211,238,0.35)");
  trail.addColorStop(1, "rgba(236,72,153,0.75)");

  ctx.strokeStyle = trail;
  ctx.lineWidth = ball.radius * 1.25;
  ctx.lineCap = "round";
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 14;

  ctx.beginPath();
  ctx.moveTo(ball.prevX, ball.prevY);
  ctx.lineTo(ball.x, ball.y);
  ctx.stroke();

  ctx.restore();
}

function drawBall(ctx, ball) {
  drawBallTrail(ctx, ball);

  const ballGradient = ctx.createRadialGradient(
    ball.x - 2,
    ball.y - 3,
    1,
    ball.x,
    ball.y,
    ball.radius + 2
  );
  ballGradient.addColorStop(0, "#ffffff");
  ballGradient.addColorStop(0.25, "#dffbff");
  ballGradient.addColorStop(0.54, "#f0abfc");
  ballGradient.addColorStop(1, "#7c3aed");

  ctx.save();

  ctx.beginPath();
  ctx.shadowColor = "#f0abfc";
  ctx.shadowBlur = 22;
  ctx.fillStyle = ballGradient;
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 14;
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.arc(ball.x - ball.radius * 0.35, ball.y - ball.radius * 0.42, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawFxEvents(ctx, fxEvents = [], time = 0) {
  fxEvents.forEach((event) => {
    if (event.type === "spark") {
      drawSparkEvent(ctx, event, time);
      return;
    }

    if (event.type === "burst") {
      drawBurstEvent(ctx, event, time);
      return;
    }

    if (event.type === "pulse") {
      drawPulseEvent(ctx, event, time);
      return;
    }

    if (event.type === "text") {
      drawTextEvent(ctx, event, time);
    }
  });
}

function drawSparkEvent(ctx, event, time = 0) {
  const age = getEventAge(event, time);
  const progress = clamp(age / 340, 0, 1);
  const alpha = 1 - progress;

  ctx.save();

  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI * 2 * i) / 10 + event.id * 0.31;
    const distance = 6 + progress * (16 + (i % 3) * 6);
    const x = event.x + Math.cos(angle) * distance;
    const y = event.y + Math.sin(angle) * distance;

    ctx.strokeStyle = event.color || `rgba(34,211,238,${alpha})`;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(event.x, event.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBurstEvent(ctx, event, time = 0) {
  const age = getEventAge(event, time);
  const progress = clamp(age / 340, 0, 1);
  const alpha = 1 - progress;

  ctx.save();
  ctx.globalAlpha = alpha;

  for (let i = 0; i < 14; i += 1) {
    const angle = (Math.PI * 2 * i) / 14 + event.id * 0.21;
    const distance = 5 + progress * (20 + (i % 4) * 5);
    const size = 2 + (i % 3);

    ctx.fillStyle =
      i % 3 === 0
        ? event.color || "#22d3ee"
        : i % 3 === 1
          ? "#ec4899"
          : "#facc15";

    ctx.save();
    ctx.translate(event.x + Math.cos(angle) * distance, event.y + Math.sin(angle) * distance);
    ctx.rotate(angle);
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  ctx.restore();
}

function drawPulseEvent(ctx, event, time = 0) {
  const age = getEventAge(event, time);
  const progress = clamp(age / 420, 0, 1);
  const alpha = 1 - progress;
  const radius = (event.radius || 28) * (0.35 + progress);

  ctx.save();

  ctx.strokeStyle = event.color || `rgba(34,211,238,${alpha})`;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 2;
  ctx.shadowColor = event.color || "#22d3ee";
  ctx.shadowBlur = 16;

  ctx.beginPath();
  ctx.arc(event.x, event.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawTextEvent(ctx, event, time = 0) {
  const age = getEventAge(event, time);
  const progress = clamp(age / 620, 0, 1);
  const alpha = 1 - progress;
  const y = event.y - progress * 18;

  ctx.save();

  ctx.textAlign = "center";
  ctx.globalAlpha = alpha;
  ctx.font = "900 16px sans-serif";
  ctx.shadowColor = event.color || "#facc15";
  ctx.shadowBlur = 14;
  ctx.fillStyle = event.color || "#facc15";
  ctx.fillText(event.text || "", event.x, y);

  ctx.restore();
}

function drawHud(ctx, {
  score = 0,
  round = 1,
  lives = 5,
  pattern = "full",
  combo = 0,
}) {
  ctx.save();

  ctx.fillStyle = "rgba(2,6,23,0.38)";
  drawRoundedRect(ctx, 8, 7, 324, 25, 13);
  ctx.fill();

  ctx.strokeStyle = "rgba(34,211,238,0.18)";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, 8.5, 7.5, 323, 24, 13);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "800 11px sans-serif";
  ctx.fillText(`SCORE ${formatScore(score)}`, 15, 23);

  ctx.fillStyle = "rgba(34,211,238,0.82)";
  ctx.font = "800 10px sans-serif";
  ctx.fillText(`R${round}`, 125, 23);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "700 9px sans-serif";
  ctx.fillText(String(pattern).replace("-", " ").toUpperCase(), 160, 23);

  if (combo > 1) {
    ctx.fillStyle = "#facc15";
    ctx.font = "900 10px sans-serif";
    ctx.fillText(`x${combo}`, 245, 23);
  }

  ctx.fillStyle = "#fb7185";
  ctx.font = "800 12px sans-serif";
  ctx.fillText("♥".repeat(Math.max(0, lives)), Math.max(260, 326 - lives * 9), 23);

  ctx.restore();
}

function drawRoundIntro(ctx, width, height, round) {
  ctx.save();

  ctx.fillStyle = "rgba(3,6,18,0.58)";
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width / 2,
    height / 2,
    10,
    width / 2,
    height / 2,
    120
  );
  glow.addColorStop(0, "rgba(34,211,238,0.22)");
  glow.addColorStop(0.55, "rgba(236,72,153,0.13)");
  glow.addColorStop(1, "rgba(34,211,238,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.font = "900 30px sans-serif";
  ctx.fillText(`ROUND ${round}`, width / 2, height / 2 - 10);

  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#f0abfc";
  ctx.font = "800 12px sans-serif";
  ctx.fillText("SMASH THE WALL", width / 2, height / 2 + 18);

  ctx.textAlign = "start";
  ctx.restore();
}

function drawPausedState(ctx, width, height) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.52)";
  ctx.fillRect(0, 0, width, height);

  const panelX = width / 2 - 88;
  const panelY = height / 2 - 48;

  ctx.fillStyle = "rgba(2,6,23,0.72)";
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 18;
  drawRoundedRect(ctx, panelX, panelY, 176, 96, 20);
  ctx.fill();

  ctx.strokeStyle = "rgba(34,211,238,0.28)";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, panelX + 0.5, panelY + 0.5, 175, 95, 20);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.font = "900 24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", width / 2, height / 2 - 6);

  ctx.fillStyle = "rgba(255,255,255,0.58)";
  ctx.font = "700 11px sans-serif";
  ctx.fillText("Resume or exit from the overlay", width / 2, height / 2 + 22);

  ctx.textAlign = "start";
  ctx.restore();
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
    fxEvents = [],
    combo = 0,
    time = 0,
    showRoundIntro = false,
    paused = false,
  } = frame || {};

  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  drawBackground(ctx, width, height, round, time);
  drawTopLane(ctx, width);
  drawBricks(ctx, bricks);
  drawFxEvents(ctx, fxEvents, time);

  if (paddle) drawPaddle(ctx, paddle);
  if (ball) drawBall(ctx, ball);

  drawHud(ctx, {
    score,
    round,
    lives,
    pattern,
    combo,
  });

  if (showRoundIntro) {
    drawRoundIntro(ctx, width, height, round);
  }

  if (paused) {
    drawPausedState(ctx, width, height);
  }
}