import React from "react";
import { AnimatePresence } from "framer-motion";

import useAboutOnboardingMachine from "./useAboutOnboardingMachine";

import {
  AboutShell,
  VoiceView,
  ActionProofView,
  ShopProofView,
  CoinProofView,
} from "./AboutOnboardingViews";

export default function OnboardingAboutPage({ onComplete }) {
  const { currentStep } = useAboutOnboardingMachine({ onComplete });

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
      </AnimatePresence>
    </AboutShell>
  );
}