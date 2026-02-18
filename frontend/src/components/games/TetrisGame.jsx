import React, { useEffect, useRef, useCallback } from "react";

const COLS = 10;
const ROWS = 20;
const CELL = 14;

const SHAPES = {
  I: { blocks: [[0,0],[1,0],[2,0],[3,0]], color: "#00f5ff" },
  O: { blocks: [[0,0],[1,0],[0,1],[1,1]], color: "#ffd700" },
  T: { blocks: [[0,0],[1,0],[2,0],[1,1]], color: "#a855f7" },
  S: { blocks: [[1,0],[2,0],[0,1],[1,1]], color: "#22c55e" },
  Z: { blocks: [[0,0],[1,0],[1,1],[2,1]], color: "#ef4444" },
  J: { blocks: [[0,0],[0,1],[1,1],[2,1]], color: "#3b82f6" },
  L: { blocks: [[2,0],[0,1],[1,1],[2,1]], color: "#f97316" },
};
const SHAPE_KEYS = Object.keys(SHAPES);

function randomPiece() {
  const key = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
  return { key, blocks: SHAPES[key].blocks.map(([x,y]) => [x,y]), color: SHAPES[key].color, x: 3, y: 0 };
}

function rotate(blocks) {
  const maxY = Math.max(...blocks.map(b => b[1]));
  return blocks.map(([x, y]) => [maxY - y, x]);
}

export default function TetrisGame({ onGameEnd, isPlaying, level }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const animRef = useRef(null);

  const endGame = useCallback((score, lines) => {
    onGameEnd(score, 0, level, false);
  }, [onGameEnd, level]);

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = COLS * CELL;
    const H = ROWS * CELL;

    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    const g = { piece: randomPiece(), next: randomPiece(), score: 0, lines: 0, dropTimer: 0, speed: Math.max(500 - level * 40, 80), running: true };
    gameRef.current = g;

    function fits(blocks, px, py) {
      return blocks.every(([bx, by]) => {
        const nx = px + bx, ny = py + by;
        return nx >= 0 && nx < COLS && ny < ROWS && (ny < 0 || !grid[ny][nx]);
      });
    }

    function lock() {
      g.piece.blocks.forEach(([bx, by]) => {
        const ny = g.piece.y + by;
        const nx = g.piece.x + bx;
        if (ny >= 0 && ny < ROWS) grid[ny][nx] = g.piece.color;
      });
      // Clear lines
      let cleared = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r].every(c => c)) {
          grid.splice(r, 1);
          grid.unshift(Array(COLS).fill(null));
          cleared++;
          r++;
        }
      }
      if (cleared) {
        const pts = [0, 100, 300, 500, 800][cleared] || 800;
        g.score += pts * level;
        g.lines += cleared;
      }
      g.piece = g.next;
      g.next = randomPiece();
      if (!fits(g.piece.blocks, g.piece.x, g.piece.y)) {
        g.running = false;
        endGame(g.score, g.lines);
      }
    }

    function move(dx, dy) {
      if (fits(g.piece.blocks, g.piece.x + dx, g.piece.y + dy)) {
        g.piece.x += dx;
        g.piece.y += dy;
        return true;
      }
      return false;
    }

    function rotatePiece() {
      const nb = rotate(g.piece.blocks);
      if (fits(nb, g.piece.x, g.piece.y)) g.piece.blocks = nb;
      else if (fits(nb, g.piece.x - 1, g.piece.y)) { g.piece.blocks = nb; g.piece.x -= 1; }
      else if (fits(nb, g.piece.x + 1, g.piece.y)) { g.piece.blocks = nb; g.piece.x += 1; }
    }

    function hardDrop() {
      while (move(0, 1)) { g.score += 2; }
      lock();
    }

    // Touch controls
    let touchStartX = 0, touchStartY = 0, touchMoved = false;
    const onTouchStart = (e) => { e.preventDefault(); touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; touchMoved = false; };
    const onTouchMove = (e) => {
      e.preventDefault();
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dx) > 30) { move(dx > 0 ? 1 : -1, 0); touchStartX = e.touches[0].clientX; touchMoved = true; }
      if (dy > 40) { hardDrop(); touchMoved = true; touchStartY = e.touches[0].clientY; }
    };
    const onTouchEnd = (e) => { e.preventDefault(); if (!touchMoved) rotatePiece(); };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    // Keyboard
    const onKey = (e) => {
      if (!g.running) return;
      if (e.key === "ArrowLeft") move(-1, 0);
      else if (e.key === "ArrowRight") move(1, 0);
      else if (e.key === "ArrowDown") move(0, 1);
      else if (e.key === "ArrowUp") rotatePiece();
      else if (e.key === " ") hardDrop();
    };
    window.addEventListener("keydown", onKey);

    let lastTime = 0;
    function loop(ts) {
      if (!g.running) return;
      const dt = ts - lastTime;
      g.dropTimer += dt;
      lastTime = ts;
      if (g.dropTimer > g.speed) { if (!move(0, 1)) lock(); g.dropTimer = 0; }

      // Draw
      ctx.fillStyle = "#0a0b1e";
      ctx.fillRect(0, 0, W, H);
      // Grid
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (grid[r][c]) { ctx.fillStyle = grid[r][c]; ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1); }
        else { ctx.strokeStyle = "#1a1b3e"; ctx.strokeRect(c * CELL, r * CELL, CELL - 1, CELL - 1); }
      }
      // Active piece
      ctx.shadowColor = g.piece.color; ctx.shadowBlur = 6;
      g.piece.blocks.forEach(([bx, by]) => {
        ctx.fillStyle = g.piece.color;
        ctx.fillRect((g.piece.x + bx) * CELL, (g.piece.y + by) * CELL, CELL - 1, CELL - 1);
      });
      ctx.shadowBlur = 0;
      // HUD
      ctx.fillStyle = "#fff"; ctx.font = "10px 'Exo 2'";
      ctx.fillText(`Score: ${g.score}  Lines: ${g.lines}  Lvl: ${level}`, 4, H - 4);

      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, level, endGame]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="rounded-xl border border-purple-500/30 touch-none" />
      <p className="text-gray-500 text-[10px] mt-2">Swipe L/R to move | Tap to rotate | Swipe down to drop</p>
    </div>
  );
}
