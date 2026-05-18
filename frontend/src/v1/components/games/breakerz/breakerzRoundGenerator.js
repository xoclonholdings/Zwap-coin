const BASE_TOP_OFFSET = 74;
const BASE_SIDE_PADDING = 18;
const BASE_ROW_GAP = 7;
const BASE_COL_GAP = 7;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pickPalette(round) {
  const palettes = [
    ["#22d3ee", "#0ea5e9", "#d946ef", "#ec4899", "#f59e0b", "#ef4444"],
    ["#38bdf8", "#2563eb", "#c084fc", "#f472b6", "#facc15", "#fb7185"],
    ["#67e8f9", "#22d3ee", "#a78bfa", "#ec4899", "#f97316", "#ef4444"],
    ["#0ea5e9", "#22d3ee", "#d946ef", "#f472b6", "#f59e0b", "#dc2626"],
    ["#2dd4bf", "#38bdf8", "#8b5cf6", "#ec4899", "#facc15", "#fb7185"],
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
  glow,
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
    glow: glow || color,
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

      const rowInset = row % 2 === 1 ? Math.min(5, colGap) : 0;
      const x = sidePadding + rowInset + col * (brickWidth + colGap);
      const y = topOffset + row * (brickHeight + rowGap);
      const colorData = colorFn
        ? colorFn(row, col, round)
        : { color: "#22d3ee", glow: "#22d3ee" };

      bricks.push(
        createBrick({
          row,
          col,
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          hp: hpFn ? hpFn(row, col, round) : 1,
          color: colorData.color || colorData,
          glow: colorData.glow || colorData.color || colorData,
          round,
        })
      );
    }
  }

  return bricks;
}

function getPatternType(round) {
  const patterns = [
    "cover-wall",
    "split-wall",
    "combo-gates",
    "diamond-core",
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
    ballSpeed: 3.35 + (round - 1) * 0.13,
    paddleWidth: clamp(104 - (round - 1) * 1.45, 68, 104),
    brickHpBase: difficultyTier,
    bonusClearScore: 180 + round * 35,
  };
}

function getRowBandColor(row, col, palette) {
  const bandMap = [
    { color: palette[0], glow: "#22d3ee" },
    { color: palette[1], glow: "#38bdf8" },
    { color: palette[2], glow: "#d946ef" },
    { color: palette[3], glow: "#ec4899" },
    { color: palette[4], glow: "#f59e0b" },
    { color: palette[5], glow: "#ef4444" },
  ];

  const band = bandMap[row % bandMap.length];
  const shimmer = col % 3 === 0;

  if (!shimmer) return band;

  return {
    color: band.color,
    glow: band.glow,
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

  const cols = safeRound <= 4 ? 6 : safeRound <= 9 ? 7 : 8;
  const rows = clamp(5 + Math.floor((safeRound - 1) / 3), 5, 8);

  const sidePadding = BASE_SIDE_PADDING;
  const rowGap = BASE_ROW_GAP;
  const colGap = BASE_COL_GAP;
  const topOffset = BASE_TOP_OFFSET;

  const totalGapWidth = (cols - 1) * colGap;
  const brickWidth = Math.floor((width - sidePadding * 2 - totalGapWidth - 5) / cols);
  const brickHeight = safeRound <= 5 ? 17 : 16;

  const centerCol = Math.floor(cols / 2);
  const centerRow = Math.floor(rows / 2);

  const hpFn = (row, col) => {
    const base = stats.brickHpBase;

    if (safeRound <= 2) return 1;
    if (safeRound <= 5) return row < 2 ? 1 : base;

    const reinforced = (row + col + safeRound) % 4 === 0;
    const coreBrick =
      Math.abs(row - centerRow) <= 1 && Math.abs(col - centerCol) <= 1;

    if (safeRound <= 9) return reinforced || coreBrick ? base + 1 : base;

    return reinforced || coreBrick ? base + 2 : base + 1;
  };

  const colorFn = (row, col) => {
    return getRowBandColor(row, col, palette);
  };

  let includeFn;

  switch (pattern) {
    case "split-wall":
      includeFn = (row, col, totalRows, totalCols) => {
        const middleLeft = Math.floor(totalCols / 2) - 1;
        const middleRight = Math.ceil(totalCols / 2);

        if (row >= Math.floor(totalRows / 2) && col >= middleLeft && col <= middleRight) {
          return false;
        }

        return true;
      };
      break;

    case "combo-gates":
      includeFn = (row, col, totalRows, totalCols) => {
        const outer = col === 0 || col === totalCols - 1;
        const roof = row <= 1;
        const gates = row >= 2 && (col === 1 || col === totalCols - 2);
        const lowerBanks = row >= totalRows - 2 && col % 2 === 0;

        return outer || roof || gates || lowerBanks;
      };
      break;

    case "diamond-core":
      includeFn = (row, col) => {
        return (
          Math.abs(row - centerRow) + Math.abs(col - centerCol) <=
          Math.max(2, Math.floor(cols / 2))
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
        const crown = row === 1 && col >= 1 && col <= totalCols - 2;

        return border || pillars || crown;
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
      includeFn = (row, col) => row % 2 === 0 || col === 0 || col % 3 === 0;
      break;

    case "cover-wall":
    default:
      includeFn = (row, col, totalRows, totalCols) => {
        const centerGap =
          row >= Math.floor(totalRows / 2) &&
          row <= Math.floor(totalRows / 2) + 1 &&
          col >= Math.floor(totalCols / 2) - 1 &&
          col <= Math.floor(totalCols / 2);

        return !centerGap;
      };
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