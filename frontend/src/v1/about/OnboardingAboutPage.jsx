import React from "react";
import { AnimatePresence } from "framer-motion";

import useAboutOnboardingMachine from "./useAboutOnboardingMachine";
import { getAboutVoiceLines } from "./aboutOnboardingScript";
import {
  AboutShell,
  VoiceView,
  ActionProofView,
  ShopProofView,
  AnchorView,
  FinalContinueView,
} from "./AboutOnboardingViews";

export default function OnboardingAboutPage({
  hasTriedMove = false,
  hasTriedPlay = false,
  onMove,
  onPlay,
  navigate,
  moveRoute = "/move",
  playRoute = "/play",
}) {
  const { currentStep } = useAboutOnboardingMachine();

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
            lines={getAboutVoiceLines(currentStep.id)}
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