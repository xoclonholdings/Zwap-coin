import { PULZE_CANVAS } from "./pulzeConfig";
import { calculatePulzeScore, clamp } from "./pulzeUtils";

export function createPulzeEngine({ startingRound = 1, startingLevel = 1 } = {}) {
  let round = Math.max(1, Number(startingRound) || 1);
  let level = Math.max(1, Number(startingLevel) || 1);
  let score = 0;
  let lives = 5;
  let streak = 0;
  let hits = 0;
  let attempts = 0;
  let finished = false;
  let paused = false;
  let roundComplete = false;
  let lastTime = 0;
  let feedback = "TAP ON THE PULZE";

  const targetHits = 8;

  const track = {
    x: 54,
    y: 300,
    width: PULZE_CANVAS.width - 108,
    height: 18,
  };

  let direction = 1;
  let pulzePosition = track.x;
  let targetPosition = track.x + track.width * 0.5;

  function getSpeed() {
    return 0.18 + level * 0.025 + round * 0.012;
  }

  function getTargetSize() {
    return clamp(96 - round * 4 - level * 3, 44, 96);
  }

  function resetTarget() {
    const padding = getTargetSize() / 2;
    targetPosition =
      track.x + padding + Math.random() * Math.max(1, track.width - padding * 2);
  }

  function completeRound() {
    roundComplete = true;
    finished = true;
    feedback = "ROUND COMPLETE";
    score += round * 75 + lives * 25 + streak * 10;
  }

  function tick(time) {
    if (!lastTime) lastTime = time;

    const delta = Math.min(48, time - lastTime);
    lastTime = time;

    if (!paused && !finished) {
      pulzePosition += direction * getSpeed() * delta;

      if (pulzePosition >= track.x + track.width) {
        pulzePosition = track.x + track.width;
        direction = -1;
      }

      if (pulzePosition <= track.x) {
        pulzePosition = track.x;
        direction = 1;
      }
    }

    return getFrame();
  }

  function trigger() {
    if (paused || finished) return getPublicState();

    attempts += 1;

    const result = calculatePulzeScore({
      pulzePosition,
      targetPosition,
      targetSize: getTargetSize(),
    });

    feedback = result.label;

    if (result.hit) {
      hits += 1;
      streak += 1;
      score += result.points + streak * 5;

      if (hits >= targetHits) {
        completeRound();
        return getPublicState();
      }

      resetTarget();
    } else {
      streak = 0;
      lives -= 1;

      if (lives <= 0) {
        finished = true;
        feedback = "SESSION COMPLETE";
      }
    }

    return getPublicState();
  }

  function togglePause() {
    if (finished) return paused;
    paused = !paused;
    return paused;
  }

  function resumeFromPause() {
    if (finished) return;
    paused = false;
  }

  function openExitOverlay() {
    paused = true;
  }

  function closeExitOverlay() {
    paused = true;
  }

  function confirmExit() {
    finished = true;
  }

  function reviveWithExtraLife() {
    lives = 1;
    streak = 0;
    finished = false;
    paused = false;
    roundComplete = false;
    feedback = "TAP ON THE PULZE";
    resetTarget();
  }

  function isFinished() {
    return finished;
  }

  function isRoundComplete() {
    return roundComplete;
  }

  function getResult() {
    return {
      score,
      round,
      nextRound: round + 1,
      level,
      lives,
      hits,
      attempts,
      cleared: Boolean(roundComplete),
      roundComplete,
      baseZpts: Math.max(10, Math.floor(score / 100) + round * 5),
      gameId: "pulze",
      game_type: "pulze",
    };
  }

  function getPublicState() {
    return {
      round,
      level,
      score,
      lives,
      streak,
      hits,
      attempts,
      paused,
      finished,
      roundComplete,
      feedback,
    };
  }

  function getFrame() {
    return {
      canvas: PULZE_CANVAS,
      track,
      targetPosition,
      targetSize: getTargetSize(),
      pulzePosition,
      round,
      level,
      score,
      lives,
      streak,
      hits,
      attempts,
      paused,
      finished,
      roundComplete,
      feedback,
    };
  }

  resetTarget();

  return {
    tick,
    trigger,
    togglePause,
    resumeFromPause,
    openExitOverlay,
    closeExitOverlay,
    confirmExit,
    reviveWithExtraLife,
    isFinished,
    isRoundComplete,
    getResult,
    getPublicState,
  };
}