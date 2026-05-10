import {
  GRID_WIDTH,
  GRID_HEIGHT,
  INITIAL_PLAYER_POSITION,
  INITIAL_PLAYER_DIRECTION,
  INITIAL_LIVES,
  INITIAL_ENEMY_SPEED,
  MIN_ENEMY_SPEED,
  ENEMY_SPEED_STEP,
  INITIAL_ENEMY_COUNT,
  MAX_ENEMIES,
  ROUND_PELLET_COUNT,
  ROUND_POWER_PELLET_COUNT,
  POWER_MODE_MS,
  POWER_ENEMY_SCORE,
  DIRECTIONS,
  ZAPMAN_CHARACTERS,
  getWallsForRound,
} from "./ZapManConstants";

function key(x, y) {
  return `${x},${y}`;
}

function getWallSet(round = 1) {
  return new Set(getWallsForRound(round));
}

export function isWall(x, y, round = 1) {
  return getWallSet(round).has(key(x, y));
}

export function isInsideGrid(x, y) {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
}

export function isWalkable(x, y, round = 1) {
  return isInsideGrid(x, y) && !isWall(x, y, round);
}

function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function getAllWalkableTiles(round = 1) {
  const tiles = [];

  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      if (isWalkable(x, y, round)) {
        tiles.push({ x, y });
      }
    }
  }

  return tiles;
}

function getRandomWalkableTile(round = 1, excluded = []) {
  const excludedKeys = new Set(excluded.map((tile) => key(tile.x, tile.y)));

  const candidates = getAllWalkableTiles(round).filter(
    (tile) => !excludedKeys.has(key(tile.x, tile.y))
  );

  if (candidates.length === 0) {
    return { ...INITIAL_PLAYER_POSITION };
  }

  return candidates[randomInt(candidates.length)];
}

function getAvailableMoves(position, round = 1) {
  return Object.entries(DIRECTIONS)
    .map(([name, vector]) => ({
      name,
      x: position.x + vector.x,
      y: position.y + vector.y,
    }))
    .filter((move) => isWalkable(move.x, move.y, round));
}

function movePlayer(player, direction, round = 1) {
  const vector = DIRECTIONS[direction] || DIRECTIONS.right;
  const nextX = player.x + vector.x;
  const nextY = player.y + vector.y;

  if (!isWalkable(nextX, nextY, round)) {
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

function moveEnemyTowardPlayer(enemy, player, round = 1, powered = false) {
  const options = getAvailableMoves(enemy, round);

  if (options.length === 0) {
    return enemy;
  }

  const ranked = options
    .map((option) => {
      const distance =
        Math.abs(option.x - player.x) + Math.abs(option.y - player.y);

      return {
        ...option,
        score: powered
          ? -distance + Math.random() * 0.25
          : distance + Math.random() * 0.25,
      };
    })
    .sort((a, b) => a.score - b.score);

  const best = ranked[0];

  return {
    ...enemy,
    x: best.x,
    y: best.y,
  };
}

function generatePellets({
  round = 1,
  player,
  enemies,
  powerPellets,
  count = ROUND_PELLET_COUNT,
}) {
  const excluded = [player, ...enemies, ...powerPellets];
  const excludedKeys = new Set(excluded.map((tile) => key(tile.x, tile.y)));

  const walkableTiles = getAllWalkableTiles(round).filter(
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

function generatePowerPellets({
  round = 1,
  player,
  enemies,
  count = ROUND_POWER_PELLET_COUNT,
}) {
  const preferred = [
    { x: 1, y: 1 },
    { x: GRID_WIDTH - 2, y: 1 },
    { x: 1, y: GRID_HEIGHT - 2 },
    { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 },
  ];

  const excluded = [player, ...enemies];
  const excludedKeys = new Set(excluded.map((tile) => key(tile.x, tile.y)));

  const powerPellets = [];
  const used = new Set();

  preferred.forEach((tile) => {
    if (
      powerPellets.length < count &&
      isWalkable(tile.x, tile.y, round) &&
      !excludedKeys.has(key(tile.x, tile.y))
    ) {
      powerPellets.push(tile);
      used.add(key(tile.x, tile.y));
    }
  });

  while (powerPellets.length < count) {
    const tile = getRandomWalkableTile(round, [
      ...excluded,
      ...powerPellets,
    ]);

    const tileKey = key(tile.x, tile.y);

    if (!used.has(tileKey)) {
      used.add(tileKey);
      powerPellets.push(tile);
    } else {
      break;
    }
  }

  return powerPellets;
}

function generateEnemies(count, player, round = 1) {
  const enemies = [];

  while (enemies.length < count) {
    const spawn = getRandomWalkableTile(round, [player, ...enemies]);

    if (
      Math.abs(spawn.x - player.x) + Math.abs(spawn.y - player.y) >= 4 &&
      !enemies.some((enemy) => positionsEqual(enemy, spawn))
    ) {
      const enemyIndex = enemies.length;

      enemies.push({
        ...spawn,
        id: `${round}-${enemyIndex}-${Date.now()}-${Math.random()}`,
        character:
          ZAPMAN_CHARACTERS.enemies[
            enemyIndex % ZAPMAN_CHARACTERS.enemies.length
          ],
      });
    }
  }

  return enemies;
}

function createPlayer() {
  return {
    ...INITIAL_PLAYER_POSITION,
    direction: INITIAL_PLAYER_DIRECTION,
    character: ZAPMAN_CHARACTERS.player,
  };
}

function calculateRoundReward(state) {
  const round = Number(state?.round || 1);
  const pelletsCollected = Number(state?.pelletsCollected || 0);
  const powerPelletsCollected = Number(state?.powerPelletsCollected || 0);
  const enemiesZapped = Number(state?.enemiesZapped || 0);

  return (
    10 +
    round * 5 +
    Math.floor(pelletsCollected / 10) * 2 +
    powerPelletsCollected * 3 +
    enemiesZapped * 5
  );
}

function resetPositionsAfterHit(state) {
  const player = createPlayer();
  const enemies = generateEnemies(state.enemies.length, player, state.round);

  return {
    ...state,
    player,
    queuedDirection: INITIAL_PLAYER_DIRECTION,
    enemies,
    lastEnemyMoveAt: 0,
  };
}

function buildRoundState({
  round = 1,
  score = 0,
  lives = INITIAL_LIVES,
  pelletsCollected = 0,
  totalZptsEarned = 0,
  poweredUntil = 0,
} = {}) {
  const safeRound = Math.max(1, Number(round) || 1);
  const player = createPlayer();

  const enemyCount = Math.min(
    INITIAL_ENEMY_COUNT + (safeRound - 1),
    MAX_ENEMIES
  );

  const enemyMoveInterval = Math.max(
    INITIAL_ENEMY_SPEED - (safeRound - 1) * ENEMY_SPEED_STEP,
    MIN_ENEMY_SPEED
  );

  const enemies = generateEnemies(enemyCount, player, safeRound);
  const powerPellets = generatePowerPellets({
    round: safeRound,
    player,
    enemies,
  });

  const pellets = generatePellets({
    round: safeRound,
    player,
    enemies,
    powerPellets,
  });

  return {
    round: safeRound,
    score,
    lives,
    pelletsCollected,
    powerPelletsCollected: 0,
    enemiesZapped: 0,
    totalZptsEarned,
    roundCompleted: false,
    completedRound: null,
    nextRound: null,
    roundReward: 0,
    baseZpts: 0,
    isGameOver: false,
    player,
    queuedDirection: INITIAL_PLAYER_DIRECTION,
    enemies,
    pellets,
    powerPellets,
    poweredUntil,
    enemyMoveInterval,
    lastEnemyMoveAt: 0,
  };
}

export function createInitialState(options = {}) {
  return buildRoundState(options);
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

export function isPowered(state, now = Date.now()) {
  return Number(state.poweredUntil || 0) > now;
}

export function advancePlayer(state, now = Date.now()) {
  if (state.isGameOver) {
    return state;
  }

  const preferredMove = movePlayer(
    state.player,
    state.queuedDirection,
    state.round
  );

  const nextPlayer =
    preferredMove.x !== state.player.x || preferredMove.y !== state.player.y
      ? preferredMove
      : movePlayer(state.player, state.player.direction, state.round);

  const remainingPellets = state.pellets.filter(
    (pellet) => !positionsEqual(pellet, nextPlayer)
  );

  const remainingPowerPellets = state.powerPellets.filter(
    (pellet) => !positionsEqual(pellet, nextPlayer)
  );

  const collectedPellets = state.pellets.length - remainingPellets.length;
  const collectedPowerPellets =
    state.powerPellets.length - remainingPowerPellets.length;

  const poweredUntil =
    collectedPowerPellets > 0
      ? now + POWER_MODE_MS
      : state.poweredUntil;

  return {
    ...state,
    roundCompleted: false,
    completedRound: null,
    nextRound: null,
    roundReward: 0,
    baseZpts: 0,
    player: nextPlayer,
    pellets: remainingPellets,
    powerPellets: remainingPowerPellets,
    score: state.score + collectedPellets * 10 + collectedPowerPellets * 25,
    pelletsCollected: state.pelletsCollected + collectedPellets,
    powerPelletsCollected:
      state.powerPelletsCollected + collectedPowerPellets,
    poweredUntil,
  };
}

export function advanceEnemies(state, now = Date.now()) {
  if (state.isGameOver) {
    return state;
  }

  if (now - state.lastEnemyMoveAt < state.enemyMoveInterval) {
    return state;
  }

  const powered = isPowered(state, now);

  const enemies = state.enemies.map((enemy) =>
    moveEnemyTowardPlayer(enemy, state.player, state.round, powered)
  );

  return {
    ...state,
    enemies,
    lastEnemyMoveAt: now,
  };
}

export function checkCollision(player, enemies) {
  return enemies.find((enemy) => positionsEqual(player, enemy)) || null;
}

export function resolveCollision(state, enemy, now = Date.now()) {
  if (!enemy) return state;

  if (isPowered(state, now)) {
    const enemies = state.enemies.filter((item) => item.id !== enemy.id);

    return {
      ...state,
      enemies,
      score: state.score + POWER_ENEMY_SCORE,
      enemiesZapped: state.enemiesZapped + 1,
    };
  }

  return applyGameOver(state);
}

export function maybeAdvanceRound(state) {
  if (
    state.pellets.length > 0 ||
    state.powerPellets.length > 0 ||
    state.isGameOver
  ) {
    return state;
  }

  const completedRound = Number(state.round || 1);
  const nextRound = completedRound + 1;
  const roundReward = calculateRoundReward(state);
  const totalZptsEarned = Number(state.totalZptsEarned || 0) + roundReward;

  return {
    ...buildRoundState({
      round: nextRound,
      score: state.score,
      lives: state.lives,
      pelletsCollected: state.pelletsCollected,
      totalZptsEarned,
      poweredUntil: 0,
    }),
    roundCompleted: true,
    completedRound,
    nextRound,
    roundReward,
    baseZpts: roundReward,
  };
}

export function applyGameOver(state) {
  const nextLives = Math.max(0, Number(state.lives || 0) - 1);

  if (nextLives <= 0) {
    return {
      ...state,
      lives: 0,
      isGameOver: true,
    };
  }

  return resetPositionsAfterHit({
    ...state,
    lives: nextLives,
    poweredUntil: 0,
  });
}

export function reviveGame(state) {
  return resetPositionsAfterHit({
    ...state,
    lives: 1,
    isGameOver: false,
    poweredUntil: 0,
  });
}

export function restartGame() {
  return createInitialState();
}

export function getResult(state) {
  return {
    score: state.score,
    round: state.round,
    level: state.round,
    lives: state.lives,
    cleared: Boolean(state.roundCompleted),
    pelletsCollected: state.pelletsCollected,
    powerPelletsCollected: state.powerPelletsCollected,
    enemiesZapped: state.enemiesZapped,
    baseZpts: Number(state.baseZpts || state.roundReward || 0),
    finalZpts: Number(state.totalZptsEarned || state.baseZpts || 0),
    totalZptsEarned: Number(state.totalZptsEarned || 0),
    gameId: "zap-man",
    game_type: "zap-man",
  };
}