let interval = null;
let isRunning = false;
let current = 0;

import { setSteps } from "./stepService";

/**
 * DEV STEP FEEDER (V1 WEB ONLY)
 * Simulates step accumulation while MOVE is active.
 * Replace with native step source later.
 */

export function startStepFeeder() {
  if (isRunning) return;

  isRunning = true;

  interval = window.setInterval(() => {
    // simulate 1–4 steps per tick
    const increment = Math.floor(Math.random() * 4) + 1;
    current += increment;

    setSteps(current);
  }, 1000);
}

export function stopStepFeeder() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  isRunning = false;
}

export function resetStepFeeder() {
  current = 0;
  setSteps(0);
}