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

const MOVE_TARGET_STEPS = 10;
const MOVE_REWARD_ZPTS = 50;

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
    mockSteps,
    elapsedSeconds,
    startTracking,
    stopTracking,
  } = useMoveOnboardingMachine({
    totalSteps,
    onStartTracking,
    onStopTracking,
  });

  const displayedSteps = useMemo(() => {
    return isTracking || mode === "complete" || mode === "done"
      ? Math.min(Number(mockSteps || 0), MOVE_TARGET_STEPS)
      : 0;
  }, [mockSteps, isTracking, mode]);

  const displayedZpts = useMemo(() => {
    return moveVerified ? MOVE_REWARD_ZPTS : 0;
  }, [moveVerified]);

  const ringProgressPercent = useMemo(() => {
    return Math.min((displayedSteps / MOVE_TARGET_STEPS) * 100, 100);
  }, [displayedSteps]);

  const showAction = !showVoice && mode !== "complete" && mode !== "done";

  useEffect(() => {
    if (mode !== "done") return;
    if (completedRef.current) return;

    completedRef.current = true;

    onMoveComplete?.({
      displayedSteps: MOVE_TARGET_STEPS,
      displayedZpts: MOVE_REWARD_ZPTS,
      moveStarted: true,
      moveVerified: true,
    });
  }, [mode, onMoveComplete]);

  useEffect(() => {
    if (!moveVerified) return;

    onMoveMilestone?.({
      displayedSteps: MOVE_TARGET_STEPS,
      displayedZpts: MOVE_REWARD_ZPTS,
      moveStarted: true,
      moveVerified: true,
    });
  }, [moveVerified, onMoveMilestone]);

  return (
    <OnboardingShell>
      <AnimatePresence mode="wait">
        {showVoice && <VoiceView key={voice} text={voice} />}

        {!showVoice && mode === "complete" && (
          <MoveCompleteView key="move-complete" />
        )}
      </AnimatePresence>

      {showAction && (
        <CounterView steps={displayedSteps} elapsedSeconds={elapsedSeconds} />
      )}

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