import {
  BREAKERZ_BALL,
  BREAKERZ_CANVAS,
  BREAKERZ_FX,
  BREAKERZ_HUD,
  BREAKERZ_LIVES,
  BREAKERZ_PADDLE,
  BREAKERZ_ROUND_FLOW,
  getBreakerzBallSpeed,
  getBreakerzPaddleWidth,
  getBreakerzRoundBonus,
} from "./breakerzConfig";
import {
  generateBreakerzRound,
  getNextRoundNumber,
  countAliveBricks,
} from "./breakerzRoundGenerator";
import {
  clamp,
  createBallVelocity,
  duplicateBricks,
  getBrickHitReflection,
  getRemainingLivesLivesafe,
  isBallCollidingWithRect,
  reflectBallFromPaddle,
  resetBallPosition,
} from "./breakerzUtils";

function nowMs() {
  return performance.now();
}

function createPaddle(round, width, height) {
  const paddleWidth = getBreakerzPaddleWidth(round);

  return {
    width: paddleWidth,
    height: BREAKERZ_PADDLE.height,
    x: (width - paddleWidth) / 2,
    y: height - BREAKERZ_PADDLE.yOffset,
  };
}

function createBall(round, width, height, paddleY) {
  const speed = getBreakerzBallSpeed(round);
  const position = resetBallPosition({
    canvasWidth: width,
    canvasHeight: height,
    paddleY,
    ballRadius: BREAKERZ_BALL.radius,
  });

  const velocity = createBallVelocity(speed, Math.random() > 0.5 ? 1 : -1);

  return {
    x: position.x,
    y: position.y,
    prevX: position.x,
    prevY: position.y,
    radius: BREAKERZ_BALL.radius,
    dx: velocity.dx,
    dy: velocity.dy,
  };
}

export function createBreakerzEngine({
  width = BREAKERZ_CANVAS.width,
  height = BREAKERZ_CANVAS.height,
  startingRound = 1,
  startingLives = BREAKERZ_LIVES.starting,
} = {}) {
  const safeWidth = Number(width) || BREAKERZ_CANVAS.width;
  const safeHeight = Number(height) || BREAKERZ_CANVAS.height;
  const firstRound = Math.max(1, Number(startingRound) || 1);

  let frame = null;
  let phase = "intro";
  let paused = false;
  let finished = false;

  let introUntil = 0;
  let relaunchAt = 0;
  let clearAt = 0;
  let gameOverAt = 0;
  let eventId = 0;
  let combo = 0;

  function pushFx(type, payload = {}) {
    if (!frame) return;

    frame.fxEvents = [
      ...(frame.fxEvents || []),
      {
        id: eventId,
        type,
        createdAt: nowMs(),
        ...payload,
      },
    ].slice(-BREAKERZ_FX.maxEvents);

    eventId += 1;
  }

  function pushAudio(type, payload = {}) {
    if (!frame) return;

    frame.audioEvents = [
      ...(frame.audioEvents || []),
      {
        id: eventId,
        type,
        createdAt: nowMs(),
        ...payload,
      },
    ].slice(-BREAKERZ_FX.maxEvents);

    eventId += 1;
  }

  function trimEvents(currentTime) {
    if (!frame) return;

    frame.fxEvents = (frame.fxEvents || []).filter((event) => {
      const age = currentTime - event.createdAt;
      if (event.type === "text") return age <= BREAKERZ_FX.textDurationMs;
      if (event.type === "pulse") return age <= BREAKERZ_FX.pulseDurationMs;
      return age <= BREAKERZ_FX.sparkDurationMs;
    });
  }

  function buildRound(roundNumber, carryScore = 0, carryLives = startingLives) {
    const roundData = generateBreakerzRound({
      round: roundNumber,
      width: safeWidth,
      height: safeHeight,
    });

    const paddle = createPaddle(roundNumber, safeWidth, safeHeight);
    const ball = createBall(roundNumber, safeWidth, safeHeight, paddle.y);

    frame = {
      width: safeWidth,
      height: safeHeight,
      round: roundNumber,
      pattern: roundData.pattern,
      score: carryScore,
      lives: getRemainingLivesLivesafe(carryLives),
      paddle,
      ball,
      bricks: duplicateBricks(roundData.bricks),
      roundMeta: roundData,
      paused: false,
      showRoundIntro: true,
      showExitOverlay: false,
      showGameOverOverlay: false,
      statusText: `Round ${roundNumber}`,
      lastTime: 0,
      fxEvents: [],
      audioEvents: [],
      combo,
      time: nowMs(),
    };

    phase = "intro";
    introUntil = nowMs() + BREAKERZ_ROUND_FLOW.introDelayMs;
    relaunchAt = 0;
    clearAt = 0;
    gameOverAt = 0;
  }

  buildRound(firstRound, 0, startingLives);

  function getFrame() {
    return frame;
  }

  function getPublicState() {
    return {
      width: frame?.width || safeWidth,
      height: frame?.height || safeHeight,
      paddle: frame?.paddle,
      ball: frame?.ball,
      round: frame?.round || 1,
      score: frame?.score || 0,
      lives: frame?.lives || BREAKERZ_LIVES.starting,
      paused,
      phase,
      finished,
    };
  }

  function setPaddleX(x) {
    if (!frame || finished) return;

    frame.paddle.x = clamp(x, 0, frame.width - frame.paddle.width);
  }

  function togglePause() {
    if (finished) return;
    if (phase === "gameover") return;

    paused = !paused;
    if (frame) {
      frame.paused = paused;
    }
  }

  function openExitOverlay() {
    if (!frame) return;
    paused = true;
    frame.paused = true;
    frame.showExitOverlay = true;
  }

  function closeExitOverlay() {
    if (!frame) return;
    frame.showExitOverlay = false;
  }

  function resumeFromPause() {
    if (!frame || finished) return;
    frame.showExitOverlay = false;
    paused = false;
    frame.paused = false;
  }

  function confirmExit() {
    finished = true;
    paused = false;

    if (frame) {
      frame.paused = false;
      frame.showExitOverlay = false;
    }
  }

  function relaunchBall() {
    if (!frame) return;

    const speed = getBreakerzBallSpeed(frame.round);
    const position = resetBallPosition({
      canvasWidth: frame.width,
      canvasHeight: frame.height,
      paddleY: frame.paddle.y,
      ballRadius: frame.ball.radius,
    });

    const velocity = createBallVelocity(speed, Math.random() > 0.5 ? 1 : -1);

    frame.ball.x = position.x;
    frame.ball.y = position.y;
    frame.ball.prevX = position.x;
    frame.ball.prevY = position.y;
    frame.ball.dx = velocity.dx;
    frame.ball.dy = velocity.dy;
  }

  function loseLife() {
    if (!frame) return;

    combo = 0;
    frame.combo = combo;
    frame.lives = Math.max(0, frame.lives - 1);

    pushFx("pulse", {
      x: frame.width / 2,
      y: frame.height * 0.76,
      color: "rgba(251,113,133,0.95)",
      radius: 40,
    });
    pushFx("text", {
      x: frame.width / 2,
      y: frame.height * 0.68,
      text: "MISS",
      color: "#fb7185",
    });
    pushAudio("miss");

    if (frame.lives <= 0) {
      phase = "gameover";
      frame.showGameOverOverlay = true;
      gameOverAt = nowMs() + BREAKERZ_ROUND_FLOW.gameOverDelayMs;
      return;
    }

    phase = "relaunch";
    relaunchAt = nowMs() + BREAKERZ_BALL.relaunchDelayMs;
    relaunchBall();
  }

  function clearRound() {
    if (!frame) return;

    frame.score += getBreakerzRoundBonus(frame.round);
    frame.score += frame.lives * 50;

    pushFx("pulse", {
      x: frame.width / 2,
      y: frame.height / 2,
      color: "rgba(250,204,21,0.95)",
      radius: 84,
    });
    pushFx("text", {
      x: frame.width / 2,
      y: frame.height / 2 - 20,
      text: "ROUND CLEAR",
      color: "#facc15",
    });
    pushAudio("clear");

    phase = "round-clear";
    clearAt = nowMs() + BREAKERZ_ROUND_FLOW.clearDelayMs;
  }

  function advanceRound() {
    if (!frame) return;

    const nextRound = getNextRoundNumber(frame.round);
    const carryScore = frame.score;
    const carryLives = Math.min(frame.lives, BREAKERZ_LIVES.max);

    buildRound(nextRound, carryScore, carryLives);
  }

  function updateBall(dtScale = 1) {
    if (!frame) return;

    frame.ball.prevX = frame.ball.x;
    frame.ball.prevY = frame.ball.y;

    frame.ball.x += frame.ball.dx * dtScale;
    frame.ball.y += frame.ball.dy * dtScale;

    if (frame.ball.x <= frame.ball.radius) {
      frame.ball.x = frame.ball.radius;
      frame.ball.dx *= -1;
      pushAudio("wall");
    }

    if (frame.ball.x >= frame.width - frame.ball.radius) {
      frame.ball.x = frame.width - frame.ball.radius;
      frame.ball.dx *= -1;
      pushAudio("wall");
    }

    if (frame.ball.y <= BREAKERZ_HUD.mobileTopInset / 2) {
      frame.ball.y = BREAKERZ_HUD.mobileTopInset / 2;
      frame.ball.dy *= -1;
      pushAudio("wall");
    }

    const paddle = frame.paddle;
    const hitPaddle =
      frame.ball.y + frame.ball.radius >= paddle.y &&
      frame.ball.y - frame.ball.radius <= paddle.y + paddle.height &&
      frame.ball.x >= paddle.x &&
      frame.ball.x <= paddle.x + paddle.width &&
      frame.ball.dy > 0;

    if (hitPaddle) {
      const bounce = reflectBallFromPaddle({
        ballX: frame.ball.x,
        paddleX: paddle.x,
        paddleWidth: paddle.width,
        baseSpeed: getBreakerzBallSpeed(frame.round),
        bounceBoost: BREAKERZ_PADDLE.edgeBounceBoost,
      });

      frame.ball.dy = bounce.dy;
      frame.ball.dx = bounce.dx;
      frame.ball.y = paddle.y - frame.ball.radius - 1;

      pushFx("pulse", {
        x: frame.ball.x,
        y: paddle.y,
        color: "rgba(34,211,238,0.85)",
        radius: 26,
      });
      pushAudio("paddle");
    }

    for (const brick of frame.bricks) {
      if (!brick.alive) continue;
      if (!isBallCollidingWithRect(frame.ball, brick)) continue;

      brick.hp -= 1;

      const bounce = getBrickHitReflection(frame.ball, brick);
      frame.ball.dx = bounce.dx;
      frame.ball.dy = bounce.dy;

      pushFx("spark", {
        x: frame.ball.x,
        y: frame.ball.y,
        color: brick.glow || brick.color || "#f0abfc",
      });
      pushAudio("brick");

      if (brick.hp <= 0) {
        brick.alive = false;
        combo += 1;
        frame.combo = combo;
        frame.score += brick.value || 10;

        pushFx("burst", {
          x: brick.x + brick.width / 2,
          y: brick.y + brick.height / 2,
          color: brick.glow || brick.color || "#f0abfc",
        });

        if (combo > 1 && combo % 4 === 0) {
          pushFx("text", {
            x: brick.x + brick.width / 2,
            y: brick.y,
            text: `x${combo}`,
            color: "#facc15",
          });
          pushAudio("combo");
        }
      }

      break;
    }

    if (frame.ball.y - frame.ball.radius > frame.height + BREAKERZ_HUD.bottomSafeInset) {
      loseLife();
      return;
    }

    if (countAliveBricks(frame.bricks) === 0) {
      clearRound();
    }
  }

  function tick(currentTime = nowMs()) {
    if (!frame || finished) {
      return getFrame();
    }

    frame.time = currentTime;
    frame.paused = paused;
    frame.combo = combo;
    trimEvents(currentTime);

    if (paused) {
      frame.showRoundIntro = false;
      return getFrame();
    }

    if (phase === "intro") {
      frame.showRoundIntro = true;
      if (currentTime >= introUntil) {
        frame.showRoundIntro = false;
        phase = "live";
        frame.lastTime = currentTime;
      }
      return getFrame();
    }

    if (phase === "relaunch") {
      if (currentTime >= relaunchAt) {
        phase = "live";
        frame.lastTime = currentTime;
      }
      return getFrame();
    }

    if (phase === "round-clear") {
      if (currentTime >= clearAt) {
        advanceRound();
      }
      return getFrame();
    }

    if (phase === "gameover") {
      if (currentTime >= gameOverAt) {
        finished = true;
      }
      return getFrame();
    }

    const lastTime = frame.lastTime || currentTime;
    const delta = Math.max(0, currentTime - lastTime);
    frame.lastTime = currentTime;

    const dtScale = clamp(delta / 16.6667, 0.7, 1.6);
    updateBall(dtScale);

    return getFrame();
  }

  function getResult() {
    return {
      score: frame?.score || 0,
      round: frame?.round || 1,
      cleared: phase === "round-clear",
      lives: frame?.lives || 0,
      finished,
    };
  }

  return {
    tick,
    getFrame,
    getPublicState,
    setPaddleX,
    togglePause,
    openExitOverlay,
    closeExitOverlay,
    resumeFromPause,
    confirmExit,
    getResult,
    isFinished: () => finished,
  };
}