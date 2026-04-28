import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

export default function useAboutOnboardingMachine({
  hasTriedMove = false,
  hasTriedPlay = false,
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const currentStep = STEPS[stepIndex] ?? STEPS[0];
  const isFinal = currentStep.id === "final";

  const nextTarget = useMemo(() => {
    if (!hasTriedMove) return "move";
    if (!hasTriedPlay) return "play";
    return "signup";
  }, [hasTriedMove, hasTriedPlay]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goNext = useCallback(() => {
    clearTimer();

    setStepIndex((prev) => {
      const next = prev + 1;
      return next >= STEPS.length ? prev : next;
    });
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsPaused(true);
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      if (!prev) clearTimer();
      return !prev;
    });
  }, [clearTimer]);

  const restart = useCallback(() => {
    clearTimer();
    setIsPaused(false);
    setStepIndex(0);
  }, [clearTimer]);

  useEffect(() => {
    clearTimer();

    if (isPaused) return undefined;
    if (isFinal) return undefined;

    timerRef.current = setTimeout(() => {
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
    nextTarget,
    goNext,
    pause,
    resume,
    togglePause,
    restart,
  };
}
