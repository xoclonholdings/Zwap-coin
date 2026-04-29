import { useRef, useState } from "react";

import {
  hasSeenV1Onboarding,
  markV1OnboardingSeen,
} from "@/v1/V1OnboardingStorage";

import {
  ONBOARDING_ACTIONS,
  getNextOnboardingRoute,
  markOnboardingActionTried,
} from "@/v1/onboarding/onboardingFlow";

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

  function completeAction(action) {
    const nextProgress = markOnboardingActionTried(progressRef.current, action);
    return setProgress(nextProgress);
  }

  function navigateToNext(progress = progressRef.current) {
    navigate(getNextOnboardingRoute(progress));
  }

  function completeMoveAndGoNext() {
    const nextProgress = completeAction(ONBOARDING_ACTIONS.move);
    navigateToNext(nextProgress);
  }

  function completePlayAndGoNext() {
    const nextProgress = completeAction(ONBOARDING_ACTIONS.play);
    navigateToNext(nextProgress);
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

    completeAction,
    navigateToNext,
    completeMoveAndGoNext,
    completePlayAndGoNext,
    markSeenAndGo,
  };
}