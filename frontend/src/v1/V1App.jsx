import React, { useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { useApp } from "@/app/AppProvider";

import OnboardingAboutPage from "@/v1/about/OnboardingAboutPage";
import SimplifiedDashboard from "@/v1/dashboard/SimplifiedDashboard";
import LandingSequence from "@/v1/landing/LandingSequence";
import MoveOnboardingSequence from "@/v1/sequence/MoveOnboardingSequence";
import PlayOnboardingSequence from "@/v1/sequence/PlayOnboardingSequence";
import SignupGate from "@/v1/signup/SignupGate";
import SignupOnboarding from "@/v1/signup/SignupOnboarding";
import { hasSeenV1Onboarding, markV1OnboardingSeen } from "@/v1/V1OnboardingStorage";

const V1_BASE = "/v1";

function buildDisplayName({ authUser, user, walletAddress }) {
  if (authUser?.email?.address) {
    return authUser.email.address.split("@")[0];
  }

  if (user?.email) {
    return String(user.email).split("@")[0];
  }

  if (walletAddress) {
    return `Zwapper ${walletAddress.slice(2, 6)}`;
  }

  return "Zwapper";
}

export default function V1App() {
  const navigate = useNavigate();
  const { user, authUser, walletAddress, isAuthenticated } = useApp();

  const [todaySteps, setTodaySteps] = useState(0);
  const [moveActive, setMoveActive] = useState(false);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(0);
  const [zptsBalance, setZptsBalance] = useState(0);
  const [triedMove, setTriedMove] = useState(false);
  const [triedPlay, setTriedPlay] = useState(false);
  const [onboardingSeen] = useState(() => hasSeenV1Onboarding());

  const displayName = useMemo(() => {
    return buildDisplayName({ authUser, user, walletAddress });
  }, [authUser, user, walletAddress]);

  const tier = user?.subscription_tier === "plus" ? "zitizen" : "zwapper";

  const moveRoute = `${V1_BASE}/move`;
  const playRoute = `${V1_BASE}/play`;
  const aboutRoute = `${V1_BASE}/about`;
  const signupGateRoute = `${V1_BASE}/signup-gate`;
  const signupRoute = `${V1_BASE}/signup`;
  const dashboardRoute = `${V1_BASE}/dashboard`;

  const shopUnlocked = zptsBalance >= 30 || (isAuthenticated && triedMove && triedPlay);

  const taskStates = useMemo(() => {
    return [
      { label: "Login", completed: Boolean(isAuthenticated) },
      { label: "Move", completed: triedMove },
      { label: "Play", completed: triedPlay },
      {
        label: shopUnlocked ? "Shop" : "Learn",
        completed: shopUnlocked,
      },
    ];
  }, [isAuthenticated, triedMove, triedPlay, shopUnlocked]);

  const completedTasks = useMemo(() => {
    return taskStates.filter((task) => task.completed).length;
  }, [taskStates]);

  const getNextOnboardingRoute = ({
    nextTriedMove = triedMove,
    nextTriedPlay = triedPlay,
  } = {}) => {
    if (nextTriedMove && nextTriedPlay) {
      return signupGateRoute;
    }

    if (nextTriedMove && !nextTriedPlay) {
      return playRoute;
    }

    if (!nextTriedMove && nextTriedPlay) {
      return moveRoute;
    }

    return V1_BASE;
  };

  const advanceOnboarding = ({
    nextTriedMove = triedMove,
    nextTriedPlay = triedPlay,
  } = {}) => {
    if (nextTriedMove && nextTriedPlay) {
      markV1OnboardingSeen();
      navigate(signupGateRoute);
      return;
    }

    navigate(
      getNextOnboardingRoute({
        nextTriedMove,
        nextTriedPlay,
      })
    );
  };

  return (
    <Routes>
      <Route
        path={V1_BASE}
        element={
          isAuthenticated ? (
            <Navigate to={dashboardRoute} replace />
          ) : onboardingSeen ? (
            <Navigate to={signupRoute} replace />
          ) : (
            <LandingSequence
              onSelect={(target) => {
                if (target === "move") navigate(moveRoute);
                if (target === "play") navigate(playRoute);
                if (target === "learn") navigate(aboutRoute);
              }}
            />
          )
        }
      />

      <Route
        path={`${V1_BASE}/about`}
        element={
          <OnboardingAboutPage
            onMove={() => navigate(moveRoute)}
            onPlay={() => navigate(playRoute)}
            navigate={navigate}
            moveRoute={moveRoute}
            playRoute={playRoute}
          />
        }
      />

      <Route
        path={`${V1_BASE}/move`}
        element={
          <MoveOnboardingSequence
            totalSteps={todaySteps}
            progressPercent={Math.min((todaySteps / 20) * 100, 100)}
            onStartTracking={() => {
              setMoveActive(true);
            }}
            onStopTracking={() => {
              setMoveActive(false);
            }}
            onTryPlay={() => {
              const nextTriedMove = true;

              setMoveActive(false);
              setTriedMove(nextTriedMove);

              advanceOnboarding({
                nextTriedMove,
                nextTriedPlay: triedPlay,
              });
            }}
            onLearnMore={() => navigate(aboutRoute)}
            onMoveComplete={({ displayedSteps = 0, displayedZpts = 0 } = {}) => {
              const nextTriedMove = true;

              setMoveActive(false);
              setTriedMove(nextTriedMove);
              setTodaySteps((prev) => Math.max(prev, displayedSteps));
              setZptsBalance((prev) => Math.max(prev, displayedZpts));

              advanceOnboarding({
                nextTriedMove,
                nextTriedPlay: triedPlay,
              });
            }}
            onMoveMilestone={({ displayedSteps = 0, displayedZpts = 0 } = {}) => {
              setTodaySteps((prev) => Math.max(prev, displayedSteps));
              setZptsBalance((prev) => Math.max(prev, displayedZpts));
            }}
          />
        }
      />

      <Route
        path={`${V1_BASE}/play`}
        element={
          <PlayOnboardingSequence
            onTryMove={() => navigate(moveRoute)}
            onForceMove={() => navigate(moveRoute)}
            onStackzComplete={() => {
              const nextTriedPlay = true;

              setTriedPlay(nextTriedPlay);
              setGamesPlayedToday((prev) => prev + 1);
              setZptsBalance((prev) => prev + 10);

              advanceOnboarding({
                nextTriedMove: triedMove,
                nextTriedPlay,
              });
            }}
            onBreakerzComplete={() => {
              const nextTriedPlay = true;

              setTriedPlay(nextTriedPlay);
              setGamesPlayedToday((prev) => prev + 1);
              setZptsBalance((prev) => prev + 12);

              advanceOnboarding({
                nextTriedMove: triedMove,
                nextTriedPlay,
              });
            }}
            navigate={navigate}
            moveRoute={moveRoute}
          />
        }
      />

      <Route
        path={`${V1_BASE}/signup-gate`}
        element={
          isAuthenticated ? (
            <Navigate to={dashboardRoute} replace />
          ) : triedMove && triedPlay ? (
            <SignupGate
              hasTriedMove={triedMove}
              hasTriedPlay={triedPlay}
              onBeginAuth={() => navigate(signupRoute)}
              onExitOnboarding={() => navigate(dashboardRoute)}
            />
          ) : onboardingSeen ? (
            <Navigate to={signupRoute} replace />
          ) : (
            <Navigate
              to={getNextOnboardingRoute({
                nextTriedMove: triedMove,
                nextTriedPlay: triedPlay,
              })}
              replace
            />
          )
        }
      />

      <Route
        path={`${V1_BASE}/signup`}
        element={
          isAuthenticated ? (
            <Navigate to={dashboardRoute} replace />
          ) : (
            <SignupOnboarding
              navigate={navigate}
              dashboardRoute={dashboardRoute}
              onAuthSuccess={() => {
                navigate(dashboardRoute);
              }}
            />
          )
        }
      />

      <Route
        path={`${V1_BASE}/dashboard`}
        element={
          <SimplifiedDashboard
            displayName={displayName}
            subtext={walletAddress || "Account active"}
            tier={tier}
            zptsBalance={zptsBalance}
            zwapBalance={0}
            todaySteps={todaySteps}
            stepGoal={20}
            isMoveActive={moveActive}
            gamesPlayedToday={gamesPlayedToday}
            playGoal={2}
            completedTasks={completedTasks}
            totalTasks={taskStates.length}
            taskStates={taskStates}
            shopUnlocked={shopUnlocked}
            walletAddress={walletAddress}
            showUpgrade={!isAuthenticated}
            onOpenUpgrade={() => navigate(signupGateRoute)}
            onAdminTrigger={() => navigate("/admin")}
            onOpenProfile={() => navigate(dashboardRoute)}
            onOpenContact={() => navigate("/contact")}
            onOpenPrivacy={() => navigate("/privacy")}
            onOpenHelp={() => navigate(aboutRoute)}
            onOpenTerms={() => navigate("/terms")}
            onOpenZwapPanel={() => navigate(signupGateRoute)}
            homeRoute={dashboardRoute}
            moveRoute={moveRoute}
            playRoute={playRoute}
            tasksRoute={signupGateRoute}
            shopRoute={dashboardRoute}
          />
        }
      />

      <Route path="*" element={<Navigate to={V1_BASE} replace />} />
    </Routes>
  );
}