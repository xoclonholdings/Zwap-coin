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
import {
  V1_ONBOARDING_ROUTES,
  getLandingTargetRoute,
  getNextOnboardingRoute,
  isOnboardingComplete,
  markOnboardingActionTried,
} from "@/v1/onboarding/onboardingFlow";

const STARTING_ONBOARDING_ZPTS = 100;
const SHOP_UNLOCK_ZPTS = 1000;
const ADMIN_PREVIEW_ZPTS = 5000;

const REVIEW_ACCESS_STORAGE_KEY = "zwap_review_access_enabled";
const ADMIN_PREVIEW_EMAILS = ["admin@zwap.online"];

function getReviewAccessEnabled() {
  try {
    return window.localStorage.getItem(REVIEW_ACCESS_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getResolvedEmail({ authUser, user, isReviewAccess }) {
  if (isReviewAccess) return "review@zwap.app";

  return String(
    authUser?.email?.address ||
      authUser?.email ||
      user?.email ||
      user?.email_address ||
      ""
  )
    .trim()
    .toLowerCase();
}

function getIsAdminPreviewUser(email) {
  return ADMIN_PREVIEW_EMAILS.includes(String(email || "").trim().toLowerCase());
}

function buildDisplayName({ authUser, user, walletAddress, isReviewAccess }) {
  if (isReviewAccess) return "Reviewer";
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
  const [isReviewAccess] = useState(() => getReviewAccessEnabled());

  const [todaySteps, setTodaySteps] = useState(0);
  const [moveActive, setMoveActive] = useState(false);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(0);
  const [zptsBalance, setZptsBalance] = useState(STARTING_ONBOARDING_ZPTS);

  const canSeeDashboard = isAuthenticated || isReviewAccess;

  const resolvedEmail = useMemo(() => {
    return getResolvedEmail({ authUser, user, isReviewAccess });
  }, [authUser, user, isReviewAccess]);

  const isAdminPreviewUser = useMemo(() => {
    return getIsAdminPreviewUser(resolvedEmail);
  }, [resolvedEmail]);

  const displayName = useMemo(() => {
    return buildDisplayName({
      authUser,
      user,
      walletAddress,
      isReviewAccess,
    });
  }, [authUser, user, walletAddress, isReviewAccess]);

  const tier =
    isAdminPreviewUser || user?.subscription_tier === "plus"
      ? "zitizen"
      : "zwapper";

  const triedMove = onboardingProgress.move;
  const triedPlay = onboardingProgress.play;

  function setProgress(nextProgress) {
    progressRef.current = {
      move: Boolean(nextProgress?.move),
      play: Boolean(nextProgress?.play),
    };

    setOnboardingProgress(progressRef.current);

    return progressRef.current;
  }

  function completeAction(action) {
    const nextProgress = markOnboardingActionTried(progressRef.current, action);
    return setProgress(nextProgress);
  }

  function navigateToNext(progress = progressRef.current) {
    navigate(getNextOnboardingRoute(progress));
  }

  const normalShopUnlocked = zptsBalance >= SHOP_UNLOCK_ZPTS;
  const shopUnlocked = isAdminPreviewUser || normalShopUnlocked;

  const dashboardZptsBalance = isAdminPreviewUser
    ? Math.max(zptsBalance, ADMIN_PREVIEW_ZPTS)
    : zptsBalance;

  const dashboardTodaySteps = isAdminPreviewUser
    ? Math.max(todaySteps, 20)
    : todaySteps;

  const dashboardGamesPlayedToday = isAdminPreviewUser
    ? Math.max(gamesPlayedToday, 1)
    : gamesPlayedToday;

  const taskStates = useMemo(() => {
    return [
      { label: "Login", completed: Boolean(canSeeDashboard) },
      { label: "Move", completed: isAdminPreviewUser || triedMove },
      { label: "Play", completed: isAdminPreviewUser || triedPlay },
      { label: shopUnlocked ? "Shop" : "Learn", completed: shopUnlocked },
    ];
  }, [
    canSeeDashboard,
    isAdminPreviewUser,
    triedMove,
    triedPlay,
    shopUnlocked,
  ]);

  const completedTasks = useMemo(() => {
    return taskStates.filter((task) => task.completed).length;
  }, [taskStates]);

  return (
    <Routes>
      <Route
        path=""
        element={
          canSeeDashboard ? (
            <Navigate to="dashboard" replace />
          ) : onboardingSeen ? (
            <Navigate to="signin" replace />
          ) : (
            <LandingSequence
              onSelect={(target) => navigate(getLandingTargetRoute(target))}
            />
          )
        }
      />

      <Route
        path="about"
        element={
          isOnboardingComplete(onboardingProgress) ? (
            <Navigate to={V1_ONBOARDING_ROUTES.signupGate} replace />
          ) : (
            <OnboardingAboutPage
              hasTriedMove={triedMove}
              hasTriedPlay={triedPlay}
              onMove={() => navigate(V1_ONBOARDING_ROUTES.move)}
              onPlay={() => navigate(V1_ONBOARDING_ROUTES.play)}
              navigate={navigate}
              moveRoute={V1_ONBOARDING_ROUTES.move}
              playRoute={V1_ONBOARDING_ROUTES.play}
            />
          )
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
              const next = completeAction("move");
              navigateToNext(next);
            }}
            onLearnMore={() => {
              setMoveActive(false);
              completeAction("move");
              navigate(V1_ONBOARDING_ROUTES.about);
            }}
            onMoveComplete={({ displayedSteps = 0, displayedZpts = 0 } = {}) => {
              setMoveActive(false);

              setTodaySteps((previous) => Math.max(previous, displayedSteps));
              setZptsBalance((previous) =>
                Math.max(previous, STARTING_ONBOARDING_ZPTS + displayedZpts)
              );

              const next = completeAction("move");
              navigateToNext(next);
            }}
            onMoveMilestone={({ displayedSteps = 0, displayedZpts = 0 } = {}) => {
              setTodaySteps((previous) => Math.max(previous, displayedSteps));
              setZptsBalance((previous) =>
                Math.max(previous, STARTING_ONBOARDING_ZPTS + displayedZpts)
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
              completeAction("play");
              navigate(V1_ONBOARDING_ROUTES.about);
            }}
            onComplete={({ displayedZpts = 50 } = {}) => {
              setGamesPlayedToday((previous) => previous + 1);
              setZptsBalance((previous) =>
                Math.max(previous, STARTING_ONBOARDING_ZPTS + displayedZpts)
              );

              const next = completeAction("play");
              navigateToNext(next);
            }}
          />
        }
      />

      <Route
        path="signup-gate"
        element={
          isOnboardingComplete(onboardingProgress) ? (
            <SignupGate
              hasTriedMove
              hasTriedPlay
              onBeginAuth={() => {
                markV1OnboardingSeen();
                navigate(V1_ONBOARDING_ROUTES.signup);
              }}
              onExitOnboarding={() => navigate(V1_ONBOARDING_ROUTES.root)}
            />
          ) : (
            <Navigate to={getNextOnboardingRoute(onboardingProgress)} replace />
          )
        }
      />

      <Route
        path="signup"
        element={
          <SignupOnboarding
            navigate={navigate}
            dashboardRoute={V1_ONBOARDING_ROUTES.dashboard}
            onAuthSuccess={() => {
              markV1OnboardingSeen();
              navigate(V1_ONBOARDING_ROUTES.dashboard);
            }}
          />
        }
      />

      <Route
        path="signin"
        element={
          <SignIn
            dashboardRoute={V1_ONBOARDING_ROUTES.dashboard}
            onSuccess={() => {
              markV1OnboardingSeen();
              navigate(V1_ONBOARDING_ROUTES.dashboard);
            }}
          />
        }
      />

      <Route
        path="signout"
        element={<SignOut nextRoute={V1_ONBOARDING_ROUTES.signin} />}
      />

      <Route
        path="dashboard"
        element={
          canSeeDashboard ? (
            <SimplifiedDashboard
              user={user}
              authUser={authUser}
              displayName={displayName}
              subtext={walletAddress || resolvedEmail || "Account active"}
              tier={tier}
              zptsBalance={dashboardZptsBalance}
              zwapBalance={0}
              todaySteps={dashboardTodaySteps}
              stepGoal={20}
              isMoveActive={moveActive}
              gamesPlayedToday={dashboardGamesPlayedToday}
              playGoal={1}
              completedTasks={completedTasks}
              totalTasks={taskStates.length}
              taskStates={taskStates}
              shopUnlocked={shopUnlocked}
              gardenUnlocked={isAdminPreviewUser}
              rarePlantUnlocked={isAdminPreviewUser}
              learnUnlocked={isAdminPreviewUser}
              streamUnlocked={isAdminPreviewUser}
              assistUnlocked={isAdminPreviewUser}
              badgeVisibilityUnlocked={isAdminPreviewUser}
              isSwapUnlocked={isAdminPreviewUser}
              walletAddress={walletAddress}
              showUpgrade={!canSeeDashboard}
              onOpenUpgrade={() => navigate(V1_ONBOARDING_ROUTES.signupGate)}
              onAdminTrigger={() => navigate("/admin")}
              onOpenProfile={() => navigate(V1_ONBOARDING_ROUTES.dashboard)}
              onOpenContact={() => navigate("/contact")}
              onOpenPrivacy={() => navigate("/privacy")}
              onOpenHelp={() => navigate(V1_ONBOARDING_ROUTES.about)}
              onOpenTerms={() => navigate("/terms")}
              onOpenZwapPanel={() => navigate(V1_ONBOARDING_ROUTES.signupGate)}
              homeRoute={V1_ONBOARDING_ROUTES.dashboard}
              moveRoute={V1_ONBOARDING_ROUTES.move}
              playRoute={V1_ONBOARDING_ROUTES.play}
              tasksRoute={V1_ONBOARDING_ROUTES.signupGate}
              shopRoute={V1_ONBOARDING_ROUTES.dashboard}
            />
          ) : (
            <Navigate to={V1_ONBOARDING_ROUTES.signin} replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}