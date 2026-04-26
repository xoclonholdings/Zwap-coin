export const GRID_WIDTH = 15;
export const GRID_HEIGHT = 15;

export const INITIAL_PLAYER_POSITION = { x: 7, y: 11 };
export const INITIAL_PLAYER_DIRECTION = "right";

export const INITIAL_ENEMY_SPEED = 420;
export const MIN_ENEMY_SPEED = 140;
export const ENEMY_SPEED_STEP = 28;

export const INITIAL_ENEMY_COUNT = 1;
export const MAX_ENEMIES = 6;

export const ROUND_PELLET_COUNT = 28;

export const GAME_TICK_MS = 120;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const WALLS = [
  "0,0","1,0","2,0","3,0","4,0","5,0","6,0","7,0","8,0","9,0","10,0","11,0","12,0","13,0","14,0",
  "0,14","1,14","2,14","3,14","4,14","5,14","6,14","7,14","8,14","9,14","10,14","11,14","12,14","13,14","14,14",
  "0,1","0,2","0,3","0,4","0,5","0,6","0,7","0,8","0,9","0,10","0,11","0,12","0,13",
  "14,1","14,2","14,3","14,4","14,5","14,6","14,7","14,8","14,9","14,10","14,11","14,12","14,13",

  "3,2","4,2","5,2","9,2","10,2","11,2",
  "3,3","11,3",

  "2,5","3,5","4,5","10,5","11,5","12,5",
  "6,4","6,5","6,6","8,4","8,5","8,6",

  "3,8","4,8","5,8","9,8","10,8","11,8",
  "3,9","11,9",

  "2,11","3,11","4,11","10,11","11,11","12,11",
  "6,10","6,11","8,10","8,11",
];