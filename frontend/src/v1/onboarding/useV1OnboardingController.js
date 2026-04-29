import { useRef, useState } from "react";

import {
  hasSeenV1Onboarding,
  markV1OnboardingSeen,
} from "@/v1/V1OnboardingStorage";

import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingRoutes";

import {
  ONBOARDING_ACTIONS,
  getActionStartedResult,
  getLandingTargetResult,
  normalizeOnboardingProgress,
} from "@/v1/onboarding/onboardingFlow";

import { getLearnMoreStartResult } from "@/v1/onboarding/learnMoreFlow";

import {
  canShowSignupGate,
  getSignupGateFallbackRoute,
} from "@/v1/onboarding/signupGateFlow";

export default function useV1OnboardingController({ navigate }) {
  const progressRef = useRef({
    moveStarted: false,
    playStarted: false,
  });

  const [onboardingProgress, setOnboardingProgress] = useState({
    moveStarted: false,
    playStarted: false,
  });

  const [onboardingSeen] = useState(() => hasSeenV1Onboarding());

  function setProgress(nextProgress) {
    const normalizedProgress = normalizeOnboardingProgress(nextProgress);

    progressRef.current = normalizedProgress;
    setOnboardingProgress(normalizedProgress);

    return normalizedProgress;
  }

  function applyStartedAction(action) {
    const result = getActionStartedResult(progressRef.current, action);

    setProgress(result.progress);

    return result;
  }

  function applyStartedActionAndNavigate(action) {
    const result = getActionStartedResult(progressRef.current, action);

    setProgress(result.progress);
    navigate(result.route);

    return result;
  }

  function startFromWelcome(target) {
    const result = getLandingTargetResult(target);

    setProgress(result.progress);
    navigate(result.route);

    return result;
  }

  function goToRoot() {
    navigate(V1_ONBOARDING_ROUTES.root);
  }

  function goToMove() {
    navigate(V1_ONBOARDING_ROUTES.move);
  }

  function goToPlay() {
    navigate(V1_ONBOARDING_ROUTES.play);
  }

  function goToDashboard() {
    navigate(V1_ONBOARDING_ROUTES.dashboard);
  }

  function goToSignupGate() {
    navigate(V1_ONBOARDING_ROUTES.signupGate);
  }

  function goToLearnMore() {
    const result = getLearnMoreStartResult(progressRef.current);

    setProgress(result.progress);
    navigate(result.route);

    return result;
  }

  function markMoveStarted() {
    return applyStartedAction(ONBOARDING_ACTIONS.moveStarted);
  }

  function markPlayStarted() {
    return applyStartedAction(ONBOARDING_ACTIONS.playStarted);
  }

  function finishMoveAndGoNext() {
    return applyStartedActionAndNavigate(ONBOARDING_ACTIONS.moveStarted);
  }

  function finishPlayAndGoNext() {
    return applyStartedActionAndNavigate(ONBOARDING_ACTIONS.playStarted);
  }

  function canEnterSignupGate() {
    return canShowSignupGate(progressRef.current);
  }

  function getSignupGateFallback() {
    return getSignupGateFallbackRoute(progressRef.current);
  }

  function markSeenAndGo(route) {
    markV1OnboardingSeen();
    navigate(route);
  }

  return {
    onboardingProgress,
    onboardingSeen,

    moveStarted: onboardingProgress.moveStarted,
    playStarted: onboardingProgress.playStarted,

    startFromWelcome,

    goToRoot,
    goToMove,
    goToPlay,
    goToDashboard,
    goToSignupGate,
    goToLearnMore,

    markMoveStarted,
    markPlayStarted,

    finishMoveAndGoNext,
    finishPlayAndGoNext,

    canEnterSignupGate,
    getSignupGateFallback,
    markSeenAndGo,
  };
}