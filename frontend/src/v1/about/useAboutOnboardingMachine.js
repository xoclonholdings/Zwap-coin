import { useCallback, useEffect, useRef, useState } from "react";

import { ABOUT_STEPS } from "./AboutOnboardingContent";

const TRANSITION_GAP_MS = 320;

function getStep(index) {
  return ABOUT_STEPS[index] || ABOUT_STEPS[0];
}

function getNextStepIndex(index) {
  return Math.min(index + 1, ABOUT_STEPS.length - 1);
}

export default function useAboutOnboardingMachine({ onComplete } = {}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef(null);
  const completedRef = useRef(false);

  const currentStep = getStep(stepIndex);
  const isFinal = currentStep.id === "final";

  const clearTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const goNext = useCallback(() => {
    clearTimer();
    setStepIndex((previous) => getNextStepIndex(previous));
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPaused(true);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((previous) => !previous);
  }, []);

  const restart = useCallback(() => {
    clearTimer();
    completedRef.current = false;
    setIsPaused(false);
    setStepIndex(0);
  }, [clearTimer]);

  useEffect(() => {
    clearTimer();

    if (isPaused) {
      return () => {
        clearTimer();
      };
    }

    if (isFinal) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }

      return () => {
        clearTimer();
      };
    }

    timerRef.current = setTimeout(() => {
      goNext();
    }, currentStep.duration + TRANSITION_GAP_MS);

    return () => {
      clearTimer();
    };
  }, [currentStep, isPaused, isFinal, goNext, clearTimer, onComplete]);

  return {
    currentStep,
    stepIndex,
    totalSteps: ABOUT_STEPS.length,
    isPaused,
    isFinal,
    goNext,
    pause,
    resume,
    togglePause,
    restart,
  };
}