import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { useApp } from "@/app/AppProvider";

import useV1AccessState from "@/app/useV1AccessState";
import useV1DashboardState from "@/v1/dashboard/useV1DashboardState";
import useV1OnboardingController from "@/v1/onboarding/useV1OnboardingController";
import useV1OnboardingSessionStats from "@/v1/onboarding/useV1OnboardingSessionStats";

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
  V1_ONBOARDING_ROUTES,
  ONBOARDING_ACTIONS,
} from "@/v1/onboarding/onboardingFlow";

export default function V1App() {
  const navigate = useNavigate();
  const { user, authUser, walletAddress, isAuthenticated } = useApp();

  const {
    canSeeDashboard,
    resolvedEmail,
    isAdminPreviewUser,
    displayName,
    tier,
  } = useV1AccessState({
    user,
    authUser,
    walletAddress,
    isAuthenticated,
  });

  const {
    onboardingSeen,
    moveStarted,
    playStarted,
    startFromWelcome,
    markActionStarted,
    startActionAndGoNext,
    goToLearnMore,
    canEnterSignupGate,
    getSignupGateFallback,
    markSeenAndGo,
  } = useV1OnboardingController({ navigate });

  const {
    todaySteps,
    moveActive,
    gamesPlayedToday,
    dashboardUser,
    startMoveTracking,
    stopMoveTracking,
    applyMoveMilestone,
    applyMoveComplete,
    applyPlayComplete,
  } = useV1OnboardingSessionStats({ user });

  const dashboardState = useV1DashboardState({
    user: dashboardUser,
    authUser,
    isAuthenticated: canSeeDashboard,
    isAdminPreviewUser,
  });

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
            <LandingSequence onSelect={startFromWelcome} />
          )
        }
      />

      <Route
        path="about"
        element={
          <OnboardingAboutPage
            hasTriedMove={moveStarted}
            hasTriedPlay={playStarted}
            onMove={() => navigate(V1_ONBOARDING_ROUTES.move)}
            onPlay={() => navigate(V1_ONBOARDING_ROUTES.play)}
          />
        }
      />

      <Route
        path="move"
        element={
          <MoveOnboardingSequence
            totalSteps={todaySteps}
            progressPercent={Math.min((todaySteps / 20) * 100, 100)}
            onStartTracking={() => {
              startMoveTracking();
              markActionStarted(ONBOARDING_ACTIONS.moveStarted);
            }}
            onStopTracking={stopMoveTracking}
            onTryPlay={() => {
              stopMoveTracking();
              startActionAndGoNext(ONBOARDING_ACTIONS.moveStarted);
            }}
            onLearnMore={() => {
              stopMoveTracking();
              goToLearnMore();
            }}
            onMoveComplete={(payload) => {
              applyMoveComplete(payload);
              startActionAndGoNext(ONBOARDING_ACTIONS.moveStarted);
            }}
            onMoveMilestone={applyMoveMilestone}
          />
        }
      />

      <Route
        path="play"
        element={
          <PlayOnboardingSequence
            triedMove={moveStarted}
            onLearnMore={goToLearnMore}
            onStartPlay={() => {
              markActionStarted(ONBOARDING_ACTIONS.playStarted);
            }}
            onComplete={(payload) => {
              applyPlayComplete(payload);
              startActionAndGoNext(ONBOARDING_ACTIONS.playStarted);
            }}
          />
        }
      />

      <Route
        path="signup-gate"
        element={
          canEnterSignupGate() ? (
            <SignupGate
              hasTriedMove={moveStarted}
              hasTriedPlay={playStarted}
              onBeginAuth={() => markSeenAndGo(V1_ONBOARDING_ROUTES.signup)}
              onExitOnboarding={() => navigate(V1_ONBOARDING_ROUTES.root)}
            />
          ) : (
            <Navigate to={getSignupGateFallback()} replace />
          )
        }
      />

      <Route
        path="signup"
        element={
          <SignupOnboarding
            navigate={navigate}
            dashboardRoute={V1_ONBOARDING_ROUTES.dashboard}
            onAuthSuccess={() => markSeenAndGo(V1_ONBOARDING_ROUTES.dashboard)}
          />
        }
      />

      <Route
        path="signin"
        element={
          <SignIn
            dashboardRoute={V1_ONBOARDING_ROUTES.dashboard}
            onSuccess={() => markSeenAndGo(V1_ONBOARDING_ROUTES.dashboard)}
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
              user={dashboardUser}
              authUser={authUser}
              displayName={displayName || dashboardState.displayName}
              subtext={walletAddress || resolvedEmail || "Account active"}
              tier={tier}
              zptsBalance={dashboardState.zptsBalance}
              zwapBalance={0}
              todaySteps={dashboardState.dailySteps}
              stepGoal={20}
              isMoveActive={moveActive}
              gamesPlayedToday={gamesPlayedToday}
              playGoal={1}
              completedTasks={dashboardState.completedTaskCount}
              totalTasks={dashboardState.totalTaskCount}
              taskStates={dashboardState.taskStates}
              shopUnlocked={dashboardState.shopUnlocked}
              gardenUnlocked={dashboardState.gardenUnlocked}
              rarePlantUnlocked={dashboardState.rarePlantUnlocked}
              learnUnlocked={dashboardState.learnUnlocked}
              streamUnlocked={dashboardState.streamUnlocked}
              assistUnlocked={dashboardState.assistUnlocked}
              badgeVisibilityUnlocked={dashboardState.badgeVisibilityUnlocked}
              isSwapUnlocked={dashboardState.isSwapUnlocked}
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