import { useCallback, useEffect, useRef, useState } from "react";

const TRANSITION_GAP_MS = 320;

const STEPS = [
  { id: "voice-1", type: "voice", duration: 3100 },
  { id: "voice-2", type: "voice", duration: 3100 },
  { id: "proof-1", type: "proof-actions", duration: 3500 },
  { id: "voice-3", type: "voice", duration: 3000 },
  { id: "voice-4", type: "voice", duration: 3200 },
  { id: "proof-2", type: "proof-shop", duration: 3700 },
  { id: "voice-5", type: "voice", duration: 3600 },
  { id: "anchor", type: "anchor", duration: 2900 },
  { id: "final", type: "final", duration: 0 },
];

function getStep(index) {
  return STEPS[index] || STEPS[0];
}

function getNextStepIndex(index) {
  return Math.min(index + 1, STEPS.length - 1);
}

function shouldHoldStep({ isPaused, isFinal }) {
  return Boolean(isPaused || isFinal);
}

export default function useAboutOnboardingMachine() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef(null);

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
    setIsPaused(false);
    setStepIndex(0);
  }, [clearTimer]);

  useEffect(() => {
    clearTimer();

    const holdStep = shouldHoldStep({
      isPaused,
      isFinal,
    });

    timerRef.current = holdStep
      ? null
      : setTimeout(() => {
          goNext();
        }, currentStep.duration + TRANSITION_GAP_MS);

    return () => {
      clearTimer();
    };
  }, [currentStep, isPaused, isFinal, goNext, clearTimer]);

  return {
    currentStep,
    stepIndex,
    totalSteps: STEPS.length,
    isPaused,
    isFinal,
    goNext,
    pause,
    resume,
    togglePause,
    restart,
  };
}