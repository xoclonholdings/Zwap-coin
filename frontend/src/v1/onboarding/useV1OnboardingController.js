import { useRef, useState } from "react";

import {
  hasSeenV1Onboarding,
  markV1OnboardingSeen,
} from "@/v1/V1OnboardingStorage";

import {
  getActionCompletionResult,
  getWelcomeStartResult,
} from "@/v1/onboarding/onboardingFlow";

import {
  canShowSignupGate,
  getSignupGateFallbackRoute,
} from "@/v1/onboarding/signupGateFlow";

export default function useV1OnboardingController({ navigate }) {
  const progressRef = useRef({ move: false, play: false });

  const [onboardingProgress, setOnboardingProgress] = useState({
    move: false,
    play: false,
  });

  const [onboardingSeen] = useState(() => hasSeenV1Onboarding());

  function setProgress(nextProgress) {
    const normalizedProgress = {
      move: Boolean(nextProgress?.move),
      play: Boolean(nextProgress?.play),
    };

    progressRef.current = normalizedProgress;
    setOnboardingProgress(normalizedProgress);

    return normalizedProgress;
  }

  function startFromWelcome(target) {
    const result = getWelcomeStartResult(target);
    setProgress(result.progress);
    navigate(result.route);
  }

  function completeActionAndGoNext(action) {
    const result = getActionCompletionResult(progressRef.current, action);
    setProgress(result.progress);

    if (result.route) {
      navigate(result.route);
    }

    return result;
  }

  function goToLearnMoreAfterAction(action, route) {
    const result = getActionCompletionResult(progressRef.current, action);
    setProgress(result.progress);
    navigate(route);
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

    triedMove: onboardingProgress.move,
    triedPlay: onboardingProgress.play,

    startFromWelcome,
    completeActionAndGoNext,
    goToLearnMoreAfterAction,
    canEnterSignupGate,
    getSignupGateFallback,
    markSeenAndGo,
  };
}