import React, { useMemo } from "react";
import { AnimatePresence } from "framer-motion";

import useAboutOnboardingMachine from "./useAboutOnboardingMachine";
import { getLearnMoreFinalState } from "@/v1/onboarding/learnMoreFlow";

import {
  AboutShell,
  VoiceView,
  ActionProofView,
  ShopProofView,
  CoinProofView,
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
      moveStarted: hasTriedMove,
      playCompleted: hasTriedPlay,
    });
  }, [hasTriedMove, hasTriedPlay]);

  return (
    <AboutShell>
      <AnimatePresence mode="wait">
        {currentStep.type === "voice" && (
          <VoiceView key={currentStep.id} lines={currentStep.lines || []} />
        )}

        {currentStep.type === "action-proof" && (
          <ActionProofView key={currentStep.id} />
        )}

        {currentStep.type === "shop-proof" && (
          <ShopProofView key={currentStep.id} />
        )}

        {currentStep.type === "coin-proof" && (
          <CoinProofView key={currentStep.id} />
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