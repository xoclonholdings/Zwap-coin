import React, { useMemo } from "react";
import { AnimatePresence } from "framer-motion";

import OnboardingShell from "@/v1/onboarding/OnboardingShell";

import useMoveOnboardingMachine from "./useMoveOnboardingMachine";
import {
  VoiceView,
  CounterView,
  RingView,
  PlayButton,
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
  onTryPlay,
  onLearnMore,
}) {
  const { voice, showVoice, isTracking, startTracking, showPlay } =
    useMoveOnboardingMachine({
      totalSteps,
      onStartTracking,
    });

  const displayedSteps = useMemo(() => {
    return isTracking ? Math.min(totalSteps, 20) : 0;
  }, [totalSteps, isTracking]);

  const displayedZpts = useMemo(() => {
    return getZpts(displayedSteps);
  }, [displayedSteps]);

  const ringProgressPercent = useMemo(() => {
    return Math.min((displayedSteps / 20) * 100, 100);
  }, [displayedSteps]);

  const showAction = !showVoice && !showPlay;

  return (
    <OnboardingShell>
      <AnimatePresence mode="wait">
        {showVoice && <VoiceView text={voice} />}
      </AnimatePresence>

      {showAction && <CounterView steps={displayedSteps} zpts={displayedZpts} />}

      {showAction && (
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2">
          <RingView
            isTracking={isTracking}
            onStart={startTracking}
            progressPercent={ringProgressPercent}
          />
        </div>
      )}

      {showPlay && !showVoice && (
        <PlayButton onClick={onTryPlay} onLearnMore={onLearnMore} />
      )}
    </OnboardingShell>
  );
}