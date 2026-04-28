import React from "react";
import { AnimatePresence } from "framer-motion";

import StackzOnboardingGame from "@/v1/components/games/stackz/StackzOnboardingGame";

import usePlayOnboardingMachine from "./usePlayOnboardingMachine";
import {
  PlayShell,
  PlayVoiceView,
  PlayRewardView,
  PlayGameStage,
  PlayMoveOfferView,
} from "./PlayOnboardingViews";

export default function PlayOnboardingSequence({
  triedMove = false,
  onComplete,
  onLearnMore,
  stackzLevel = 1,
}) {
  const { phase, voice, showVoice, handleGameEnd, handleTryMove } =
    usePlayOnboardingMachine({
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
          <StackzOnboardingGame
            isPlaying={true}
            level={stackzLevel}
            round={1}
            onGameEnd={handleGameEnd}
          />
        </PlayGameStage>
      )}

      {!showVoice && phase === "reward" && (
        <PlayShell key="play-reward">
          <PlayRewardView amount={50} />
        </PlayShell>
      )}

      {!showVoice && phase === "move-offer" && (
        <PlayShell key="move-offer">
          <PlayMoveOfferView
            onTryMove={handleTryMove}
            onLearnMore={onLearnMore}
          />
        </PlayShell>
      )}
    </AnimatePresence>
  );
}
