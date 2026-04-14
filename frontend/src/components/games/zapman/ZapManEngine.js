import {
  GRID_SIZE,
  INITIAL_PLAYER_SPEED,
  INITIAL_ENEMY_SPEED,
  MAX_ENEMIES,
  PELLET_COUNT,
  ROUND_SCALING,
} from "./ZapManConstants";

export function createInitialState() {
  return {
    round: 1,
    isGameOver: false,
    player: { x: 7, y: 7, dir: "right" },
    enemies: generateEnemies(1),
    pellets: generatePellets(),
    enemySpeed: INITIAL_ENEMY_SPEED,
  };
}

function generatePellets() {
  const pellets = [];
  for (let i = 0; i < PELLET_COUNT; i++) {
    pellets.push({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    });
  }
  return pellets;
}

function generateEnemies(count) {
  const enemies = [];
  for (let i = 0; i < count; i++) {
    enemies.push({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    });
  }
  return enemies;
}

export function nextRound(state) {
  const nextEnemyCount = Math.min(
    state.enemies.length + ROUND_SCALING.maxEnemiesIncrement,
    MAX_ENEMIES
  );

  return {
    ...state,
    round: state.round + 1,
    pellets: generatePellets(),
    enemies: generateEnemies(nextEnemyCount),
    enemySpeed: state.enemySpeed + ROUND_SCALING.enemySpeedIncrement,
  };
}

export function checkCollision(player, enemies) {
  return enemies.some(
    (e) => e.x === player.x && e.y === player.y
  );
}