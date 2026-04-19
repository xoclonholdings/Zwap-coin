export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function normalizeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function createBallVelocity(speed = 3.2, direction = 1) {
  const safeSpeed = Math.max(0.5, normalizeNumber(speed, 3.2));
  const safeDirection = direction >= 0 ? 1 : -1;

  return {
    dx: safeSpeed * 0.72 * safeDirection,
    dy: -safeSpeed,
  };
}

export function resetBallPosition({
  canvasWidth,
  canvasHeight,
  paddleY,
  ballRadius,
}) {
  const width = normalizeNumber(canvasWidth, 340);
  const height = normalizeNumber(canvasHeight, 420);
  const radius = normalizeNumber(ballRadius, 7);
  const safePaddleY = normalizeNumber(paddleY, height - 30);

  return {
    x: width / 2,
    y: Math.min(height - 60, safePaddleY - radius - 14),
  };
}

export function reflectBallFromPaddle({
  ballX,
  paddleX,
  paddleWidth,
  baseSpeed,
  bounceBoost = 1.18,
}) {
  const safeBallX = normalizeNumber(ballX, 0);
  const safePaddleX = normalizeNumber(paddleX, 0);
  const safePaddleWidth = Math.max(1, normalizeNumber(paddleWidth, 96));
  const safeBaseSpeed = Math.max(0.5, normalizeNumber(baseSpeed, 3.2));
  const safeBounceBoost = Math.max(1, normalizeNumber(bounceBoost, 1.18));

  const hitRatio = clamp((safeBallX - safePaddleX) / safePaddleWidth, 0, 1);
  const centered = (hitRatio - 0.5) * 2;

  return {
    dx: safeBaseSpeed * centered * safeBounceBoost,
    dy: -Math.abs(safeBaseSpeed),
  };
}

export function isBallCollidingWithRect(ball, rect) {
  if (!ball || !rect) return false;

  const nearestX = clamp(ball.x, rect.x, rect.x + rect.width);
  const nearestY = clamp(ball.y, rect.y, rect.y + rect.height);

  const dx = ball.x - nearestX;
  const dy = ball.y - nearestY;

  return dx * dx + dy * dy <= ball.radius * ball.radius;
}

export function getBrickHitReflection(ball, brick) {
  const ballCenterX = ball.x;
  const ballCenterY = ball.y;

  const brickCenterX = brick.x + brick.width / 2;
  const brickCenterY = brick.y + brick.height / 2;

  const diffX = ballCenterX - brickCenterX;
  const diffY = ballCenterY - brickCenterY;

  if (Math.abs(diffX / brick.width) > Math.abs(diffY / brick.height)) {
    return {
      dx: -ball.dx,
      dy: ball.dy,
    };
  }

  return {
    dx: ball.dx,
    dy: -ball.dy,
  };
}

export function formatScore(value = 0) {
  return normalizeNumber(value, 0).toLocaleString();
}

export function duplicateBricks(bricks = []) {
  return bricks.map((brick) => ({
    ...brick,
  }));
}

export function countAliveBricks(bricks = []) {
  return bricks.reduce((count, brick) => {
    return brick.alive ? count + 1 : count;
  }, 0);
}

export function getRemainingLivesLivesafe(value = 0) {
  return Math.max(0, Math.floor(normalizeNumber(value, 0)));
}