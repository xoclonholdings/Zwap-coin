import React, { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";

import StackzOnboardingGame from "@/v1/components/games/stackz/StackzOnboardingGame";

import usePlayOnboardingMachine from "./usePlayOnboardingMachine";
import {
  PlayShell,
  PlayVoiceView,
  PlayCompleteView,
  PlayGameStage,
} from "./PlayOnboardingViews";

export default function PlayOnboardingSequence({
  onStartPlay,
  onComplete,
  stackzLevel = 1,
}) {
  const completedRef = useRef(false);

  const { phase, voice, showVoice, handleGameEnd } =
    usePlayOnboardingMachine();

  useEffect(() => {
    if (phase !== "game") return;

    onStartPlay?.();
  }, [phase, onStartPlay]);

  useEffect(() => {
    if (phase !== "complete") return;
    if (completedRef.current) return;

    completedRef.current = true;

    onComplete?.({
      playStarted: true,
      playCompleted: true,
    });
  }, [phase, onComplete]);

  return (
    <AnimatePresence mode="wait">
      {showVoice && (
        <PlayShell key={`voice-${phase}`}>
          <PlayVoiceView text={voice} />
        </PlayShell>
      )}

      {!showVoice && phase === "game" && (
        <PlayGameStage key="play-game">
          <StackzOnboardingGame
            isPlaying={true}
            level={stackzLevel}
            round={1}
            onGameEnd={handleGameEnd}
          />
        </PlayGameStage>
      )}

      {!showVoice && phase === "complete" && (
        <PlayShell key="play-complete">
          <PlayCompleteView />
        </PlayShell>
      )}
    </AnimatePresence>
  );
}
