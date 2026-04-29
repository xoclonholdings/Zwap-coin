import React, { useMemo } from "react";
import { AnimatePresence } from "framer-motion";

import useAboutOnboardingMachine from "./useAboutOnboardingMachine";
import {
  getAboutVoiceLines,
} from "./aboutOnboardingScript";
import {
  getLearnMoreFinalState,
} from "@/v1/onboarding/learnMoreFlow";
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

  const learnMoreFinalState = useMemo(() => {
    return getLearnMoreFinalState({
      move: hasTriedMove,
      play: hasTriedPlay,
    });
  }, [hasTriedMove, hasTriedPlay]);

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
            finalState={learnMoreFinalState}
            onMove={onMove}
            onPlay={onPlay}
          />
        )}
      </AnimatePresence>
    </AboutShell>
  );
}
