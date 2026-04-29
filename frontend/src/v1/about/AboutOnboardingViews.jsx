import React from "react";
import { motion } from "framer-motion";

import OnboardingActionButton from "@/v1/onboarding/OnboardingActionButton";
import OnboardingShell from "@/v1/onboarding/OnboardingShell";
import OnboardingVoiceText from "@/v1/onboarding/OnboardingVoiceText";
import {
  getAboutAvailableActions,
  getAboutGuidanceLines,
} from "@/v1/onboarding/onboardingFlow";

export function AboutShell({ children }) {
  return <OnboardingShell>{children}</OnboardingShell>;
}

export function VoiceView({ lines }) {
  return (
    <motion.div
      key={lines.join("-")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <OnboardingVoiceText lines={lines} />
    </motion.div>
  );
}

export function ActionProofView() {
  return null;
}

export function ShopProofView() {
  return null;
}

export function AnchorView() {
  return null;
}

export function FinalContinueView({
  hasTriedMove = false,
  hasTriedPlay = false,
  onMove,
  onPlay,
}) {
  const progress = {
    move: hasTriedMove,
    play: hasTriedPlay,
  };

  const lines = getAboutGuidanceLines(progress);
  const { showMove, showPlay } = getAboutAvailableActions(progress);

  if (!lines) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.65 }}
      className="flex w-full max-w-[320px] flex-col items-center gap-5"
    >
      <OnboardingVoiceText lines={lines} />

      {showMove && showPlay && (
        <div className="flex w-full flex-col items-center gap-4">
          <OnboardingActionButton type="move" onClick={onMove} />
          <OnboardingActionButton type="play" onClick={onPlay} />
        </div>
      )}

      {showMove && !showPlay && (
        <OnboardingActionButton type="move" onClick={onMove} />
      )}

      {!showMove && showPlay && (
        <OnboardingActionButton type="play" onClick={onPlay} />
      )}
    </motion.div>
  );
}