import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { useApp } from "@/app/AppProvider";
import useV1AccessState from "@/app/useV1AccessState";

import OnboardingAboutPage from "@/v1/about/OnboardingAboutPage";
import SignIn from "@/v1/auth/SignIn";
import SignOut from "@/v1/auth/SignOut";
import SimplifiedDashboard from "@/v1/dashboard/SimplifiedDashboard";
import useV1DashboardState from "@/v1/dashboard/useV1DashboardState";
import LandingSequence from "@/v1/landing/LandingSequence";
import useV1OnboardingController from "@/v1/onboarding/useV1OnboardingController";
import useV1OnboardingSessionStats from "@/v1/onboarding/useV1OnboardingSessionStats";
import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingRoutes";
import MoveOnboardingSequence from "@/v1/sequence/MoveOnboardingSequence";
import PlayOnboardingSequence from "@/v1/sequence/PlayOnboardingSequence";
import SignupGate from "@/v1/signup/SignupGate";
import SignupOnboarding from "@/v1/signup/SignupOnboarding";

export default function V1App() {
  const navigate = useNavigate();
  const { user, authUser, walletAddress, isAuthenticated } = useApp();

  const access = useV1AccessState({
    user,
    authUser,
    walletAddress,
    isAuthenticated,
  });

  const onboarding = useV1OnboardingController({ navigate });

  const session = useV1OnboardingSessionStats({ user });

  const dashboardState = useV1DashboardState({
    user: session.dashboardUser,
    authUser,
    isAuthenticated: access.canSeeDashboard,
    isAdminPreviewUser: access.isAdminPreviewUser,
  });

  return (
    <Routes>
      <Route
        path=""
        element={
          access.canSeeDashboard ? (
            <Navigate to="dashboard" replace />
          ) : onboarding.onboardingSeen ? (
            <Navigate to="signin" replace />
          ) : (
            <LandingSequence onSelect={onboarding.startFromWelcome} />
          )
        }
      />

      <Route
        path="about"
        element={
          <OnboardingAboutPage
            hasTriedMove={onboarding.moveStarted}
            hasTriedPlay={onboarding.playStarted}
            onMove={onboarding.goToMove}
            onPlay={onboarding.goToPlay}
          />
        }
      />

      <Route
        path="move"
        element={
          <MoveOnboardingSequence
            totalSteps={session.todaySteps}
            progressPercent={Math.min((session.todaySteps / 20) * 100, 100)}
            onStartTracking={() => {
              session.startMoveTracking();
              onboarding.markMoveStarted();
            }}
            onStopTracking={session.stopMoveTracking}
            onTryPlay={() => {
              session.stopMoveTracking();
              onboarding.finishMoveAndGoNext();
            }}
            onLearnMore={() => {
              session.stopMoveTracking();
              onboarding.goToLearnMore();
            }}
            onMoveComplete={(payload) => {
              session.applyMoveComplete(payload);
              onboarding.finishMoveAndGoNext();
            }}
            onMoveMilestone={session.applyMoveMilestone}
          />
        }
      />

      <Route
        path="play"
        element={
          <PlayOnboardingSequence
            triedMove={onboarding.moveStarted}
            onLearnMore={onboarding.goToLearnMore}
            onStartPlay={onboarding.markPlayStarted}
            onComplete={(payload) => {
              session.applyPlayComplete(payload);
              onboarding.finishPlayAndGoNext();
            }}
          />
        }
      />

      <Route
        path="signup-gate"
        element={
          onboarding.canEnterSignupGate() ? (
            <SignupGate
              hasTriedMove={onboarding.moveStarted}
              hasTriedPlay={onboarding.playStarted}
              onBeginAuth={() =>
                onboarding.markSeenAndGo(V1_ONBOARDING_ROUTES.signup)
              }
              onExitOnboarding={onboarding.goToRoot}
            />
          ) : (
            <Navigate to={onboarding.getSignupGateFallback()} replace />
          )
        }
      />

      <Route
        path="signup"
        element={
          <SignupOnboarding
            navigate={navigate}
            dashboardRoute={V1_ONBOARDING_ROUTES.dashboard}
            onAuthSuccess={() =>
              onboarding.markSeenAndGo(V1_ONBOARDING_ROUTES.dashboard)
            }
          />
        }
      />

      <Route
        path="signin"
        element={
          <SignIn
            dashboardRoute={V1_ONBOARDING_ROUTES.dashboard}
            onSuccess={() =>
              onboarding.markSeenAndGo(V1_ONBOARDING_ROUTES.dashboard)
            }
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
          access.canSeeDashboard ? (
            <SimplifiedDashboard
              user={session.dashboardUser}
              authUser={authUser}
              displayName={access.displayName || dashboardState.displayName}
              subtext={
                walletAddress || access.resolvedEmail || "Account active"
              }
              tier={access.tier}
              zptsBalance={dashboardState.zptsBalance}
              zwapBalance={0}
              todaySteps={dashboardState.dailySteps}
              stepGoal={20}
              isMoveActive={session.moveActive}
              gamesPlayedToday={session.gamesPlayedToday}
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
              showUpgrade={!access.canSeeDashboard}
              onOpenUpgrade={onboarding.goToSignupGate}
              onAdminTrigger={() => navigate("/admin")}
              onOpenProfile={onboarding.goToDashboard}
              onOpenContact={() => navigate("/contact")}
              onOpenPrivacy={() => navigate("/privacy")}
              onOpenHelp={onboarding.goToLearnMore}
              onOpenTerms={() => navigate("/terms")}
              onOpenZwapPanel={onboarding.goToSignupGate}
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