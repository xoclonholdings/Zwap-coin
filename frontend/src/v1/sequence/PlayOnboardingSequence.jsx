import React from "react";
import { AnimatePresence } from "framer-motion";

import StackzGame from "@/v1/components/games/stackz/StackzGame";

import usePlayOnboardingMachine from "./usePlayOnboardingMachine";
import {
  PlayShell,
  PlayVoiceView,
  PlayRewardView,
  PlayGameStage,
} from "./PlayOnboardingViews";

export default function PlayOnboardingSequence({
  triedMove = false,
  onComplete,
  stackzLevel = 1,
  stackzRound = 1,
}) {
  const { phase, voice, showVoice, handleGameEnd } = usePlayOnboardingMachine({
    triedMove,
    onComplete,
  });

  return (
    <AnimatePresence mode="wait">
      {showVoice && (
        <PlayShell key={`voice-${phase}`}>
          <PlayVoiceView text={voice} />
        </PlayShell>
      )}

      {!showVoice && phase === "game" && (
        <PlayGameStage key="play-game">
          <StackzGame
            isPlaying={true}
            level={stackzLevel}
            round={stackzRound}
            onGameEnd={handleGameEnd}
          />
        </PlayGameStage>
      )}

      {!showVoice && phase === "reward" && (
        <PlayShell key="play-reward">
          <PlayRewardView amount={50} />
        </PlayShell>
      )}
    </AnimatePresence>
  );
}