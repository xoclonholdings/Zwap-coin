import {
  STACKZ_FLOW,
  getStackzDropInterval,
  getStackzLevelFromLines,
  getStackzLineScore,
} from "./stackzConfig";
import {
  createGrid,
  getRandomPiece,
  isValidPosition,
  placePiece,
  clearLines,
  getDropPosition,
  movePiece,
  rotatePiece,
} from "./stackzUtils";

function nowMs() {
  return performance.now();
}

function clonePiece(piece) {
  return {
    ...piece,
    blocks: piece.blocks.map(([x, y]) => [x, y]),
  };
}

export function createStackzEngine({
  startingLevel = 1,
  startingRound = 1,
  dropSpeedMultiplier = 1,
} = {}) {
  let grid = createGrid();
  let activePiece = getRandomPiece();
  let nextPiece = getRandomPiece();

  let score = 0;
  let lines = 0;
  let round = Math.max(1, Number(startingRound) || 1);
  let level = Math.max(1, Number(startingLevel) || 1);

  let phase = "intro";
  let paused = false;
  let finished = false;

  const safeDropSpeedMultiplier = Math.min(
    Math.max(Number(dropSpeedMultiplier) || 1, 0.35),
    1.5
  );

  let introUntil = nowMs() + STACKZ_FLOW.introDelayMs;
  let lineClearUntil = 0;
  let gameOverUntil = 0;

  let lastTime = 0;
  let dropAccumulator = 0;
  let lockAccumulator = 0;
  let softDropping = false;

  function refreshLevelAndRound() {
    level = getStackzLevelFromLines(lines);
    round = Math.max(1, Math.floor(lines / 10) + 1);
  }

  function getGhostPiece() {
    const ghostY = getDropPosition(grid, activePiece);
    return {
      ...activePiece,
      y: ghostY,
      blocks: activePiece.blocks.map(([x, y]) => [x, y]),
    };
  }

  function buildFrame() {
    return {
      grid,
      activePiece: clonePiece(activePiece),
      nextPiece: clonePiece(nextPiece),
      ghostPiece: getGhostPiece(),
      score,
      lines,
      level,
      round,
      paused,
      finished,
      showRoundIntro: phase === "intro",
      showGameOver: phase === "gameover",
      phase,
    };
  }

  function spawnNextPiece() {
    activePiece = {
      ...nextPiece,
      blocks: nextPiece.blocks.map(([x, y]) => [x, y]),
    };
    nextPiece = getRandomPiece();

    if (!isValidPosition(grid, activePiece, 0, 0)) {
      phase = "gameover";
      gameOverUntil = nowMs() + STACKZ_FLOW.gameOverDelayMs;
    }
  }

  function lockPiece() {
    grid = placePiece(grid, activePiece);

    const clearedResult = clearLines(grid);
    grid = clearedResult.grid;

    if (clearedResult.cleared > 0) {
      score += getStackzLineScore(clearedResult.cleared, level);
      lines += clearedResult.cleared;
      refreshLevelAndRound();
      phase = "line-clear";
      lineClearUntil = nowMs() + STACKZ_FLOW.lineClearDelayMs;
    } else {
      spawnNextPiece();
    }

    lockAccumulator = 0;
    dropAccumulator = 0;
  }

  function stepDown() {
    const moved = movePiece(grid, activePiece, 0, 1);

    if (moved.y !== activePiece.y) {
      activePiece = moved;
      lockAccumulator = 0;
      return true;
    }

    lockAccumulator += 16.6667;

    if (lockAccumulator >= STACKZ_FLOW.lockDelayMs) {
      lockPiece();
    }

    return false;
  }

  function tick(currentTime = nowMs()) {
    if (finished || paused) {
      return buildFrame();
    }

    if (phase === "intro") {
      if (currentTime >= introUntil) {
        phase = "live";
        lastTime = currentTime;
      }

      return buildFrame();
    }

    if (phase === "line-clear") {
      if (currentTime >= lineClearUntil) {
        spawnNextPiece();
        phase = "live";
        lastTime = currentTime;
      }

      return buildFrame();
    }

    if (phase === "gameover") {
      if (currentTime >= gameOverUntil) {
        finished = true;
      }

      return buildFrame();
    }

    const dt = Math.max(0, currentTime - lastTime);
    lastTime = currentTime;
    dropAccumulator += dt;

    const baseDropInterval = getStackzDropInterval(level) * safeDropSpeedMultiplier;

    const dropInterval = softDropping
      ? Math.max(25, baseDropInterval * 0.08)
      : Math.max(60, baseDropInterval);

    while (dropAccumulator >= dropInterval && phase === "live") {
      const movedDown = stepDown();
      dropAccumulator -= dropInterval;

      if (softDropping && movedDown) {
        score += 1;
      }

      if (phase !== "live") break;
    }

    return buildFrame();
  }

  function moveLeft() {
    if (paused || phase !== "live") return;
    activePiece = movePiece(grid, activePiece, -1, 0);
  }

  function moveRight() {
    if (paused || phase !== "live") return;
    activePiece = movePiece(grid, activePiece, 1, 0);
  }

  function softDropStart() {
    if (paused || phase !== "live") return;
    softDropping = true;
  }

  function softDropStop() {
    softDropping = false;
  }

  function rotateActive() {
    if (paused || phase !== "live") return;
    activePiece = rotatePiece(grid, activePiece);
  }

  function hardDrop() {
    if (paused || phase !== "live") return;

    const targetY = getDropPosition(grid, activePiece);
    const distance = Math.max(0, targetY - activePiece.y);

    activePiece = {
      ...activePiece,
      y: targetY,
    };

    score += distance * 2;
    lockPiece();
  }

  function togglePause() {
    if (phase === "gameover") return;
    paused = !paused;
  }

  function resume() {
    paused = false;
  }

  function confirmExit() {
    finished = true;
    paused = false;
  }

  function getResult() {
    return {
      score,
      lines,
      level,
      round,
      finished,
    };
  }

  return {
    tick,
    buildFrame,
    moveLeft,
    moveRight,
    softDropStart,
    softDropStop,
    rotateActive,
    hardDrop,
    togglePause,
    resume,
    confirmExit,
    getResult,
    isFinished: () => finished,
    isPaused: () => paused,
  };
}
