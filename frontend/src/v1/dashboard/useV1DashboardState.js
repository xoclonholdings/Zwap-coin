import { useMemo } from "react";

function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function clampRatio(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(1, num));
}

function getUserNumber(user, keys, fallback = 0) {
  for (const key of keys) {
    const value = user?.[key];
    if (value !== undefined && value !== null && value !== "") {
      const num = Number(value);
      if (Number.isFinite(num)) return num;
    }
  }

  return fallback;
}

function buildDisplayName({ user, authUser }) {
  return (
    user?.username ||
    user?.displayName ||
    user?.name ||
    authUser?.username ||
    authUser?.displayName ||
    authUser?.email?.address?.split("@")[0] ||
    authUser?.email?.split("@")[0] ||
    ""
  );
}

export default function useV1DashboardState({ user, authUser } = {}) {
  return useMemo(() => {
    const todaySteps = getUserNumber(
      user,
      ["todaySteps", "daily_steps", "stepsToday", "steps"],
      0
    );

    const dailyStepGoal = getUserNumber(
      user,
      ["dailyStepGoal", "step_goal", "stepGoal"],
      10000
    );

    const gamesPlayedToday = getUserNumber(
      user,
      ["gamesPlayedToday", "games_played_today", "gamesPlayed"],
      0
    );

    const playGoal = getUserNumber(
      user,
      ["playGoal", "dailyPlayGoal", "daily_game_goal"],
      4
    );

    const zptsBalance = getUserNumber(
      user,
      ["zptsBalance", "zpts_balance", "zPts", "zpts"],
      0
    );

    const zptsDailyEarned = getUserNumber(
      user,
      ["dailyZptsEarned", "daily_zpts_earned", "zptsToday"],
      0
    );

    const zptsDailyCap = getUserNumber(
      user,
      ["dailyZptsCap", "daily_zpts_cap", "zptsCap"],
      300
    );

    const stepsPercent = clampPercent((todaySteps / Math.max(1, dailyStepGoal)) * 100);
    const playProgressPercent = clampPercent((gamesPlayedToday / Math.max(1, playGoal)) * 100);
    const zptsPercent = clampPercent((zptsDailyEarned / Math.max(1, zptsDailyCap)) * 100);

    return {
      user,
      authUser,

      identity: {
        displayName: buildDisplayName({ user, authUser }),
        tier: user?.tier || "Starter",
      },

      move: {
        todaySteps,
        dailyStepGoal,
        stepsPercent,
        stepsRatio: clampRatio(todaySteps / Math.max(1, dailyStepGoal)),
      },

      play: {
        gamesPlayedToday,
        playGoal,
        playProgressPercent,
        playRatio: clampRatio(gamesPlayedToday / Math.max(1, playGoal)),
      },

      zpts: {
        zptsBalance,
        zptsDailyEarned,
        zptsDailyCap,
        zptsPercent,
      },

      zwap: {
        zptsPercent,
        zwapMode: user?.zwapMode || "voice",
        zwapMessage: user?.zwapMessage || "Ready when you are.",
        zwapHint: user?.zwapHint || "Complete actions to build today’s progress.",
      },
    };
  }, [user, authUser]);
}