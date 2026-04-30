/**
 * Activity API Layer
 * Safe wrapper around backend activity endpoints.
 */

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const API = `${BACKEND_URL}/api`;

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

function buildHighScores(personalBests = []) {
  const highScores = {};

  if (!Array.isArray(personalBests)) {
    return highScores;
  }

  personalBests.forEach((item) => {
    if (item?.type !== "game" || !item?.gameId) return;

    highScores[item.gameId] = {
      score: Number(item.value || item.score || 0),
      highScore: Number(item.value || item.score || 0),
      level: Number(item.level || 1),
      plays: Number(item.plays || item.playCount || 0),
    };
  });

  return highScores;
}

function buildEmptyActivity() {
  return {
    totalSteps: 0,
    stepGoal: 10000,
    stepChangePercent: 0,

    avgSteps: 0,
    calories: 0,
    activeTime: "0m",
    zptsEarned: 0,
    zptsBalance: 0,

    avgStepsChangePercent: 0,
    caloriesChangePercent: 0,
    activeTimeChangePercent: 0,
    zptsChangePercent: 0,

    weeklySteps: [],
    consistency: [],
    streakDays: 0,

    personalBests: [],
    highScores: {},
    latestActivitySignal: null,

    completedTaskCount: 0,
    totalTaskCount: 4,
    fullLoopCompleted: false,
    dailySteps: 0,
    gamesPlayedToday: 0,
    lessonsCompletedToday: 0,
    taskStates: [],
  };
}

export async function getActivityDashboard(email) {
  const safeEmail = String(email || "").trim().toLowerCase();

  if (!safeEmail) {
    return buildEmptyActivity();
  }

  const data = await safeFetch(
    `/activity/${encodeURIComponent(safeEmail)}/dashboard`
  );

  if (!data) {
    return buildEmptyActivity();
  }

  const personalBests = Array.isArray(data.personalBests)
    ? data.personalBests
    : [];

  return {
    totalSteps: Number(data.totalSteps || 0),
    stepGoal: Number(data.stepGoal || 10000),
    stepChangePercent: Number(data.stepChangePercent || 0),

    avgSteps: Number(data.avgSteps || 0),
    calories: Number(data.calories || 0),
    activeTime: data.activeTime || "0m",
    zptsEarned: Number(data.zptsEarned || 0),
    zptsBalance: Number(data.zptsBalance || 0),

    avgStepsChangePercent: Number(data.avgStepsChangePercent || 0),
    caloriesChangePercent: Number(data.caloriesChangePercent || 0),
    activeTimeChangePercent: Number(data.activeTimeChangePercent || 0),
    zptsChangePercent: Number(data.zptsChangePercent || 0),

    weeklySteps: Array.isArray(data.weeklySteps) ? data.weeklySteps : [],
    consistency: Array.isArray(data.consistency) ? data.consistency : [],
    streakDays: Number(data.streakDays || 0),

    personalBests,
    highScores: buildHighScores(personalBests),

    latestActivitySignal:
      data.latestActivitySignal && typeof data.latestActivitySignal === "object"
        ? data.latestActivitySignal
        : null,

    completedTaskCount: Number(data.completedTaskCount || 0),
    totalTaskCount: Number(data.totalTaskCount || 4),
    fullLoopCompleted: data.fullLoopCompleted === true,
    dailySteps: Number(data.dailySteps || 0),
    gamesPlayedToday: Number(data.gamesPlayedToday || 0),
    lessonsCompletedToday: Number(data.lessonsCompletedToday || 0),

    taskStates:
      Array.isArray(data.taskStates) && data.taskStates.length > 0
        ? data.taskStates
        : [],
  };
}