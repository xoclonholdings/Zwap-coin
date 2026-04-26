import React, { useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { useApp } from "@/app/AppProvider";

import OnboardingAboutPage from "@/v1/about/OnboardingAboutPage";
import SimplifiedDashboard from "@/v1/dashboard/SimplifiedDashboard";
import SignIn from "@/v1/auth/SignIn";
import SignOut from "@/v1/auth/SignOut";
import LandingSequence from "@/v1/landing/LandingSequence";
import MoveOnboardingSequence from "@/v1/sequence/MoveOnboardingSequence";
import PlayOnboardingSequence from "@/v1/sequence/PlayOnboardingSequence";
import SignupGate from "@/v1/signup/SignupGate";
import SignupOnboarding from "@/v1/signup/SignupOnboarding";
import {
  hasSeenV1Onboarding,
  markV1OnboardingSeen,
} from "@/v1/V1OnboardingStorage";

const V1_BASE = "/v1";
const STARTING_ONBOARDING_ZPTS = 100;
const SHOP_UNLOCK_ZPTS = 1000;

function buildDisplayName({ authUser, user, walletAddress }) {
  if (authUser?.email?.address) return authUser.email.address.split("@")[0];
  if (authUser?.email) return String(authUser.email).split("@")[0];
  if (user?.email) return String(user.email).split("@")[0];
  if (walletAddress) return `Zwapper ${walletAddress.slice(2, 6)}`;
  return "Zwapper";
}

export default function V1App() {
  const navigate = useNavigate();
  const { user, authUser, walletAddress, isAuthenticated } = useApp();

  const progressRef = useRef({ move: false, play: false });

  const [dashboardUnlocked, setDashboardUnlocked] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState({
    move: false,
    play: false,
  });

  const [onboardingSeen] = useState(() => hasSeenV1Onboarding());
  const [todaySteps, setTodaySteps] = useState(0);
  const [moveActive, setMoveActive] = useState(false);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(0);
  const [zptsBalance, setZptsBalance] = useState(STARTING_ONBOARDING_ZPTS);

  const displayName = useMemo(() => {
    return buildDisplayName({ authUser, user, walletAddress });
  }, [authUser, user, walletAddress]);

  const tier = user?.subscription_tier === "plus" ? "zitizen" : "zwapper";

  const triedMove = onboardingProgress.move;
  const triedPlay = onboardingProgress.play;

  const moveRoute = `${V1_BASE}/move`;
  const playRoute = `${V1_BASE}/play`;
  const aboutRoute = `${V1_BASE}/about`;
  const signupGateRoute = `${V1_BASE}/signup-gate`;
  const signupRoute = `${V1_BASE}/signup`;
  const signInRoute = `${V1_BASE}/signin`;
  const signOutRoute = `${V1_BASE}/signout`;
  const dashboardRoute = `${V1_BASE}/dashboard`;

  const openDashboard = () => {
    setDashboardUnlocked(true);
    setZptsBalance((current) => Math.max(current, STARTING_ONBOARDING_ZPTS));
    navigate(dashboardRoute);
  };

  const setProgress = ({ move, play }) => {
    const nextProgress = {
      move: Boolean(move),
      play: Boolean(play),
    };

    progressRef.current = nextProgress;
    setOnboardingProgress(nextProgress);

    return nextProgress;
  };

  const markMoveTried = () => {
    return setProgress({
      move: true,
      play: progressRef.current.play,
    });
  };

  const markPlayTried = () => {
    return setProgress({
      move: progressRef.current.move,
      play: true,
    });
  };

  const getNextOnboardingRoute = ({
    move = progressRef.current.move,
    play = progressRef.current.play,
  } = {}) => {
    if (move && play) return signupGateRoute;
    if (move && !play) return playRoute;
    if (!move && play) return moveRoute;
    return V1_BASE;
  };

  const advanceOnboarding = (progress = progressRef.current) => {
    navigate(
      getNextOnboardingRoute({
        move: progress.move,
        play: progress.play,
      })
    );
  };

  const shopUnlocked = zptsBalance >= SHOP_UNLOCK_ZPTS;

  const taskStates = useMemo(() => {
    return [
      { label: "Login", completed: Boolean(isAuthenticated) },
      { label: "Move", completed: triedMove },
      { label: "Play", completed: triedPlay },
      { label: shopUnlocked ? "Shop" : "Learn", completed: shopUnlocked },
    ];
  }, [isAuthenticated, triedMove, triedPlay, shopUnlocked]);

  const completedTasks = useMemo(() => {
    return taskStates.filter((task) => task.completed).length;
  }, [taskStates]);

  return (
    <Routes>
      <Route
        path=""
        element={
          onboardingSeen ? (
            <Navigate to="signin" replace />
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
        path="about"
        element={
          <OnboardingAboutPage
            hasTriedMove={triedMove}
            hasTriedPlay={triedPlay}
            onMove={() => navigate(moveRoute)}
            onPlay={() => navigate(playRoute)}
            navigate={navigate}
            moveRoute={moveRoute}
            playRoute={playRoute}
          />
        }
      />

      <Route
        path="move"
        element={
          <MoveOnboardingSequence
            totalSteps={todaySteps}
            progressPercent={Math.min((todaySteps / 20) * 100, 100)}
            onStartTracking={() => setMoveActive(true)}
            onStopTracking={() => setMoveActive(false)}
            onTryPlay={() => {
              setMoveActive(false);
              const nextProgress = markMoveTried();
              advanceOnboarding(nextProgress);
            }}
            onLearnMore={() => {
              setMoveActive(false);
              markMoveTried();
              navigate(aboutRoute);
            }}
            onMoveComplete={({ displayedSteps = 0, displayedZpts = 0 } = {}) => {
              setMoveActive(false);
              const nextProgress = markMoveTried();

              setTodaySteps((prev) => Math.max(prev, displayedSteps));
              setZptsBalance((prev) =>
                Math.max(prev, STARTING_ONBOARDING_ZPTS + displayedZpts)
              );

              advanceOnboarding(nextProgress);
            }}
            onMoveMilestone={({ displayedSteps = 0, displayedZpts = 0 } = {}) => {
              setTodaySteps((prev) => Math.max(prev, displayedSteps));
              setZptsBalance((prev) =>
                Math.max(prev, STARTING_ONBOARDING_ZPTS + displayedZpts)
              );
            }}
          />
        }
      />

      <Route
        path="play"
        element={
          <PlayOnboardingSequence
            triedMove={triedMove}
            onLearnMore={() => {
              markPlayTried();
              navigate(aboutRoute);
            }}
            onComplete={({ displayedZpts = 50, shouldRouteToMove = false } = {}) => {
              const nextProgress = markPlayTried();

              setGamesPlayedToday((prev) => prev + 1);
              setZptsBalance((prev) =>
                Math.max(prev, STARTING_ONBOARDING_ZPTS + displayedZpts)
              );

              if (shouldRouteToMove && !nextProgress.move) {
                navigate(moveRoute);
                return;
              }

              advanceOnboarding(nextProgress);
            }}
          />
        }
      />

      <Route
        path="signup-gate"
        element={
          progressRef.current.move && progressRef.current.play ? (
            <SignupGate
              hasTriedMove={progressRef.current.move}
              hasTriedPlay={progressRef.current.play}
              onBeginAuth={() => {
                markV1OnboardingSeen();
                navigate(signupRoute);
              }}
              onExitOnboarding={() => navigate(V1_BASE)}
            />
          ) : (
            <Navigate to={getNextOnboardingRoute()} replace />
          )
        }
      />

      <Route
        path="signup"
        element={
          <SignupOnboarding
            navigate={navigate}
            dashboardRoute={dashboardRoute}
            onAuthSuccess={openDashboard}
          />
        }
      />

      <Route
        path="signin"
        element={
          <SignIn dashboardRoute={dashboardRoute} onSuccess={openDashboard} />
        }
      />

      <Route path="signout" element={<SignOut nextRoute={signInRoute} />} />

      <Route
        path="dashboard"
        element={
          isAuthenticated && dashboardUnlocked ? (
            <SimplifiedDashboard
              displayName={displayName}
              subtext={walletAddress || authUser?.email || "Account active"}
              tier={tier}
              zptsBalance={zptsBalance}
              zwapBalance={0}
              todaySteps={todaySteps}
              stepGoal={20}
              isMoveActive={moveActive}
              gamesPlayedToday={gamesPlayedToday}
              playGoal={1}
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
          ) : (
            <Navigate to="signin" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}