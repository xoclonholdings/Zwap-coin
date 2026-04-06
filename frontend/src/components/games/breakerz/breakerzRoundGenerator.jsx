const BASE_TOP_OFFSET = 72;
const BASE_SIDE_PADDING = 14;
const BASE_ROW_GAP = 6;
const BASE_COL_GAP = 6;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pickPalette(round) {
  const palettes = [
    ["#22d3ee", "#67e8f9", "#a78bfa", "#f472b6"],
    ["#38bdf8", "#818cf8", "#c084fc", "#f9a8d4"],
    ["#34d399", "#22d3ee", "#60a5fa", "#a78bfa"],
    ["#f59e0b", "#fb7185", "#c084fc", "#22d3ee"],
    ["#2dd4bf", "#38bdf8", "#8b5cf6", "#ec4899"],
  ];

  return palettes[(round - 1) % palettes.length];
}

function getBrickValue(row, round) {
  return 10 + row * 2 + Math.floor(round * 1.5);
}

function createBrick({
  row,
  col,
  x,
  y,
  width,
  height,
  hp,
  color,
  round,
}) {
  return {
    id: `r${round}-row${row}-col${col}-${x}-${y}`,
    row,
    col,
    x,
    y,
    width,
    height,
    alive: true,
    hp,
    maxHp: hp,
    color,
    value: getBrickValue(row, round),
    glow: color,
  };
}

function buildGrid({
  rows,
  cols,
  brickWidth,
  brickHeight,
  sidePadding,
  topOffset,
  rowGap,
  colGap,
  round,
  hpFn,
  colorFn,
  includeFn,
}) {
  const bricks = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (includeFn && !includeFn(row, col, rows, cols)) continue;

      const x = sidePadding + col * (brickWidth + colGap);
      const y = topOffset + row * (brickHeight + rowGap);

      bricks.push(
        createBrick({
          row,
          col,
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          hp: hpFn ? hpFn(row, col, round) : 1,
          color: colorFn ? colorFn(row, col, round) : "#22d3ee",
          round,
        })
      );
    }
  }

  return bricks;
}

function getPatternType(round) {
  const patterns = [
    "full",
    "checker",
    "tunnel",
    "diamond",
    "fortress",
    "stairs-left",
    "stairs-right",
    "stripes",
  ];

  return patterns[(round - 1) % patterns.length];
}

function getDifficultyTier(round) {
  if (round <= 3) return 1;
  if (round <= 6) return 2;
  if (round <= 10) return 3;
  if (round <= 15) return 4;
  return 5;
}

function getRoundStats(round) {
  const difficultyTier = getDifficultyTier(round);

  return {
    round,
    difficultyTier,
    ballSpeed: 3.2 + (round - 1) * 0.14,
    paddleWidth: clamp(96 - (round - 1) * 1.5, 64, 96),
    brickHpBase: difficultyTier,
    bonusClearScore: 180 + round * 35,
  };
}

export function generateBreakerzRound({
  round = 1,
  width = 340,
  height = 420,
}) {
  const safeRound = Math.max(1, Number(round) || 1);
  const palette = pickPalette(safeRound);
  const pattern = getPatternType(safeRound);
  const stats = getRoundStats(safeRound);

  const cols = safeRound <= 3 ? 6 : safeRound <= 8 ? 7 : 8;
  const rows = clamp(4 + Math.floor((safeRound - 1) / 2), 4, 8);

  const sidePadding = BASE_SIDE_PADDING;
  const rowGap = BASE_ROW_GAP;
  const colGap = BASE_COL_GAP;
  const topOffset = BASE_TOP_OFFSET;

  const totalGapWidth = (cols - 1) * colGap;
  const brickWidth = Math.floor((width - sidePadding * 2 - totalGapWidth) / cols);
  const brickHeight = safeRound <= 5 ? 18 : 17;

  const centerCol = Math.floor(cols / 2);
  const centerRow = Math.floor(rows / 2);

  const hpFn = (row, col) => {
    const base = stats.brickHpBase;

    if (safeRound <= 2) return 1;
    if (safeRound <= 5) return row < 2 ? 1 : base;
    if (safeRound <= 9) return row < 2 ? base : base + 1;

    const reinforced = (row + col + safeRound) % 3 === 0;
    return reinforced ? base + 1 : base;
  };

  const colorFn = (row, col) => {
    return palette[(row + col) % palette.length];
  };

  let includeFn;

  switch (pattern) {
    case "checker":
      includeFn = (row, col) => (row + col) % 2 === 0;
      break;

    case "tunnel":
      includeFn = (row, col, totalRows, totalCols) => {
        const leftWall = col <= 1;
        const rightWall = col >= totalCols - 2;
        const roof = row === 0 || row === 1;
        return leftWall || rightWall || roof;
      };
      break;

    case "diamond":
      includeFn = (row, col) => {
        return (
          Math.abs(row - centerRow) + Math.abs(col - centerCol) <=
          Math.max(2, Math.floor(cols / 3))
        );
      };
      break;

    case "fortress":
      includeFn = (row, col, totalRows, totalCols) => {
        const border =
          row === 0 ||
          row === totalRows - 1 ||
          col === 0 ||
          col === totalCols - 1;
        const pillars =
          (col === 2 || col === totalCols - 3) &&
          row >= 1 &&
          row <= totalRows - 2;
        return border || pillars;
      };
      break;

    case "stairs-left":
      includeFn = (row, col) => col <= row + 2;
      break;

    case "stairs-right":
      includeFn = (row, col, totalRows, totalCols) =>
        col >= totalCols - row - 3;
      break;

    case "stripes":
      includeFn = (row) => row % 2 === 0;
      break;

    case "full":
    default:
      includeFn = () => true;
      break;
  }

  const bricks = buildGrid({
    rows,
    cols,
    brickWidth,
    brickHeight,
    sidePadding,
    topOffset,
    rowGap,
    colGap,
    round: safeRound,
    hpFn,
    colorFn,
    includeFn,
  });

  return {
    round: safeRound,
    pattern,
    width,
    height,
    rows,
    cols,
    bricks,
    stats,
    meta: {
      brickWidth,
      brickHeight,
      topOffset,
      sidePadding,
      palette,
    },
  };
}

export function getNextRoundNumber(currentRound) {
  return Math.max(1, Number(currentRound || 1)) + 1;
}

export function countAliveBricks(bricks = []) {
  return bricks.filter((brick) => brick.alive).length;
}