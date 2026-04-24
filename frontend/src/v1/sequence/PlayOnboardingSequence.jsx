import React from "react";
import { AnimatePresence } from "framer-motion";

import StackzOnboardingGame from "@/v1/components/games/stackz/StackzOnboardingGame";

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
  const { phase, voice, showVoice, handleGameEnd } =
    usePlayOnboardingMachine({
      triedMove,
      onComplete,
    });

  return (
    <AnimatePresence mode="wait">
      {/* VOICE */}
      {showVoice && (
        <PlayShell key={`voice-${phase}`}>
          <PlayVoiceView text={voice} />
        </PlayShell>
      )}

      {/* GAME (FULLSCREEN) */}
      {!showVoice && phase === "game" && (
        <PlayGameStage key="play-game">
          <StackzOnboardingGame
            isPlaying={true}
            level={stackzLevel}
            round={1} // 🔒 FORCE ONE ROUND
            onGameEnd={handleGameEnd}
          />
        </PlayGameStage>
      )}

      {/* REWARD */}
      {!showVoice && phase === "reward" && (
        <PlayShell key="play-reward">
          <PlayRewardView amount={50} />
        </PlayShell>
      )}
    </AnimatePresence>
  );
}