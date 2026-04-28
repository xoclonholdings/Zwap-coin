function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export const STACKZ_CANVAS = {
  width: 320,
  height: 520,
};

export const STACKZ_BOARD = {
  cols: 10,
  rows: 20,
  visibleRows: 20,
  cell: 16,
};

export const STACKZ_FLOW = {
  introDelayMs: 450,
  lineClearDelayMs: 180,
  gameOverDelayMs: 900,
  lockDelayMs: 350,
};

export const STACKZ_LEVELS = {
  startLevel: 1,
  maxLevel: 50,
  linesPerLevel: 10,
};

export const STACKZ_DROP = {
  baseIntervalMs: 900,
  minIntervalMs: 80,
  levelStepMs: 55,
  softDropMultiplier: 0.08,
};

export const STACKZ_SCORING = {
  single: 100,
  double: 300,
  triple: 500,
  tetris: 800,
  softDropPerCell: 1,
  hardDropPerCell: 2,
};

export const STACKZ_COLORS = {
  I: "#00f5ff",
  O: "#ffd700",
  T: "#a855f7",
  S: "#22c55e",
  Z: "#ef4444",
  J: "#3b82f6",
  L: "#f97316",
  ghost: "rgba(255,255,255,0.18)",
  grid: "rgba(255,255,255,0.08)",
  frame: "rgba(168,85,247,0.18)",
};

export const STACKZ_PIECES = {
  I: {
    key: "I",
    color: STACKZ_COLORS.I,
    spawnX: 3,
    spawnY: 0,
    blocks: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
  },
  O: {
    key: "O",
    color: STACKZ_COLORS.O,
    spawnX: 4,
    spawnY: 0,
    blocks: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  },
  T: {
    key: "T",
    color: STACKZ_COLORS.T,
    spawnX: 3,
    spawnY: 0,
    blocks: [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
  },
  S: {
    key: "S",
    color: STACKZ_COLORS.S,
    spawnX: 3,
    spawnY: 0,
    blocks: [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
  },
  Z: {
    key: "Z",
    color: STACKZ_COLORS.Z,
    spawnX: 3,
    spawnY: 0,
    blocks: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
  },
  J: {
    key: "J",
    color: STACKZ_COLORS.J,
    spawnX: 3,
    spawnY: 0,
    blocks: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
  L: {
    key: "L",
    color: STACKZ_COLORS.L,
    spawnX: 3,
    spawnY: 0,
    blocks: [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
};

export const STACKZ_PIECE_KEYS = Object.keys(STACKZ_PIECES);

export function getStackzDropInterval(level = 1) {
  const safeLevel = Math.max(STACKZ_LEVELS.startLevel, Number(level) || 1);

  return clamp(
    STACKZ_DROP.baseIntervalMs - (safeLevel - 1) * STACKZ_DROP.levelStepMs,
    STACKZ_DROP.minIntervalMs,
    STACKZ_DROP.baseIntervalMs
  );
}

export function getStackzLevelFromLines(lines = 0) {
  const safeLines = Math.max(0, Number(lines) || 0);

  return clamp(
    Math.floor(safeLines / STACKZ_LEVELS.linesPerLevel) + 1,
    STACKZ_LEVELS.startLevel,
    STACKZ_LEVELS.maxLevel
  );
}

export function getStackzLineScore(lineCount = 0, level = 1) {
  const safeLevel = Math.max(1, Number(level) || 1);

  if (lineCount === 1) return STACKZ_SCORING.single * safeLevel;
  if (lineCount === 2) return STACKZ_SCORING.double * safeLevel;
  if (lineCount === 3) return STACKZ_SCORING.triple * safeLevel;
  if (lineCount >= 4) return STACKZ_SCORING.tetris * safeLevel;

  return 0;
}
