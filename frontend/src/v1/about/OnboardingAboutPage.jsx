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
}) {
  const { currentStep } = useAboutOnboardingMachine();

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

        {currentStep.type === "anchor" && (
          <AnchorView key={currentStep.id} />
        )}

        {currentStep.type === "final" && (
          <FinalContinueView
            key={currentStep.id}
            progress={{
              move: hasTriedMove,
              play: hasTriedPlay,
            }}
            onMove={onMove}
            onPlay={onPlay}
          />
        )}
      </AnimatePresence>
    </AboutShell>
  );
}