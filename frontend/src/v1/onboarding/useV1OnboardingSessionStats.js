import { useEffect, useMemo, useState } from "react";

export const PENDING_ONBOARDING_REWARD_KEY = "zwap_pending_onboarding_reward";

const MOVE_ONBOARDING_ZPTS = 50;
const PLAY_ONBOARDING_ZPTS = 50;

function readPendingOnboardingReward() {
  try {
    const raw = localStorage.getItem(PENDING_ONBOARDING_REWARD_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    return {
      zptsBalance: Number(parsed?.zptsBalance || 0),
      moveZpts: Number(parsed?.moveZpts || 0),
      playZpts: Number(parsed?.playZpts || 0),
      dailySteps: Number(parsed?.dailySteps || 0),
      gamesPlayedToday: Number(parsed?.gamesPlayedToday || 0),
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

  const zptsBalance = moveZpts + playZpts;

  useEffect(() => {
    const nextReward = {
      zptsBalance,
      moveZpts,
      playZpts,
      dailySteps: todaySteps,
      gamesPlayedToday,
      moveCompleted: moveZpts > 0,
      playCompleted: playZpts > 0,
    };

    setPendingReward(nextReward);
    writePendingOnboardingReward(nextReward);
  }, [zptsBalance, moveZpts, playZpts, todaySteps, gamesPlayedToday]);

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
    return {
      ...(user || {}),
      zptsBalance,
      zpts_balance: zptsBalance,
      dailySteps: todaySteps,
      daily_steps: todaySteps,
      gamesPlayedToday,
      games_played_today: gamesPlayedToday,
      onboardingReward: pendingReward,
      onboarding_reward: pendingReward,
    };
  }, [user, zptsBalance, todaySteps, gamesPlayedToday, pendingReward]);

  return {
    todaySteps,
    moveActive,
    gamesPlayedToday,
    zptsBalance,
    onboardingReward: pendingReward,

    startMoveTracking,
    stopMoveTracking,
    applyMoveMilestone,
    applyMoveComplete,
    applyPlayComplete,

    dashboardUser,
  };
}