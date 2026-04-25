import { STACKZ_BOARD, STACKZ_CANVAS, STACKZ_COLORS } from "./stackzConfig";

const BOARD_CELL_OVERRIDE = 16;
const BOARD_TOP = 42;
const BOTTOM_CARD_GAP_FROM_BOARD = 12;

function drawBackground(ctx, width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0a0b1e");
  gradient.addColorStop(0.5, "#070b16");
  gradient.addColorStop(1, "#050816");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const glow1 = ctx.createRadialGradient(
    width * 0.22,
    height * 0.16,
    10,
    width * 0.22,
    height * 0.16,
    160
  );
  glow1.addColorStop(0, "rgba(168,85,247,0.18)");
  glow1.addColorStop(1, "rgba(168,85,247,0)");

  const glow2 = ctx.createRadialGradient(
    width * 0.78,
    height * 0.22,
    10,
    width * 0.78,
    height * 0.22,
    170
  );
  glow2.addColorStop(0, "rgba(34,211,238,0.14)");
  glow2.addColorStop(1, "rgba(34,211,238,0)");

  const glow3 = ctx.createRadialGradient(
    width * 0.5,
    height * 0.9,
    10,
    width * 0.5,
    height * 0.9,
    170
  );
  glow3.addColorStop(0, "rgba(244,114,182,0.11)");
  glow3.addColorStop(1, "rgba(244,114,182,0)");

  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = glow3;
  ctx.fillRect(0, 0, width, height);
}

function drawRoundedRect(ctx, x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBoardFrame(ctx, originX, originY, boardWidth, boardHeight) {
  ctx.save();

  const glowGradient = ctx.createLinearGradient(
    originX,
    originY,
    originX + boardWidth,
    originY + boardHeight
  );
  glowGradient.addColorStop(0, "rgba(34,211,238,0.22)");
  glowGradient.addColorStop(0.5, "rgba(180,134,255,0.16)");
  glowGradient.addColorStop(1, "rgba(236,72,153,0.22)");

  ctx.shadowColor = "rgba(34,211,238,0.24)";
  ctx.shadowBlur = 18;
  ctx.strokeStyle = glowGradient;
  ctx.lineWidth = 2;
  ctx.strokeRect(originX - 1, originY - 1, boardWidth + 2, boardHeight + 2);

  const panelGradient = ctx.createLinearGradient(
    originX,
    originY,
    originX,
    originY + boardHeight
  );
  panelGradient.addColorStop(0, "rgba(255,255,255,0.06)");
  panelGradient.addColorStop(1, "rgba(255,255,255,0.018)");

  ctx.shadowBlur = 0;
  ctx.fillStyle = panelGradient;
  ctx.fillRect(originX, originY, boardWidth, boardHeight);

  ctx.strokeStyle = STACKZ_COLORS.frame;
  ctx.lineWidth = 1;
  ctx.strokeRect(originX + 0.5, originY + 0.5, boardWidth - 1, boardHeight - 1);

  ctx.restore();
}

function drawGridLines(ctx, originX, originY, boardWidth, boardHeight, cell) {
  ctx.strokeStyle = STACKZ_COLORS.grid;
  ctx.lineWidth = 1;

  for (let c = 0; c <= STACKZ_BOARD.cols; c += 1) {
    const x = originX + c * cell + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, originY);
    ctx.lineTo(x, originY + boardHeight);
    ctx.stroke();
  }

  for (let r = 0; r <= STACKZ_BOARD.rows; r += 1) {
    const y = originY + r * cell + 0.5;
    ctx.beginPath();
    ctx.moveTo(originX, y);
    ctx.lineTo(originX + boardWidth, y);
    ctx.stroke();
  }
}

function drawCell(ctx, x, y, size, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const fill = ctx.createLinearGradient(x, y, x, y + size);
  fill.addColorStop(0, color);
  fill.addColorStop(1, "rgba(255,255,255,0.20)");

  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = fill;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.strokeRect(x + 1.5, y + 1.5, size - 3, size - 3);

  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fillRect(x + 3, y + 3, Math.max(2, size - 8), 2);

  ctx.restore();
}

function drawPlacedBlocks(ctx, grid, originX, originY, cell) {
  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      const color = grid[row][col];
      if (!color) continue;

      drawCell(ctx, originX + col * cell, originY + row * cell, cell, color);
    }
  }
}

function drawPiece(ctx, piece, originX, originY, cell, alpha = 1) {
  if (!piece) return;

  piece.blocks.forEach(([bx, by]) => {
    const x = originX + (piece.x + bx) * cell;
    const y = originY + (piece.y + by) * cell;

    if (piece.y + by < 0) return;

    drawCell(ctx, x, y, cell, piece.color, alpha);
  });
}

function drawGhostPiece(ctx, piece, originX, originY, cell) {
  if (!piece) return;

  piece.blocks.forEach(([bx, by]) => {
    const x = originX + (piece.x + bx) * cell;
    const y = originY + (piece.y + by) * cell;

    if (piece.y + by < 0) return;

    ctx.save();
    ctx.strokeStyle = STACKZ_COLORS.ghost;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 3, y + 3, cell - 6, cell - 6);
    ctx.restore();
  });
}

function drawTopHud(ctx, frame, width) {
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "800 13px sans-serif";
  ctx.fillText("STACKZ", 14, 24);

  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.font = "700 11px sans-serif";
  ctx.fillText(`Round ${frame.round}`, 92, 24);
  ctx.fillText(`Level ${frame.level}`, 158, 24);
  ctx.fillText(`Lines ${frame.lines}`, 224, 24);
}

function drawBottomCard(ctx, x, y, w, h, label, value, accent = "white") {
  ctx.save();

  const fill = ctx.createLinearGradient(x, y, x, y + h);
  fill.addColorStop(0, "rgba(255,255,255,0.075)");
  fill.addColorStop(1, "rgba(255,255,255,0.025)");

  ctx.shadowColor =
    accent === "cyan" ? "rgba(34,211,238,0.20)" : "rgba(180,134,255,0.16)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = fill;
  drawRoundedRect(ctx, x, y, w, h, 10);
  ctx.fill();

  const stroke = ctx.createLinearGradient(x, y, x + w, y + h);
  stroke.addColorStop(0, "rgba(34,211,238,0.22)");
  stroke.addColorStop(0.55, "rgba(255,255,255,0.10)");
  stroke.addColorStop(1, "rgba(236,72,153,0.18)");

  ctx.shadowBlur = 0;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 10);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.48)";
  ctx.font = "800 10px sans-serif";
  ctx.fillText(label, x + 12, y + 17);

  ctx.fillStyle =
    accent === "cyan" ? "rgba(103,242,255,0.98)" : "rgba(255,255,255,0.96)";
  ctx.font = "900 19px sans-serif";
  ctx.fillText(value, x + 12, y + 44);

  ctx.restore();
}

function drawNextPieceCard(ctx, nextPiece, x, y, w, h) {
  if (!nextPiece) return;

  ctx.save();

  const fill = ctx.createLinearGradient(x, y, x, y + h);
  fill.addColorStop(0, "rgba(255,255,255,0.075)");
  fill.addColorStop(1, "rgba(255,255,255,0.025)");

  ctx.shadowColor = "rgba(34,211,238,0.18)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = fill;
  drawRoundedRect(ctx, x, y, w, h, 10);
  ctx.fill();

  const stroke = ctx.createLinearGradient(x, y, x + w, y + h);
  stroke.addColorStop(0, "rgba(34,211,238,0.22)");
  stroke.addColorStop(0.55, "rgba(255,255,255,0.10)");
  stroke.addColorStop(1, "rgba(236,72,153,0.18)");

  ctx.shadowBlur = 0;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 10);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.48)";
  ctx.font = "800 10px sans-serif";
  ctx.fillText("Next", x + 12, y + 17);

  const previewCell = 14;
  const previewOriginX = x + Math.floor(w / 2) - 28;
  const previewOriginY = y + 34;

  nextPiece.blocks.forEach(([bx, by]) => {
    drawCell(
      ctx,
      previewOriginX + bx * previewCell,
      previewOriginY + by * previewCell,
      previewCell,
      nextPiece.color
    );
  });

  ctx.restore();
}

function drawBottomHud(ctx, frame, width, boardOriginY, boardHeight) {
  const gap = 10;
  const margin = 20;
  const cardHeight = 64;
  const y = boardOriginY + boardHeight + BOTTOM_CARD_GAP_FROM_BOARD;
  const cardWidth = Math.floor((width - margin * 2 - gap) / 2);

  drawBottomCard(
    ctx,
    margin,
    y,
    cardWidth,
    cardHeight,
    "Score",
    Number(frame.score || 0).toLocaleString()
  );

  drawNextPieceCard(
    ctx,
    frame.nextPiece,
    margin + cardWidth + gap,
    y,
    cardWidth,
    cardHeight
  );
}

function drawRoundIntro(ctx, width, height, round) {
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.font = "700 28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Round ${round}`, width / 2, height / 2 - 8);

  ctx.fillStyle = "rgba(255,255,255,0.58)";
  ctx.font = "500 13px sans-serif";
  ctx.fillText("Stack clean. Survive longer.", width / 2, height / 2 + 18);

  ctx.textAlign = "start";
}

function drawGameOverOverlay(ctx, width, height, frame) {
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.font = "700 26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", width / 2, height / 2 - 10);

  ctx.fillStyle = "rgba(255,255,255,0.58)";
  ctx.font = "500 13px sans-serif";
  ctx.fillText(
    `Score ${Number(frame.score || 0).toLocaleString()} • Lines ${frame.lines}`,
    width / 2,
    height / 2 + 16
  );

  ctx.textAlign = "start";
}

export function renderStackzFrame(ctx, frame) {
  if (!ctx || !frame) return;

  const width = STACKZ_CANVAS.width;
  const height = STACKZ_CANVAS.height;
  const cell = BOARD_CELL_OVERRIDE;

  const boardWidth = STACKZ_BOARD.cols * cell;
  const boardHeight = STACKZ_BOARD.rows * cell;

  const boardOriginX = Math.floor((width - boardWidth) / 2);
  const boardOriginY = BOARD_TOP;

  ctx.clearRect(0, 0, width, height);

  drawBackground(ctx, width, height);
  drawTopHud(ctx, frame, width);

  drawBoardFrame(ctx, boardOriginX, boardOriginY, boardWidth, boardHeight);
  drawGridLines(ctx, boardOriginX, boardOriginY, boardWidth, boardHeight, cell);
  drawPlacedBlocks(ctx, frame.grid, boardOriginX, boardOriginY, cell);
  drawGhostPiece(ctx, frame.ghostPiece, boardOriginX, boardOriginY, cell);
  drawPiece(ctx, frame.activePiece, boardOriginX, boardOriginY, cell);

  drawBottomHud(ctx, frame, width, boardOriginY, boardHeight);

  if (frame.showRoundIntro) {
    drawRoundIntro(ctx, width, height, frame.round);
  }

  if (frame.showGameOver) {
    drawGameOverOverlay(ctx, width, height, frame);
  }
}