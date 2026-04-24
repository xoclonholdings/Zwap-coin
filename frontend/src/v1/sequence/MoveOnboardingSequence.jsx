import React, { useMemo } from "react";
import { AnimatePresence } from "framer-motion";

import useMoveOnboardingMachine from "./useMoveOnboardingMachine";
import { VoiceView, CounterView, RingView } from "./MoveOnboardingViews";

const STEPS_PER_ZPT = 40;

export default function MoveOnboardingSequence({
  totalSteps = 0,
  onStartTracking,
}) {
  const {
    mode,
    voice,
    showVoice,
    isTracking,
    startTracking,
  } = useMoveOnboardingMachine({
    totalSteps,
    onStartTracking,
  });

  // 🔒 Controlled mock progression
  const displayedSteps = useMemo(() => {
    return Math.min(totalSteps, 120); // realistic onboarding cap
  }, [totalSteps]);

  const displayedZpts = useMemo(() => {
    return Math.floor(displayedSteps / STEPS_PER_ZPT);
  }, [displayedSteps]);

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-black text-white overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.12),_transparent_60%)]" />

      {/* VOICE */}
      <AnimatePresence mode="wait">
        {showVoice && (
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2 px-6 w-full max-w-[340px]">
            <VoiceView text={voice} />
          </div>
        )}
      </AnimatePresence>

      {/* COUNTER */}
      {!showVoice && isTracking && (
        <CounterView
          steps={displayedSteps}
          zpts={displayedZpts}
        />
      )}

      {/* RING */}
      {!showVoice && (
        <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2">
          <RingView
            isTracking={isTracking}
            onStart={startTracking}
          />
        </div>
      )}
    </div>
  );
}