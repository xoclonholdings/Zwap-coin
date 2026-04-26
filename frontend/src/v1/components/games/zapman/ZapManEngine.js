import {
  GRID_WIDTH,
  GRID_HEIGHT,
  INITIAL_PLAYER_POSITION,
  INITIAL_PLAYER_DIRECTION,
  INITIAL_ENEMY_SPEED,
  MIN_ENEMY_SPEED,
  ENEMY_SPEED_STEP,
  INITIAL_ENEMY_COUNT,
  MAX_ENEMIES,
  ROUND_PELLET_COUNT,
  DIRECTIONS,
  WALLS,
} from "./ZapManConstants";

const WALL_SET = new Set(WALLS);

function key(x, y) {
  return `${x},${y}`;
}

export function isWall(x, y) {
  return WALL_SET.has(key(x, y));
}

export function isInsideGrid(x, y) {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

export function isWalkable(x, y) {
  return isInsideGrid(x, y) && !isWall(x, y);
}

function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function getAllWalkableTiles() {
  const tiles = [];

  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      if (isWalkable(x, y)) {
        tiles.push({ x, y });
      }
    }
  }

  return tiles;
}

function getRandomWalkableTile(excluded = []) {
  const excludedKeys = new Set(excluded.map((tile) => key(tile.x, tile.y)));
  const candidates = getAllWalkableTiles().filter(
    (tile) => !excludedKeys.has(key(tile.x, tile.y))
  );

  if (candidates.length === 0) {
    return { ...INITIAL_PLAYER_POSITION };
  }

  return candidates[randomInt(candidates.length)];
}

function getAvailableMoves(position) {
  return Object.entries(DIRECTIONS)
    .map(([name, vector]) => ({
      name,
      x: position.x + vector.x,
      y: position.y + vector.y,
    }))
    .filter((move) => isWalkable(move.x, move.y));
}

function movePlayer(player, direction) {
  const vector = DIRECTIONS[direction] || DIRECTIONS.right;
  const nextX = player.x + vector.x;
  const nextY = player.y + vector.y;

  if (!isWalkable(nextX, nextY)) {
    return {
      ...player,
      direction,
    };
  }

  return {
    x: nextX,
    y: nextY,
    direction,
  };
}

function moveEnemyTowardPlayer(enemy, player) {
  const options = getAvailableMoves(enemy);

  if (options.length === 0) {
    return enemy;
  }

  const ranked = options
    .map((option) => ({
      ...option,
      score:
        Math.abs(option.x - player.x) + Math.abs(option.y - player.y) + Math.random() * 0.25,
    }))
    .sort((a, b) => a.score - b.score);

  const best = ranked[0];

  return {
    x: best.x,
    y: best.y,
  };
}

function generatePellets(player, enemies, count = ROUND_PELLET_COUNT) {
  const excluded = [player, ...enemies];
  const excludedKeys = new Set(excluded.map((tile) => key(tile.x, tile.y)));
  const walkableTiles = getAllWalkableTiles().filter(
    (tile) => !excludedKeys.has(key(tile.x, tile.y))
  );

  const pellets = [];
  const used = new Set();

  while (pellets.length < count && used.size < walkableTiles.length) {
    const tile = walkableTiles[randomInt(walkableTiles.length)];
    const tileKey = key(tile.x, tile.y);

    if (!used.has(tileKey)) {
      used.add(tileKey);
      pellets.push(tile);
    }
  }

  return pellets;
}

function generateEnemies(count, player) {
  const enemies = [];

  while (enemies.length < count) {
    const spawn = getRandomWalkableTile([player, ...enemies]);

    if (
      Math.abs(spawn.x - player.x) + Math.abs(spawn.y - player.y) >= 4 &&
      !enemies.some((enemy) => positionsEqual(enemy, spawn))
    ) {
      enemies.push(spawn);
    }
  }

  return enemies;
}

export function createInitialState() {
  const player = {
    ...INITIAL_PLAYER_POSITION,
    direction: INITIAL_PLAYER_DIRECTION,
  };

  const enemies = generateEnemies(INITIAL_ENEMY_COUNT, player);
  const pellets = generatePellets(player, enemies);

  return {
    round: 1,
    score: 0,
    pelletsCollected: 0,
    isGameOver: false,
    player,
    queuedDirection: INITIAL_PLAYER_DIRECTION,
    enemies,
    pellets,
    enemyMoveInterval: INITIAL_ENEMY_SPEED,
    lastEnemyMoveAt: 0,
  };
}

export function setQueuedDirection(state, direction) {
  if (!DIRECTIONS[direction]) {
    return state;
  }

  return {
    ...state,
    queuedDirection: direction,
  };
}

export function advancePlayer(state) {
  if (state.isGameOver) {
    return state;
  }

  const preferredMove = movePlayer(state.player, state.queuedDirection);
  const nextPlayer =
    preferredMove.x !== state.player.x || preferredMove.y !== state.player.y
      ? preferredMove
      : movePlayer(state.player, state.player.direction);

  const remainingPellets = state.pellets.filter(
    (pellet) => !positionsEqual(pellet, nextPlayer)
  );

  const collectedThisStep = state.pellets.length - remainingPellets.length;

  return {
    ...state,
    player: nextPlayer,
    pellets: remainingPellets,
    score: state.score + collectedThisStep * 10,
    pelletsCollected: state.pelletsCollected + collectedThisStep,
  };
}

export function advanceEnemies(state, now) {
  if (state.isGameOver) {
    return state;
  }

  if (now - state.lastEnemyMoveAt < state.enemyMoveInterval) {
    return state;
  }

  const enemies = state.enemies.map((enemy) => moveEnemyTowardPlayer(enemy, state.player));

  return {
    ...state,
    enemies,
    lastEnemyMoveAt: now,
  };
}

export function checkCollision(player, enemies) {
  return enemies.some((enemy) => positionsEqual(player, enemy));
}

export function maybeAdvanceRound(state) {
  if (state.pellets.length > 0 || state.isGameOver) {
    return state;
  }

  const nextRound = state.round + 1;
  const enemyCount = Math.min(INITIAL_ENEMY_COUNT + (nextRound - 1), MAX_ENEMIES);
  const enemyMoveInterval = Math.max(
    INITIAL_ENEMY_SPEED - (nextRound - 1) * ENEMY_SPEED_STEP,
    MIN_ENEMY_SPEED
  );

  const player = {
    ...INITIAL_PLAYER_POSITION,
    direction: INITIAL_PLAYER_DIRECTION,
  };

  const enemies = generateEnemies(enemyCount, player);
  const pellets = generatePellets(player, enemies);

  return {
    ...state,
    round: nextRound,
    player,
    queuedDirection: INITIAL_PLAYER_DIRECTION,
    enemies,
    pellets,
    enemyMoveInterval,
    lastEnemyMoveAt: 0,
  };
}

export function applyGameOver(state) {
  return {
    ...state,
    isGameOver: true,
  };
}

export function restartGame() {
  return createInitialState();
}