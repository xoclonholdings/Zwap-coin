/**
 * Activity API Layer
 * Safe wrapper around backend activity endpoints.
 *
 * This WILL NOT break if backend routes are missing.
 * Returns structured fallback data instead.
 */

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function safeFetch(path) {
  try {
    const res = await fetch(`${API}${path}`);
    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.detail || "Request failed");
    }

    return data;
  } catch (err) {
    console.warn("Activity API fallback:", err.message);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Fallback (NO HARDCODED FAKE NUMBERS)                                       */
/* -------------------------------------------------------------------------- */

function buildEmptyActivity() {
  return {
    totalSteps: 0,
    stepGoal: 0,
    stepChangePercent: 0,

    avgSteps: 0,
    calories: 0,
    activeTime: "0m",
    zptsEarned: 0,

    avgStepsChangePercent: 0,
    caloriesChangePercent: 0,
    activeTimeChangePercent: 0,
    zptsChangePercent: 0,

    weeklySteps: [],
    consistency: [],
    streakDays: 0,

    personalBests: [],
  };
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Primary endpoint (future)
 *
 * GET /api/activity/:walletAddress/dashboard
 */
export async function getActivityDashboard(walletAddress) {
  if (!walletAddress) {
    return buildEmptyActivity();
  }

  // 🔌 Attempt backend call
  const data = await safeFetch(
    `/activity/${walletAddress}/dashboard`
  );

  // 🧠 If backend not ready → return empty structure
  if (!data) {
    return buildEmptyActivity();
  }

  // ✅ Normalize response (prevents UI crashes)
  return {
    totalSteps: Number(data.totalSteps || 0),
    stepGoal: Number(data.stepGoal || 0),
    stepChangePercent: Number(data.stepChangePercent || 0),

    avgSteps: Number(data.avgSteps || 0),
    calories: Number(data.calories || 0),
    activeTime: data.activeTime || "0m",
    zptsEarned: Number(data.zptsEarned || 0),

    avgStepsChangePercent: Number(data.avgStepsChangePercent || 0),
    caloriesChangePercent: Number(data.caloriesChangePercent || 0),
    activeTimeChangePercent: Number(data.activeTimeChangePercent || 0),
    zptsChangePercent: Number(data.zptsChangePercent || 0),

    weeklySteps: Array.isArray(data.weeklySteps)
      ? data.weeklySteps
      : [],

    consistency: Array.isArray(data.consistency)
      ? data.consistency
      : [],

    streakDays: Number(data.streakDays || 0),

    personalBests: Array.isArray(data.personalBests)
      ? data.personalBests
      : [],
  };
}