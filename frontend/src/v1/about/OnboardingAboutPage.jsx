import React from "react";
import { AnimatePresence } from "framer-motion";

import useAboutOnboardingMachine from "./useAboutOnboardingMachine";
import {
  AboutShell,
  VoiceView,
  ActionProofView,
  ShopProofView,
  AnchorView,
  FinalContinueView,
} from "./AboutOnboardingViews";

function getVoiceLines(stepId) {
  if (stepId === "voice-1") {
    return ["ZWAP! turns", "simple actions", "into progress."];
  }

  if (stepId === "voice-2") {
    return ["Whether MOVE", "or PLAY...", "ZWAP! keeps the score."];
  }

  if (stepId === "voice-3") {
    return ["Your activity", "becomes zPts."];
  }

  if (stepId === "voice-4") {
    return ["You can spend", "your zPts", "in our SHOP..."];
  }

  if (stepId === "voice-5") {
    return ["Or save your zPts", "and SWAP them later", "for ZWAP! tokens."];
  }

  return [];
}

export default function OnboardingAboutPage({
  hasTriedMove = false,
  hasTriedPlay = false,
  onMove,
  onPlay,
  navigate,
  moveRoute = "/move",
  playRoute = "/play",
}) {
  const { currentStep } = useAboutOnboardingMachine({
    hasTriedMove,
    hasTriedPlay,
  });

  const handleMove = () => {
    if (typeof onMove === "function") {
      onMove();
      return;
    }

    if (typeof navigate === "function") {
      navigate(moveRoute);
    }
  };

  const handlePlay = () => {
    if (typeof onPlay === "function") {
      onPlay();
      return;
    }

    if (typeof navigate === "function") {
      navigate(playRoute);
    }
  };

  return (
    <AboutShell>
      <AnimatePresence mode="wait">
        {currentStep.type === "voice" && (
          <VoiceView
            key={currentStep.id}
            lines={getVoiceLines(currentStep.id)}
          />
        )}

        {currentStep.type === "proof-actions" && (
          <ActionProofView key={currentStep.id} />
        )}

        {currentStep.type === "proof-shop" && (
          <ShopProofView key={currentStep.id} />
        )}

        {currentStep.type === "anchor" && <AnchorView key={currentStep.id} />}

        {currentStep.type === "final" && (
          <FinalContinueView
            key={currentStep.id}
            hasTriedMove={hasTriedMove}
            hasTriedPlay={hasTriedPlay}
            onMove={handleMove}
            onPlay={handlePlay}
          />
        )}
      </AnimatePresence>
    </AboutShell>
  );
}