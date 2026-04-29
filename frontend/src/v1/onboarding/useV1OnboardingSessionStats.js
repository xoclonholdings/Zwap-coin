import { useMemo, useState } from "react";

const STARTING_ONBOARDING_ZPTS = 100;

export default function useV1OnboardingSessionStats({ user }) {
  const [todaySteps, setTodaySteps] = useState(0);
  const [moveActive, setMoveActive] = useState(false);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(0);
  const [zptsBalance, setZptsBalance] = useState(STARTING_ONBOARDING_ZPTS);

  // ---- Actions (no routing, no onboarding decisions) ----

  function startMoveTracking() {
    setMoveActive(true);
  }

  function stopMoveTracking() {
    setMoveActive(false);
  }

  function applyMoveMilestone({ displayedSteps = 0, displayedZpts = 0 } = {}) {
    setTodaySteps((prev) => Math.max(prev, displayedSteps));
    setZptsBalance((prev) =>
      Math.max(prev, STARTING_ONBOARDING_ZPTS + displayedZpts)
    );
  }

  function applyMoveComplete({ displayedSteps = 0, displayedZpts = 0 } = {}) {
    setMoveActive(false);
    applyMoveMilestone({ displayedSteps, displayedZpts });
  }

  function applyPlayComplete({ displayedZpts = 50 } = {}) {
    setGamesPlayedToday((prev) => prev + 1);
    setZptsBalance((prev) =>
      Math.max(prev, STARTING_ONBOARDING_ZPTS + displayedZpts)
    );
  }

  // ---- Derived ----

  const dashboardUser = useMemo(() => {
    return {
      ...(user || {}),
      zptsBalance,
      zpts_balance: zptsBalance,
      dailySteps: todaySteps,
      daily_steps: todaySteps,
      gamesPlayedToday,
      games_played_today: gamesPlayedToday,
    };
  }, [user, zptsBalance, todaySteps, gamesPlayedToday]);

  return {
    // state
    todaySteps,
    moveActive,
    gamesPlayedToday,
    zptsBalance,

    // actions
    startMoveTracking,
    stopMoveTracking,
    applyMoveMilestone,
    applyMoveComplete,
    applyPlayComplete,

    // derived
    dashboardUser,
  };
}
