import { setSteps } from "../../services/stepService";

/**
 * ZWAP! V1 STEP FEEDER
 * Real device-step bridge only.
 *
 * No simulated steps.
 * No fake movement.
 *
 * Requires native iOS/Android bridge:
 * window.ZwapStepBridge
 */

let unsubscribe = null;
let isRunning = false;

function getNativeStepBridge() {
  if (typeof window === "undefined") return null;

  const bridge = window.ZwapStepBridge;

  if (!bridge || typeof bridge !== "object") {
    return null;
  }

  return bridge;
}

function publishSteps(steps) {
  const safeSteps = Math.max(0, Number(steps || 0));
  setSteps(safeSteps);
}

export function startStepFeeder() {
  if (isRunning) return;

  const bridge = getNativeStepBridge();

  if (!bridge) {
    console.warn(
      "ZWAP! real step bridge is not available. MOVE requires native iOS/Android step access."
    );
    return;
  }

  isRunning = true;

  if (typeof bridge.subscribe === "function") {
    unsubscribe = bridge.subscribe((steps) => {
      publishSteps(steps);
    });
  }

  if (typeof bridge.start === "function") {
    bridge.start();
  }

  if (typeof bridge.getCurrentSteps === "function") {
    Promise.resolve(bridge.getCurrentSteps())
      .then((steps) => {
        publishSteps(steps);
      })
      .catch((error) => {
        console.warn("ZWAP! step bridge read failed:", error);
      });
  }
}

export function stopStepFeeder() {
  const bridge = getNativeStepBridge();

  if (typeof unsubscribe === "function") {
    unsubscribe();
    unsubscribe = null;
  }

  if (bridge && typeof bridge.stop === "function") {
    bridge.stop();
  }

  isRunning = false;
}

export function resetStepFeeder() {
  const bridge = getNativeStepBridge();

  if (!bridge) {
    publishSteps(0);
    return;
  }

  if (typeof bridge.reset === "function") {
    bridge.reset();
  }

  if (typeof bridge.getCurrentSteps === "function") {
    Promise.resolve(bridge.getCurrentSteps())
      .then((steps) => {
        publishSteps(steps);
      })
      .catch(() => {
        publishSteps(0);
      });

    return;
  }

  publishSteps(0);
}

export function forceStopStepFeeder() {
  stopStepFeeder();
}