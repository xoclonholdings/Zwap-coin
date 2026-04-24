import React, { useMemo } from "react";
import { AnimatePresence } from "framer-motion";

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

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(8,10,22,0.96)_58%,_rgba(0,0,0,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(180,134,255,0.08),_transparent_35%,_rgba(34,211,238,0.08))]" />

      <div className="absolute left-1/2 top-1/2 h-[560px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[42px] border border-cyan-300/10 bg-white/[0.025] shadow-[0_0_90px_rgba(34,211,238,0.22)]" />

      <div className="relative z-10 flex min-h-[560px] w-full max-w-[460px] flex-col items-center justify-center px-10 text-center">
        <AnimatePresence mode="wait">
          {showVoice && <VoiceView text={voice} />}
        </AnimatePresence>

        {!showVoice && isTracking && (
          <CounterView steps={displayedSteps} zpts={displayedZpts} />
        )}

        {!showVoice && (
          <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2">
            <RingView
              isTracking={isTracking}
              onStart={startTracking}
              progressPercent={ringProgressPercent}
            />
          </div>
        )}

        {showPlay && !showVoice && <PlayButton onClick={onTryPlay} />}
      </div>
    </div>
  );
}