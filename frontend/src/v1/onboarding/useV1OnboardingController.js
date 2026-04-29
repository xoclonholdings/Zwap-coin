import { useRef, useState } from "react";

import {
  hasSeenV1Onboarding,
  markV1OnboardingSeen,
} from "@/v1/V1OnboardingStorage";

import {
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

  function startFromWelcome(target) {
    const result = getLandingTargetResult(target);

    setProgress(result.progress);
    navigate(result.route);

    return result;
  }

  function startActionAndGoNext(action) {
    const result = getActionStartedResult(progressRef.current, action);

    setProgress(result.progress);
    navigate(result.route);

    return result;
  }

  function goToLearnMore() {
    const result = getLearnMoreStartResult(progressRef.current);

    setProgress(result.progress);
    navigate(result.route);

    return result;
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
    startActionAndGoNext,
    goToLearnMore,
    canEnterSignupGate,
    getSignupGateFallback,
    markSeenAndGo,
  };
}