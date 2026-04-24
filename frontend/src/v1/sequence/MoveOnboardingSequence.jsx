import React, { useMemo } from "react";
import { AnimatePresence } from "framer-motion";

import useMoveOnboardingMachine from "./useMoveOnboardingMachine";
import {
  VoiceView,
  CounterView,
  RingView,
  PlayButton,
} from "./MoveOnboardingViews";

// 🔒 LOCKED SCORING
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
}) {
  const {
    voice,
    showVoice,
    isTracking,
    startTracking,
    showPlay,
  } = useMoveOnboardingMachine({
    totalSteps,
    onStartTracking,
  });

  // ONLY count after start
  const displayedSteps = useMemo(() => {
    return isTracking ? Math.min(totalSteps, 20) : 0;
  }, [totalSteps, isTracking]);

  const displayedZpts = useMemo(() => {
    return getZpts(displayedSteps);
  }, [displayedSteps]);

  return (
    <div className="relative h-screen w-full bg-black text-white flex items-center justify-center">

      {/* BG */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(34,211,238,0.12),_transparent_60%)]" />

      {/* VOICE */}
      <AnimatePresence mode="wait">
        {showVoice && (
          <div className="absolute top-[30%] w-full px-6">
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
        <div className="absolute bottom-[18%]">
          <RingView
            isTracking={isTracking}
            onStart={startTracking}
          />
        </div>
      )}

      {/* PLAY */}
      {showPlay && !showVoice && (
        <PlayButton onClick={onTryPlay} />
      )}
    </div>
  );
}