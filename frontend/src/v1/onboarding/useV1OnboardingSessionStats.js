import { useEffect, useMemo, useState } from "react";

export const PENDING_ONBOARDING_REWARD_KEY = "zwap_pending_onboarding_reward";

const MOVE_ONBOARDING_ZPTS = 50;
const PLAY_ONBOARDING_ZPTS = 50;

function asNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getFirstNumber(user, keys, fallback = 0) {
  for (const key of keys) {
    const value = user?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return asNumber(value, fallback);
    }
  }

  return fallback;
}

function readPendingOnboardingReward() {
  try {
    const raw = localStorage.getItem(PENDING_ONBOARDING_REWARD_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    return {
      zptsBalance: asNumber(parsed?.zptsBalance, 0),
      moveZpts: asNumber(parsed?.moveZpts, 0),
      playZpts: asNumber(parsed?.playZpts, 0),
      dailySteps: asNumber(parsed?.dailySteps, 0),
      gamesPlayedToday: asNumber(parsed?.gamesPlayedToday, 0),
      moveCompleted: Boolean(parsed?.moveCompleted),
      playCompleted: Boolean(parsed?.playCompleted),
    };
  } catch {
    return {
      zptsBalance: 0,
      moveZpts: 0,
      playZpts: 0,
      dailySteps: 0,
      gamesPlayedToday: 0,
      moveCompleted: false,
      playCompleted: false,
    };
  }
}

function writePendingOnboardingReward(nextReward) {
  localStorage.setItem(
    PENDING_ONBOARDING_REWARD_KEY,
    JSON.stringify(nextReward)
  );
}

export function clearPendingOnboardingReward() {
  localStorage.removeItem(PENDING_ONBOARDING_REWARD_KEY);
}

export default function useV1OnboardingSessionStats({ user }) {
  const [pendingReward, setPendingReward] = useState(() =>
    readPendingOnboardingReward()
  );

  const [todaySteps, setTodaySteps] = useState(pendingReward.dailySteps);
  const [moveActive, setMoveActive] = useState(false);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(
    pendingReward.gamesPlayedToday
  );

  const [moveZpts, setMoveZpts] = useState(pendingReward.moveZpts);
  const [playZpts, setPlayZpts] = useState(pendingReward.playZpts);

  const pendingZptsBalance = moveZpts + playZpts;

  useEffect(() => {
    const nextReward = {
      zptsBalance: pendingZptsBalance,
      moveZpts,
      playZpts,
      dailySteps: todaySteps,
      gamesPlayedToday,
      moveCompleted: moveZpts > 0,
      playCompleted: playZpts > 0,
    };

    setPendingReward(nextReward);
    writePendingOnboardingReward(nextReward);
  }, [pendingZptsBalance, moveZpts, playZpts, todaySteps, gamesPlayedToday]);

  function startMoveTracking() {
    setMoveActive(true);
  }

  function stopMoveTracking() {
    setMoveActive(false);
  }

  function applyMoveMilestone({ displayedSteps = 0 } = {}) {
    setTodaySteps((prev) => Math.max(prev, displayedSteps));
  }

  function applyMoveComplete({
    displayedSteps = 0,
    moveVerified = false,
  } = {}) {
    setMoveActive(false);
    setTodaySteps((prev) => Math.max(prev, displayedSteps));

    if (moveVerified) {
      setMoveZpts(MOVE_ONBOARDING_ZPTS);
    }
  }

  function applyPlayComplete() {
    setGamesPlayedToday((prev) => Math.max(prev, 1));
    setPlayZpts(PLAY_ONBOARDING_ZPTS);
  }

  const dashboardUser = useMemo(() => {
    const userZptsBalance = getFirstNumber(
      user,
      ["zptsBalance", "zpts_balance", "zPts", "zpts"],
      0
    );

    const userLifetimeZpts = getFirstNumber(
      user,
      ["lifetimeZpts", "lifetime_zpts"],
      userZptsBalance
    );

    const userDailySteps = getFirstNumber(
      user,
      ["dailySteps", "daily_steps", "todaySteps", "stepsToday", "steps"],
      0
    );

    const userGamesPlayedToday = getFirstNumber(
      user,
      ["gamesPlayedToday", "games_played_today", "gamesPlayed"],
      0
    );

    const resolvedZptsBalance = Math.max(
      userZptsBalance,
      pendingZptsBalance
    );

    const resolvedLifetimeZpts = Math.max(
      userLifetimeZpts,
      resolvedZptsBalance
    );

    const resolvedDailySteps = Math.max(userDailySteps, todaySteps);

    const resolvedGamesPlayedToday = Math.max(
      userGamesPlayedToday,
      gamesPlayedToday
    );

    return {
      ...(user || {}),
      zptsBalance: resolvedZptsBalance,
      zpts_balance: resolvedZptsBalance,
      lifetimeZpts: resolvedLifetimeZpts,
      lifetime_zpts: resolvedLifetimeZpts,
      dailySteps: resolvedDailySteps,
      daily_steps: resolvedDailySteps,
      gamesPlayedToday: resolvedGamesPlayedToday,
      games_played_today: resolvedGamesPlayedToday,
      onboardingReward: pendingReward,
      onboarding_reward: pendingReward,
    };
  }, [
    user,
    pendingZptsBalance,
    todaySteps,
    gamesPlayedToday,
    pendingReward,
  ]);

  return {
    todaySteps,
    moveActive,
    gamesPlayedToday,
    zptsBalance: pendingZptsBalance,
    onboardingReward: pendingReward,

    startMoveTracking,
    stopMoveTracking,
    applyMoveMilestone,
    applyMoveComplete,
    applyPlayComplete,

    dashboardUser,
  };
}