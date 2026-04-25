import React from "react";
import { AnimatePresence } from "framer-motion";

import useAboutOnboardingMachine from "./useAboutOnboardingMachine";
import {
  AboutShell,
  AboutControls,
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
    return ["Move.", "Play.", "ZWAP! keeps score."];
  }

  if (stepId === "voice-3") {
    return ["Your effort", "becomes zPts."];
  }

  if (stepId === "voice-4") {
    return ["Spend them later", "when the Shop unlocks."];
  }

  return [];
}

function getTargetLabel(nextTarget) {
  if (nextTarget === "move") return "Move";
  if (nextTarget === "play") return "Play";
  return "Continue";
}

export default function OnboardingAboutPage({
  hasTriedMove = false,
  hasTriedPlay = false,
  onMove,
  onPlay,
  onSignupGate,
  navigate,
  moveRoute = "/move",
  playRoute = "/play",
  signupGateRoute = "/signup-gate",
}) {
  const {
    currentStep,
    isPaused,
    isFinal,
    nextTarget,
    goNext,
    togglePause,
  } = useAboutOnboardingMachine({
    hasTriedMove,
    hasTriedPlay,
  });

  const handleContinue = () => {
    if (nextTarget === "move") {
      if (typeof onMove === "function") {
        onMove();
        return;
      }

      if (typeof navigate === "function") {
        navigate(moveRoute);
      }

      return;
    }

    if (nextTarget === "play") {
      if (typeof onPlay === "function") {
        onPlay();
        return;
      }

      if (typeof navigate === "function") {
        navigate(playRoute);
      }

      return;
    }

    if (typeof onSignupGate === "function") {
      onSignupGate();
      return;
    }

    if (typeof navigate === "function") {
      navigate(signupGateRoute);
    }
  };

  return (
    <AboutShell>
      {!isFinal && (
        <AboutControls
          isPaused={isPaused}
          onPause={togglePause}
          onNext={goNext}
        />
      )}

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
            targetLabel={getTargetLabel(nextTarget)}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>
    </AboutShell>
  );
}