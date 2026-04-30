import { setSteps } from "../../services/stepService";
import { Health } from "@capgo/capacitor-health";

/**
 * ZWAP! V1 STEP FEEDER (REAL DEVICE)
 * Uses HealthKit (iOS) + Health Connect (Android)
 *
 * No simulation.
 * Real step data only.
 */

let interval = null;
let isRunning = false;

async function requestPermissions() {
  try {
    await Health.requestPermissions({
      read: ["steps"],
      write: [],
    });
  } catch (err) {
    console.warn("Health permission denied:", err);
  }
}

async function getTodaySteps() {
  try {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const result = await Health.queryAggregated({
      startDate: startOfDay.toISOString(),
      endDate: now.toISOString(),
      metrics: ["steps"],
    });

    return Number(result?.steps || 0);
  } catch (err) {
    console.warn("Failed to fetch steps:", err);
    return 0;
  }
}

export async function startStepFeeder() {
  if (isRunning) return;

  isRunning = true;

  // 🔐 This triggers the permission prompt on real device
  await requestPermissions();

  // Initial read
  const initialSteps = await getTodaySteps();
  setSteps(initialSteps);

  // Poll every 2 seconds
  interval = window.setInterval(async () => {
    const steps = await getTodaySteps();
    setSteps(steps);
  }, 2000);
}

export function stopStepFeeder() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  isRunning = false;
}

export async function resetStepFeeder() {
  const steps = await getTodaySteps();
  setSteps(steps);
}

export function forceStopStepFeeder() {
  stopStepFeeder();
}