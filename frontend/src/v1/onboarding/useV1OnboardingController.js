import { useRef, useState } from "react";

import {
  hasSeenV1Onboarding,
  markV1OnboardingSeen,
} from "@/v1/V1OnboardingStorage";

import { V1_ONBOARDING_ROUTES } from "@/v1/onboarding/onboardingRoutes";

import {
  ONBOARDING_ACTIONS,
  getActionResult,
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
    moveVerified: false,
    playStarted: false,
    playCompleted: false,
  });

  const [onboardingProgress, setOnboardingProgress] = useState({
    moveStarted: false,
    moveVerified: false,
    playStarted: false,
    playCompleted: false,
  });

  const [onboardingSeen] = useState(() => hasSeenV1Onboarding());

  function setProgress(nextProgress) {
    const normalizedProgress = normalizeOnboardingProgress(nextProgress);

    progressRef.current = normalizedProgress;
    setOnboardingProgress(normalizedProgress);

    return normalizedProgress;
  }

  function applyAction(action) {
    const result = getActionResult(progressRef.current, action);

    setProgress(result.progress);

    return result;
  }

  function applyActionAndNavigate(action) {
    const result = getActionResult(progressRef.current, action);

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
    return applyAction(ONBOARDING_ACTIONS.moveStarted);
  }

  function markMoveVerified() {
    return applyAction(ONBOARDING_ACTIONS.moveVerified);
  }

  function markPlayStarted() {
    return applyAction(ONBOARDING_ACTIONS.playStarted);
  }

  function markPlayCompleted() {
    return applyAction(ONBOARDING_ACTIONS.playCompleted);
  }

  function finishMoveAndGoNext() {
    return applyActionAndNavigate(ONBOARDING_ACTIONS.moveStarted);
  }

  function verifyMoveAndGoNext() {
    return applyActionAndNavigate(ONBOARDING_ACTIONS.moveVerified);
  }

  function finishPlayAndGoNext() {
    return applyActionAndNavigate(ONBOARDING_ACTIONS.playCompleted);
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
    moveVerified: onboardingProgress.moveVerified,
    playStarted: onboardingProgress.playStarted,
    playCompleted: onboardingProgress.playCompleted,

    startFromWelcome,

    goToRoot,
    goToMove,
    goToPlay,
    goToDashboard,
    goToSignupGate,
    goToLearnMore,

    markMoveStarted,
    markMoveVerified,
    markPlayStarted,
    markPlayCompleted,

    finishMoveAndGoNext,
    verifyMoveAndGoNext,
    finishPlayAndGoNext,

    canEnterSignupGate,
    getSignupGateFallback,
    markSeenAndGo,
  };
}