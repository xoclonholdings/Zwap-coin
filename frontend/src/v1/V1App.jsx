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
  const dashboardRoute = `${V1_BASE}/dashboard`;

  const openDashboard = () => {
    setZptsBalance((current) => Math.max(current, STARTING_ONBOARDING_ZPTS));
    navigate(dashboardRoute);
  };

  const setProgress = ({ move, play }) => {
    const next = { move: !!move, play: !!play };
    progressRef.current = next;
    setOnboardingProgress(next);
    return next;
  };

  const markMoveTried = () =>
    setProgress({ move: true, play: progressRef.current.play });

  const markPlayTried = () =>
    setProgress({ move: progressRef.current.move, play: true });

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
    navigate(getNextOnboardingRoute(progress));
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
    return taskStates.filter((t) => t.completed).length;
  }, [taskStates]);

  return (
    <Routes>
      {/* ENTRY */}
      <Route
        path=""
        element={
          isAuthenticated ? (
            <Navigate to="dashboard" replace />
          ) : onboardingSeen ? (
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

      {/* ABOUT */}
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

      {/* MOVE */}
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
              advanceOnboarding(markMoveTried());
            }}
            onLearnMore={() => {
              setMoveActive(false);
              markMoveTried();
              navigate(aboutRoute);
            }}
            onMoveComplete={({ displayedSteps = 0, displayedZpts = 0 } = {}) => {
              setMoveActive(false);
              const next = markMoveTried();
              setTodaySteps((p) => Math.max(p, displayedSteps));
              setZptsBalance((p) =>
                Math.max(p, STARTING_ONBOARDING_ZPTS + displayedZpts)
              );
              advanceOnboarding(next);
            }}
          />
        }
      />

      {/* PLAY */}
      <Route
        path="play"
        element={
          <PlayOnboardingSequence
            triedMove={triedMove}
            onLearnMore={() => {
              markPlayTried();
              navigate(aboutRoute);
            }}
            onComplete={({ displayedZpts = 50 } = {}) => {
              const next = markPlayTried();
              setGamesPlayedToday((p) => p + 1);
              setZptsBalance((p) =>
                Math.max(p, STARTING_ONBOARDING_ZPTS + displayedZpts)
              );
              advanceOnboarding(next);
            }}
          />
        }
      />

      {/* SIGNUP GATE */}
      <Route
        path="signup-gate"
        element={
          progressRef.current.move && progressRef.current.play ? (
            <SignupGate
              hasTriedMove
              hasTriedPlay
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

      {/* SIGNUP */}
      <Route
        path="signup"
        element={
          <SignupOnboarding
            navigate={navigate}
            dashboardRoute={dashboardRoute}
            onAuthSuccess={() => navigate(dashboardRoute)}
          />
        }
      />

      {/* SIGNIN */}
      <Route
        path="signin"
        element={
          <SignIn
            dashboardRoute={dashboardRoute}
            onSuccess={() => navigate(dashboardRoute)}
          />
        }
      />

      <Route path="signout" element={<SignOut nextRoute={signInRoute} />} />

      {/* DASHBOARD */}
      <Route
        path="dashboard"
        element={
          isAuthenticated ? (
            <SimplifiedDashboard
              displayName={displayName}
              tier={tier}
              zptsBalance={zptsBalance}
              zwapBalance={0}
              todaySteps={todaySteps}
              gamesPlayedToday={gamesPlayedToday}
              completedTasks={completedTasks}
              totalTasks={taskStates.length}
              shopUnlocked={shopUnlocked}
              walletAddress={walletAddress}
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