import React, { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { useApp } from "@/app/AppProvider";

import OnboardingAboutPage from "@/v1/about/OnboardingAboutPage";
import SimplifiedDashboard from "@/v1/dashboard/SimplifiedDashboard";
import LandingSequence from "@/v1/landing/LandingSequence";
import MoveOnboardingSequence from "@/v1/sequence/MoveOnboardingSequence";
import PlayOnboardingSequence from "@/v1/sequence/PlayOnboardingSequence";
import SignupGate from "@/v1/signup/SignupGate";
import SignupOnboarding from "@/v1/signup/SignupOnboarding";

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

  useEffect(() => {
    if (!moveActive) return undefined;

    const timer = window.setInterval(() => {
      setTodaySteps((prev) => Math.min(prev + 24, 360));
      setZptsBalance((prev) => Math.min(prev + 2, 36));
    }, 850);

    return () => window.clearInterval(timer);
  }, [moveActive]);

  const displayName = useMemo(() => {
    return buildDisplayName({ authUser, user, walletAddress });
  }, [authUser, user, walletAddress]);

  const tier = user?.subscription_tier === "plus" ? "zitizen" : "zwapper";
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

  const moveRoute = `${V1_BASE}/move`;
  const playRoute = `${V1_BASE}/play`;
  const aboutRoute = `${V1_BASE}/about`;
  const signupGateRoute = `${V1_BASE}/signup-gate`;
  const signupRoute = `${V1_BASE}/signup`;
  const dashboardRoute = `${V1_BASE}/dashboard`;

  const maybeOpenSignupGate = ({
    nextTriedMove = triedMove,
    nextTriedPlay = triedPlay,
  } = {}) => {
    if (!isAuthenticated && nextTriedMove && nextTriedPlay) {
      navigate(signupGateRoute);
      return true;
    }

    return false;
  };

  return (
    <Routes>
      <Route
        path={V1_BASE}
        element={
          <LandingSequence
            onSelect={(target) => {
              if (target === "move") navigate(moveRoute);
              if (target === "play") navigate(playRoute);
              if (target === "learn") navigate(aboutRoute);
            }}
          />
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
            progressPercent={Math.min((todaySteps / 180) * 100, 100)}
            onStartTracking={() => {
              setMoveActive(true);
              setTriedMove(true);
            }}
            onStopTracking={() => {
              setMoveActive(false);
              maybeOpenSignupGate({ nextTriedMove: true });
            }}
            onTryPlay={() => navigate(playRoute)}
            onLearnMore={() => navigate(aboutRoute)}
            onMoveMilestone={({ displayedZpts = 0 }) => {
              const nextTriedMove = true;
              setTriedMove(nextTriedMove);
              setZptsBalance((prev) => Math.max(prev, displayedZpts));
              maybeOpenSignupGate({ nextTriedMove, nextTriedPlay: triedPlay });
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
              maybeOpenSignupGate({ nextTriedMove: triedMove, nextTriedPlay });
            }}
            onBreakerzComplete={() => {
              const nextTriedPlay = true;
              setTriedPlay(nextTriedPlay);
              setGamesPlayedToday((prev) => prev + 1);
              setZptsBalance((prev) => prev + 12);
              maybeOpenSignupGate({ nextTriedMove: triedMove, nextTriedPlay });
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
          ) : (
            <SignupGate
              hasTriedMove={triedMove}
              hasTriedPlay={triedPlay}
              onBeginAuth={() => navigate(signupRoute)}
              onExitOnboarding={() => navigate(dashboardRoute)}
            />
          )
        }
      />

      <Route
        path={`${V1_BASE}/signup`}
        element={
          <SignupOnboarding
            navigate={navigate}
            dashboardRoute={dashboardRoute}
            onAuthSuccess={() => {
              navigate(dashboardRoute);
            }}
          />
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
            stepGoal={180}
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
