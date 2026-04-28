import { PULZE_COLORS } from "./pulzeConfig";

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function renderPulzeFrame(ctx, frame) {
  const { width, height } = frame.canvas;

  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#050816");
  background.addColorStop(0.5, "#081224");
  background.addColorStop(1, "#12081f");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = PULZE_COLORS.violet;
  ctx.beginPath();
  ctx.arc(width * 0.25, height * 0.18, 90, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PULZE_COLORS.cyan;
  ctx.beginPath();
  ctx.arc(width * 0.76, height * 0.76, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;

  for (let y = 40; y < height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(24, y);
    ctx.lineTo(width - 24, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = PULZE_COLORS.white;
  ctx.font = "800 34px system-ui, sans-serif";
  ctx.fillText("PULZE", width / 2, 92);

  ctx.fillStyle = "rgba(255,255,255,0.48)";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.fillText("TAP WHEN THE PULZE HITS THE CORE", width / 2, 120);

  const track = frame.track;

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, track.x, track.y, track.width, track.height, 999);
  ctx.restore();

  const targetX = frame.targetPosition - frame.targetSize / 2;

  ctx.save();
  const targetGradient = ctx.createLinearGradient(targetX, 0, targetX + frame.targetSize, 0);
  targetGradient.addColorStop(0, "rgba(236,72,153,0.95)");
  targetGradient.addColorStop(0.5, "rgba(168,85,247,0.95)");
  targetGradient.addColorStop(1, "rgba(103,242,255,0.95)");

  ctx.fillStyle = targetGradient;
  ctx.shadowColor = "rgba(103,242,255,0.55)";
  ctx.shadowBlur = 18;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, targetX, track.y - 10, frame.targetSize, track.height + 20, 999);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = PULZE_COLORS.white;
  ctx.shadowColor = "rgba(255,255,255,0.85)";
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.arc(frame.pulzePosition, track.y + track.height / 2, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PULZE_COLORS.cyan;
  ctx.beginPath();
  ctx.arc(frame.pulzePosition, track.y + track.height / 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = "center";
  ctx.font = "900 22px system-ui, sans-serif";
  ctx.fillStyle =
    frame.feedback === "MISS"
      ? "#fb7185"
      : frame.feedback === "PERFECT"
        ? "#86efac"
        : PULZE_COLORS.cyan;

  ctx.fillText(frame.feedback, width / 2, 380);

  ctx.fillStyle = "rgba(255,255,255,0.58)";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.fillText(`STREAK ${frame.streak}`, width / 2, 405);

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.055)";
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, 38, 462, width - 76, 74, 24);
  ctx.restore();

  ctx.fillStyle = "rgba(255,255,255,0.48)";
  ctx.font = "700 10px system-ui, sans-serif";
  ctx.fillText("SCORE", width * 0.25, 490);
  ctx.fillText("ROUND", width * 0.5, 490);
  ctx.fillText("LIVES", width * 0.75, 490);

  ctx.fillStyle = PULZE_COLORS.white;
  ctx.font = "800 18px system-ui, sans-serif";
  ctx.fillText(Number(frame.score || 0).toLocaleString(), width * 0.25, 518);
  ctx.fillText(frame.round, width * 0.5, 518);
  ctx.fillText(frame.lives, width * 0.75, 518);

  if (frame.paused || frame.finished) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
