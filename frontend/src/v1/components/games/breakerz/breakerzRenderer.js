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

function drawHex(ctx, x, y, radius) {
  ctx.beginPath();

  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 6 + (Math.PI * 2 * i) / 6;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.closePath();
}

function drawBackground(ctx, width, height, round, time = 0) {
  const pulse = Math.sin(time / 900 + round * 0.35) * 0.5 + 0.5;

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#05001a");
  gradient.addColorStop(0.28, "#08042a");
  gradient.addColorStop(0.62, "#140824");
  gradient.addColorStop(1, "#020713");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  drawBackdropGlow(ctx, width, height, pulse);
  drawStarDust(ctx, width, height, round, time);
  drawArenaRails(ctx, width, height, time);
  drawBrickStage(ctx, width, height, time);
  drawPerspectiveFloor(ctx, width, height, time);
  drawVignette(ctx, width, height);
}

function drawBackdropGlow(ctx, width, height, pulse) {
  const glowA = ctx.createRadialGradient(
    width * 0.16,
    height * 0.15,
    12,
    width * 0.16,
    height * 0.15,
    210
  );
  glowA.addColorStop(0, `rgba(34,211,238,${0.24 + pulse * 0.08})`);
  glowA.addColorStop(0.5, "rgba(14,165,233,0.08)");
  glowA.addColorStop(1, "rgba(34,211,238,0)");

  const glowB = ctx.createRadialGradient(
    width * 0.88,
    height * 0.21,
    10,
    width * 0.88,
    height * 0.21,
    210
  );
  glowB.addColorStop(0, `rgba(236,72,153,${0.24 + pulse * 0.08})`);
  glowB.addColorStop(0.52, "rgba(168,85,247,0.08)");
  glowB.addColorStop(1, "rgba(236,72,153,0)");

  const glowC = ctx.createRadialGradient(
    width * 0.5,
    height * 0.76,
    10,
    width * 0.5,
    height * 0.76,
    230
  );
  glowC.addColorStop(0, "rgba(250,204,21,0.13)");
  glowC.addColorStop(0.48, "rgba(236,72,153,0.06)");
  glowC.addColorStop(1, "rgba(250,204,21,0)");

  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = glowC;
  ctx.fillRect(0, 0, width, height);
}

function drawStarDust(ctx, width, height, round, time = 0) {
  ctx.save();

  for (let i = 0; i < 62; i += 1) {
    const seedX = i * 43 + round * 29;
    const seedY = i * 31 + round * 17;
    const px = (seedX + time / (24 + (i % 5) * 8)) % width;
    const py = (seedY + time / (36 + (i % 7) * 5)) % height;
    const alpha = 0.028 + (i % 5) * 0.011;
    const size = 0.65 + (i % 4) * 0.35;

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

function drawArenaRails(ctx, width, height, time = 0) {
  const drift = Math.sin(time / 1200) * 8;

  ctx.save();
  ctx.lineWidth = 2;

  const leftRail = ctx.createLinearGradient(0, 0, 42, height);
  leftRail.addColorStop(0, "rgba(34,211,238,0)");
  leftRail.addColorStop(0.34, "rgba(34,211,238,0.42)");
  leftRail.addColorStop(0.74, "rgba(236,72,153,0.26)");
  leftRail.addColorStop(1, "rgba(34,211,238,0)");

  const rightRail = ctx.createLinearGradient(width - 42, 0, width, height);
  rightRail.addColorStop(0, "rgba(236,72,153,0)");
  rightRail.addColorStop(0.34, "rgba(236,72,153,0.4)");
  rightRail.addColorStop(0.74, "rgba(34,211,238,0.24)");
  rightRail.addColorStop(1, "rgba(236,72,153,0)");

  ctx.strokeStyle = leftRail;
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(25 + drift * 0.15, 42);
  ctx.lineTo(9, height - 18);
  ctx.stroke();

  ctx.strokeStyle = rightRail;
  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(width - 25 - drift * 0.15, 42);
  ctx.lineTo(width - 9, height - 18);
  ctx.stroke();

  ctx.restore();
}

function drawBrickStage(ctx, width, height, time = 0) {
  const shimmer = Math.sin(time / 700) * 0.5 + 0.5;
  const stageY = 47;
  const stageH = height * 0.43;

  ctx.save();

  const backplate = ctx.createLinearGradient(0, stageY, 0, stageY + stageH);
  backplate.addColorStop(0, "rgba(255,255,255,0.035)");
  backplate.addColorStop(0.48, "rgba(34,211,238,0.025)");
  backplate.addColorStop(1, "rgba(236,72,153,0.01)");

  ctx.fillStyle = backplate;
  drawRoundedRect(ctx, 18, stageY, width - 36, stageH, 24);
  ctx.fill();

  ctx.strokeStyle = `rgba(34,211,238,${0.08 + shimmer * 0.04})`;
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, 18.5, stageY + 0.5, width - 37, stageH - 1, 24);
  ctx.stroke();

  ctx.restore();
}

function drawPerspectiveFloor(ctx, width, height, time = 0) {
  const horizonY = height * 0.6;
  const floorTop = height * 0.71;
  const floorBottom = height;
  const slide = (time / 55) % 30;

  ctx.save();

  const floorGradient = ctx.createLinearGradient(0, floorTop, 0, floorBottom);
  floorGradient.addColorStop(0, "rgba(34,211,238,0.025)");
  floorGradient.addColorStop(0.52, "rgba(168,85,247,0.08)");
  floorGradient.addColorStop(1, "rgba(236,72,153,0.14)");

  ctx.fillStyle = floorGradient;
  ctx.beginPath();
  ctx.moveTo(width * 0.1, floorTop);
  ctx.lineTo(width * 0.9, floorTop);
  ctx.lineTo(width, floorBottom);
  ctx.lineTo(0, floorBottom);
  ctx.closePath();
  ctx.fill();

  for (let i = -6; i <= 6; i += 1) {
    const x = width / 2 + i * 30;
    const alpha = i === 0 ? 0.16 : 0.1;

    ctx.strokeStyle = `rgba(34,211,238,${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, horizonY);
    ctx.lineTo(x + i * 24, floorBottom);
    ctx.stroke();
  }

  for (let y = floorTop + slide; y < floorBottom; y += 30) {
    const ratio = clamp((y - floorTop) / Math.max(1, floorBottom - floorTop), 0, 1);
    const inset = (1 - ratio) * width * 0.18;

    ctx.strokeStyle = `rgba(236,72,153,${0.09 + ratio * 0.16})`;
    ctx.lineWidth = 1 + ratio * 0.7;
    ctx.beginPath();
    ctx.moveTo(inset, y + 0.5);
    ctx.lineTo(width - inset, y + 0.5);
    ctx.stroke();
  }

  ctx.restore();
}

function drawVignette(ctx, width, height) {
  const vignette = ctx.createRadialGradient(
    width / 2,
    height * 0.42,
    80,
    width / 2,
    height * 0.42,
    height * 0.76
  );

  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(0.72, "rgba(0,0,0,0.18)");
  vignette.addColorStop(1, "rgba(0,0,0,0.58)");

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function drawTopLane(ctx, width) {
  const laneHeight = 42;

  const laneGradient = ctx.createLinearGradient(0, 0, width, 0);
  laneGradient.addColorStop(0, "rgba(34,211,238,0.1)");
  laneGradient.addColorStop(0.5, "rgba(255,255,255,0.08)");
  laneGradient.addColorStop(1, "rgba(236,72,153,0.1)");

  ctx.fillStyle = laneGradient;
  ctx.fillRect(0, 0, width, laneHeight);

  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 12;
  ctx.strokeStyle = "rgba(34,211,238,0.28)";
  ctx.beginPath();
  ctx.moveTo(0, laneHeight + 0.5);
  ctx.lineTo(width, laneHeight + 0.5);
  ctx.stroke();

  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = 9;
  ctx.strokeStyle = "rgba(236,72,153,0.18)";
  ctx.beginPath();
  ctx.moveTo(width * 0.18, laneHeight + 3.5);
  ctx.lineTo(width * 0.82, laneHeight + 3.5);
  ctx.stroke();

  ctx.shadowBlur = 0;
}

function drawBrickBody(ctx, brick) {
  const radius = Math.min(8, brick.height / 2);
  const glowColor = brick.glow || brick.color || "#22d3ee";

  ctx.save();

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20;
  ctx.fillStyle = glowColor;
  drawRoundedRect(
    ctx,
    brick.x - 1.5,
    brick.y + 1,
    brick.width + 3,
    brick.height + 2,
    radius
  );
  ctx.fill();

  ctx.shadowBlur = 0;

  const body = ctx.createLinearGradient(
    brick.x,
    brick.y,
    brick.x,
    brick.y + brick.height
  );
  body.addColorStop(0, "rgba(255,255,255,0.98)");
  body.addColorStop(0.11, "rgba(255,255,255,0.8)");
  body.addColorStop(0.26, brick.color || "#22d3ee");
  body.addColorStop(0.68, glowColor);
  body.addColorStop(1, "rgba(0,0,0,0.42)");

  ctx.fillStyle = body;
  drawRoundedRect(ctx, brick.x, brick.y, brick.width, brick.height, radius);
  ctx.fill();

  const sideShade = ctx.createLinearGradient(
    brick.x,
    brick.y,
    brick.x + brick.width,
    brick.y
  );
  sideShade.addColorStop(0, "rgba(0,0,0,0.28)");
  sideShade.addColorStop(0.2, "rgba(255,255,255,0.04)");
  sideShade.addColorStop(0.5, "rgba(255,255,255,0.16)");
  sideShade.addColorStop(0.82, "rgba(255,255,255,0.04)");
  sideShade.addColorStop(1, "rgba(0,0,0,0.34)");

  ctx.fillStyle = sideShade;
  drawRoundedRect(ctx, brick.x, brick.y, brick.width, brick.height, radius);
  ctx.fill();

  const rim = ctx.createLinearGradient(
    brick.x,
    brick.y,
    brick.x + brick.width,
    brick.y + brick.height
  );
  rim.addColorStop(0, "rgba(255,255,255,0.72)");
  rim.addColorStop(0.35, "rgba(255,255,255,0.18)");
  rim.addColorStop(0.68, "rgba(255,255,255,0.1)");
  rim.addColorStop(1, "rgba(0,0,0,0.2)");

  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.3;
  drawRoundedRect(
    ctx,
    brick.x + 0.75,
    brick.y + 0.75,
    brick.width - 1.5,
    brick.height - 1.5,
    radius
  );
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.33)";
  drawRoundedRect(ctx, brick.x + 6, brick.y + 3, brick.width - 12, 2.4, 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  drawRoundedRect(ctx, brick.x + 9, brick.y + 6.5, brick.width * 0.32, 1.8, 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.25)";
  drawRoundedRect(
    ctx,
    brick.x + 5,
    brick.y + brick.height - 3,
    brick.width - 10,
    1.8,
    2
  );
  ctx.fill();

  ctx.restore();
}

function drawBrickHp(ctx, brick) {
  if (brick.maxHp <= 1) return;

  const barX = brick.x + 5;
  const barY = brick.y + brick.height - 5;
  const barW = brick.width - 10;
  const barH = 2.5;

  ctx.fillStyle = "rgba(0,0,0,0.35)";
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

  const outerHeight = paddle.height + 9;
  const outerY = paddle.y - 4.5;

  const glowGradient = ctx.createLinearGradient(
    paddle.x,
    outerY,
    paddle.x + paddle.width,
    outerY
  );
  glowGradient.addColorStop(0, "#ec4899");
  glowGradient.addColorStop(0.5, "#22d3ee");
  glowGradient.addColorStop(1, "#facc15");

  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 20;
  ctx.fillStyle = glowGradient;
  drawRoundedRect(ctx, paddle.x - 5, outerY, paddle.width + 10, outerHeight, 12);
  ctx.fill();

  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = 15;

  const coreGradient = ctx.createLinearGradient(
    paddle.x,
    paddle.y,
    paddle.x,
    paddle.y + paddle.height
  );
  coreGradient.addColorStop(0, "#ffffff");
  coreGradient.addColorStop(0.22, "#bff8ff");
  coreGradient.addColorStop(0.48, "#22d3ee");
  coreGradient.addColorStop(1, "#06101c");

  ctx.fillStyle = coreGradient;
  drawRoundedRect(ctx, paddle.x, paddle.y, paddle.width, paddle.height, 8);
  ctx.fill();

  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(255,255,255,0.38)";
  drawRoundedRect(ctx, paddle.x + 12, paddle.y + 2, paddle.width - 24, 2, 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  drawRoundedRect(
    ctx,
    paddle.x + 18,
    paddle.y + paddle.height - 3,
    paddle.width - 36,
    2,
    2
  );
  ctx.fill();

  ctx.restore();
}

function drawBallTrail(ctx, ball) {
  if (!ball || typeof ball.prevX !== "number" || typeof ball.prevY !== "number") return;

  ctx.save();

  const trail = ctx.createLinearGradient(ball.prevX, ball.prevY, ball.x, ball.y);
  trail.addColorStop(0, "rgba(34,211,238,0)");
  trail.addColorStop(0.36, "rgba(34,211,238,0.35)");
  trail.addColorStop(1, "rgba(236,72,153,0.78)");

  ctx.strokeStyle = trail;
  ctx.lineWidth = ball.radius * 1.45;
  ctx.lineCap = "round";
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 16;

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
    ball.radius + 3
  );
  ballGradient.addColorStop(0, "#ffffff");
  ballGradient.addColorStop(0.22, "#e6fdff");
  ballGradient.addColorStop(0.52, "#f0abfc");
  ballGradient.addColorStop(0.78, "#ec4899");
  ballGradient.addColorStop(1, "#581c87");

  ctx.save();

  ctx.shadowColor = "#f0abfc";
  ctx.shadowBlur = 24;
  ctx.fillStyle = ballGradient;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 15;
  ctx.strokeStyle = "rgba(255,255,255,0.62)";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(
    ball.x - ball.radius * 0.34,
    ball.y - ball.radius * 0.42,
    1.9,
    0,
    Math.PI * 2
  );
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
  const progress = clamp(age / 360, 0, 1);
  const alpha = 1 - progress;

  ctx.save();

  for (let i = 0; i < 12; i += 1) {
    const angle = (Math.PI * 2 * i) / 12 + event.id * 0.31;
    const distance = 6 + progress * (18 + (i % 3) * 7);
    const x = event.x + Math.cos(angle) * distance;
    const y = event.y + Math.sin(angle) * distance;

    ctx.strokeStyle = event.color || `rgba(34,211,238,${alpha})`;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.25;
    ctx.shadowColor = event.color || "#22d3ee";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(event.x, event.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBurstEvent(ctx, event, time = 0) {
  const age = getEventAge(event, time);
  const progress = clamp(age / 360, 0, 1);
  const alpha = 1 - progress;

  ctx.save();
  ctx.globalAlpha = alpha;

  for (let i = 0; i < 16; i += 1) {
    const angle = (Math.PI * 2 * i) / 16 + event.id * 0.21;
    const distance = 5 + progress * (22 + (i % 4) * 6);
    const size = 2 + (i % 3);

    ctx.fillStyle =
      i % 3 === 0
        ? event.color || "#22d3ee"
        : i % 3 === 1
          ? "#ec4899"
          : "#facc15";

    ctx.save();
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.translate(event.x + Math.cos(angle) * distance, event.y + Math.sin(angle) * distance);
    ctx.rotate(angle);
    drawHex(ctx, 0, 0, size);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawPulseEvent(ctx, event, time = 0) {
  const age = getEventAge(event, time);
  const progress = clamp(age / 440, 0, 1);
  const alpha = 1 - progress;
  const radius = (event.radius || 28) * (0.35 + progress);

  ctx.save();

  ctx.strokeStyle = event.color || `rgba(34,211,238,${alpha})`;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 2.2;
  ctx.shadowColor = event.color || "#22d3ee";
  ctx.shadowBlur = 18;

  ctx.beginPath();
  ctx.arc(event.x, event.y, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawTextEvent(ctx, event, time = 0) {
  const age = getEventAge(event, time);
  const progress = clamp(age / 650, 0, 1);
  const alpha = 1 - progress;
  const y = event.y - progress * 20;

  ctx.save();

  ctx.textAlign = "center";
  ctx.globalAlpha = alpha;
  ctx.font = "900 16px sans-serif";
  ctx.shadowColor = event.color || "#facc15";
  ctx.shadowBlur = 16;
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

  const hudX = 8;
  const hudY = 7;
  const hudW = 324;
  const hudH = 25;

  const glass = ctx.createLinearGradient(hudX, hudY, hudX + hudW, hudY);
  glass.addColorStop(0, "rgba(2,6,23,0.58)");
  glass.addColorStop(0.5, "rgba(15,23,42,0.42)");
  glass.addColorStop(1, "rgba(2,6,23,0.58)");

  ctx.fillStyle = glass;
  drawRoundedRect(ctx, hudX, hudY, hudW, hudH, 13);
  ctx.fill();

  ctx.strokeStyle = "rgba(34,211,238,0.2)";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, hudX + 0.5, hudY + 0.5, hudW - 1, hudH - 1, 13);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.font = "800 11px sans-serif";
  ctx.fillText(`SCORE ${formatScore(score)}`, 15, 23);

  ctx.fillStyle = "rgba(34,211,238,0.9)";
  ctx.font = "900 10px sans-serif";
  ctx.fillText(`R${round}`, 126, 23);

  ctx.fillStyle = "rgba(255,255,255,0.54)";
  ctx.font = "800 9px sans-serif";
  ctx.fillText(String(pattern).replace("-", " ").toUpperCase(), 160, 23);

  if (combo > 1) {
    ctx.fillStyle = "#facc15";
    ctx.font = "900 10px sans-serif";
    ctx.shadowColor = "#facc15";
    ctx.shadowBlur = 10;
    ctx.fillText(`x${combo}`, 245, 23);
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = "#fb7185";
  ctx.font = "800 12px sans-serif";
  ctx.fillText("♥".repeat(Math.max(0, lives)), Math.max(260, 326 - lives * 9), 23);

  ctx.restore();
}

function drawRoundIntro(ctx, width, height, round) {
  ctx.save();

  ctx.fillStyle = "rgba(3,6,18,0.62)";
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(
    width / 2,
    height / 2,
    10,
    width / 2,
    height / 2,
    130
  );
  glow.addColorStop(0, "rgba(34,211,238,0.25)");
  glow.addColorStop(0.55, "rgba(236,72,153,0.16)");
  glow.addColorStop(1, "rgba(34,211,238,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = "center";
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "rgba(255,255,255,0.98)";
  ctx.font = "900 31px sans-serif";
  ctx.fillText(`ROUND ${round}`, width / 2, height / 2 - 10);

  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#f0abfc";
  ctx.font = "900 12px sans-serif";
  ctx.fillText("BREAK THE WALL", width / 2, height / 2 + 18);

  ctx.textAlign = "start";
  ctx.restore();
}

function drawPausedState(ctx, width, height) {
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.54)";
  ctx.fillRect(0, 0, width, height);

  const panelX = width / 2 - 88;
  const panelY = height / 2 - 48;

  ctx.fillStyle = "rgba(2,6,23,0.76)";
  ctx.shadowColor = "#22d3ee";
  ctx.shadowBlur = 20;
  drawRoundedRect(ctx, panelX, panelY, 176, 96, 20);
  ctx.fill();

  ctx.strokeStyle = "rgba(34,211,238,0.32)";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, panelX + 0.5, panelY + 0.5, 175, 95, 20);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.font = "900 24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", width / 2, height / 2 - 6);

  ctx.fillStyle = "rgba(255,255,255,0.6)";
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