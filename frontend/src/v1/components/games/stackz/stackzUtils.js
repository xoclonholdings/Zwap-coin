import {
  STACKZ_BOARD,
  STACKZ_PIECES,
  STACKZ_PIECE_KEYS,
} from "./stackzConfig";

// Create empty grid
export function createGrid() {
  return Array.from({ length: STACKZ_BOARD.rows }, () =>
    Array(STACKZ_BOARD.cols).fill(null)
  );
}

// Random piece (7-bag later if needed)
export function getRandomPiece() {
  const key =
    STACKZ_PIECE_KEYS[
      Math.floor(Math.random() * STACKZ_PIECE_KEYS.length)
    ];

  const base = STACKZ_PIECES[key];

  return {
    key,
    color: base.color,
    blocks: base.blocks.map(([x, y]) => [x, y]),
    x: base.spawnX,
    y: base.spawnY,
  };
}

// Rotate blocks (clockwise)
export function rotateBlocks(blocks) {
  const maxY = Math.max(...blocks.map((b) => b[1]));
  return blocks.map(([x, y]) => [maxY - y, x]);
}

// Check if piece fits grid
export function isValidPosition(grid, piece, offsetX = 0, offsetY = 0, blocksOverride = null) {
  const blocks = blocksOverride || piece.blocks;

  return blocks.every(([bx, by]) => {
    const x = piece.x + bx + offsetX;
    const y = piece.y + by + offsetY;

    if (x < 0 || x >= STACKZ_BOARD.cols) return false;
    if (y >= STACKZ_BOARD.rows) return false;

    if (y >= 0 && grid[y][x]) return false;

    return true;
  });
}

// Lock piece into grid
export function placePiece(grid, piece) {
  const newGrid = grid.map((row) => [...row]);

  piece.blocks.forEach(([bx, by]) => {
    const x = piece.x + bx;
    const y = piece.y + by;

    if (y >= 0 && y < STACKZ_BOARD.rows) {
      newGrid[y][x] = piece.color;
    }
  });

  return newGrid;
}

// Clear full lines
export function clearLines(grid) {
  const newGrid = [];
  let cleared = 0;

  for (let r = 0; r < grid.length; r++) {
    if (grid[r].every((cell) => cell)) {
      cleared++;
    } else {
      newGrid.push(grid[r]);
    }
  }

  while (newGrid.length < STACKZ_BOARD.rows) {
    newGrid.unshift(Array(STACKZ_BOARD.cols).fill(null));
  }

  return { grid: newGrid, cleared };
}

// Hard drop position (ghost piece support)
export function getDropPosition(grid, piece) {
  let dropY = piece.y;

  while (
    isValidPosition(grid, piece, 0, dropY - piece.y + 1)
  ) {
    dropY++;
  }

  return dropY;
}

// Attempt move
export function movePiece(grid, piece, dx, dy) {
  if (isValidPosition(grid, piece, dx, dy)) {
    return {
      ...piece,
      x: piece.x + dx,
      y: piece.y + dy,
    };
  }
  return piece;
}

// Attempt rotation (with simple wall kicks)
export function rotatePiece(grid, piece) {
  const rotated = rotateBlocks(piece.blocks);

  if (isValidPosition(grid, piece, 0, 0, rotated)) {
    return { ...piece, blocks: rotated };
  }

  // wall kicks
  if (isValidPosition(grid, piece, -1, 0, rotated)) {
    return { ...piece, blocks: rotated, x: piece.x - 1 };
  }

  if (isValidPosition(grid, piece, 1, 0, rotated)) {
    return { ...piece, blocks: rotated, x: piece.x + 1 };
  }

  return piece;
}