function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export const BREAKERZ_CANVAS = {
  width: 340,
  height: 420,
};

export const BREAKERZ_HUD = {
  mobileTopInset: 72,
  bottomSafeInset: 24,
};

export const BREAKERZ_LIVES = {
  starting: 5,
  max: 7,
};

export const BREAKERZ_PADDLE = {
  startWidth: 104,
  minWidth: 68,
  height: 13,
  yOffset: 30,
  edgeBounceBoost: 1.2,
};

export const BREAKERZ_BALL = {
  radius: 7,
  baseSpeed: 3.35,
  roundSpeedRamp: 0.13,
  maxSpeed: 7.25,
  relaunchDelayMs: 680,
};

export const BREAKERZ_SCORING = {
  baseBrick: 10,
  rowBonus: 2,
  clearBase: 180,
  clearRoundBonus: 35,
  lifeBonus: 50,
};

export const BREAKERZ_ROUND_FLOW = {
  introDelayMs: 450,
  clearDelayMs: 850,
  gameOverDelayMs: 900,
};

export const BREAKERZ_PATTERNS = [
  "full",
  "checker",
  "tunnel",
  "diamond",
  "fortress",
  "stairs-left",
  "stairs-right",
  "stripes",
];

export const BREAKERZ_FX = {
  sparkDurationMs: 360,
  pulseDurationMs: 440,
  textDurationMs: 650,
  maxEvents: 28,
};

export function getBreakerzDifficultyTier(round = 1) {
  const safeRound = Math.max(1, Number(round) || 1);

  if (safeRound <= 3) return 1;
  if (safeRound <= 6) return 2;
  if (safeRound <= 10) return 3;
  if (safeRound <= 15) return 4;
  return 5;
}

export function getBreakerzBallSpeed(round = 1) {
  const safeRound = Math.max(1, Number(round) || 1);

  return clamp(
    BREAKERZ_BALL.baseSpeed + (safeRound - 1) * BREAKERZ_BALL.roundSpeedRamp,
    BREAKERZ_BALL.baseSpeed,
    BREAKERZ_BALL.maxSpeed
  );
}

export function getBreakerzPaddleWidth(round = 1) {
  const safeRound = Math.max(1, Number(round) || 1);

  return clamp(
    BREAKERZ_PADDLE.startWidth - (safeRound - 1) * 1.45,
    BREAKERZ_PADDLE.minWidth,
    BREAKERZ_PADDLE.startWidth
  );
}

export function getBreakerzRoundBonus(round = 1) {
  const safeRound = Math.max(1, Number(round) || 1);

  return BREAKERZ_SCORING.clearBase + safeRound * BREAKERZ_SCORING.clearRoundBonus;
}

export function getBreakerzBrickScore({ row = 0, round = 1 } = {}) {
  const safeRow = Math.max(0, Number(row) || 0);
  const safeRound = Math.max(1, Number(round) || 1);

  return (
    BREAKERZ_SCORING.baseBrick +
    safeRow * BREAKERZ_SCORING.rowBonus +
    Math.floor(safeRound * 1.5)
  );
}