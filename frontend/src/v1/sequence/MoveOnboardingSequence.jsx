import React, { useEffect, useMemo, useRef } from "react";
import { AnimatePresence } from "framer-motion";

import OnboardingShell from "@/v1/onboarding/OnboardingShell";

import useMoveOnboardingMachine from "./useMoveOnboardingMachine";
import {
  VoiceView,
  CounterView,
  RingView,
  MoveCompleteView,
} from "./MoveOnboardingViews";

function getZpts(steps) {
  if (steps >= 20) return 50;
  if (steps >= 15) return 35;
  if (steps >= 10) return 20;
  if (steps >= 5) return 10;
  return 0;
}

export default function MoveOnboardingSequence({
  totalSteps = 0,
  onStartTracking,
  onStopTracking,
  onMoveComplete,
  onMoveMilestone,
}) {
  const completedRef = useRef(false);

  const {
    mode,
    voice,
    showVoice,
    isTracking,
    moveVerified,
    startTracking,
    stopTracking,
  } = useMoveOnboardingMachine({
    totalSteps,
    onStartTracking,
    onStopTracking,
  });

  const displayedSteps = useMemo(() => {
    return isTracking || mode === "complete" || mode === "done"
      ? Math.min(totalSteps, 20)
      : 0;
  }, [totalSteps, isTracking, mode]);

  const displayedZpts = useMemo(() => {
    return moveVerified ? getZpts(displayedSteps) : 0;
  }, [displayedSteps, moveVerified]);

  const ringProgressPercent = useMemo(() => {
    return Math.min((displayedSteps / 20) * 100, 100);
  }, [displayedSteps]);

  const showAction = !showVoice && mode !== "complete" && mode !== "done";

  useEffect(() => {
    if (mode !== "done") return;
    if (completedRef.current) return;

    completedRef.current = true;

    onMoveComplete?.({
      displayedSteps,
      displayedZpts,
      moveStarted: true,
      moveVerified,
    });
  }, [mode, displayedSteps, displayedZpts, moveVerified, onMoveComplete]);

  useEffect(() => {
    if (!moveVerified) return;

    onMoveMilestone?.({
      displayedSteps,
      displayedZpts,
      moveStarted: true,
      moveVerified: true,
    });
  }, [moveVerified, displayedSteps, displayedZpts, onMoveMilestone]);

  return (
    <OnboardingShell>
      <AnimatePresence mode="wait">
        {showVoice && <VoiceView key={voice} text={voice} />}

        {!showVoice && mode === "complete" && (
          <MoveCompleteView key="move-complete" verified={moveVerified} />
        )}
      </AnimatePresence>

      {showAction && <CounterView steps={displayedSteps} zpts={displayedZpts} />}

      {showAction && (
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2">
          <RingView
            isTracking={isTracking}
            onStart={startTracking}
            onStop={stopTracking}
            progressPercent={ringProgressPercent}
          />
        </div>
      )}
    </OnboardingShell>
  );
}
