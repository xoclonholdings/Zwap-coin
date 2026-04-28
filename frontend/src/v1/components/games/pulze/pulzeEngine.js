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
  let lastTime = 0;
  let feedback = "TAP ON THE PULZE";

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

      if (hits > 0 && hits % 5 === 0) {
        round += 1;
      }

      if (hits > 0 && hits % 12 === 0) {
        level += 1;
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
    paused = !paused;
    return paused;
  }

  function resumeFromPause() {
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

  function isFinished() {
    return finished;
  }

  function getResult() {
    return {
      score,
      round,
      level,
      lives,
      hits,
      attempts,
      cleared: lives > 0,
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
    isFinished,
    getResult,
    getPublicState,
  };
}
