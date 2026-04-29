import React from "react";
import { motion } from "framer-motion";

import OnboardingShell from "@/v1/onboarding/OnboardingShell";
import OnboardingVoiceText from "@/v1/onboarding/OnboardingVoiceText";
import OnboardingActionButton from "@/v1/onboarding/OnboardingActionButton";

export default function NextActionGate({
  type, // "move" | "play" | "choose" | "continue"
  onMove,
  onPlay,
  onContinue,
}) {
  if (!type) return null;

  return (
    <OnboardingShell>
      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6 }}
        className="flex w-full max-w-[320px] flex-col items-center gap-6"
      >
        {type === "move" && (
          <OnboardingVoiceText lines={["Now try", "MOVE."]} />
        )}

        {type === "play" && (
          <OnboardingVoiceText lines={["Now try", "PLAY."]} />
        )}

        {type === "choose" && (
          <OnboardingVoiceText lines={["Choose your", "next action."]} />
        )}

        {type === "continue" && (
          <OnboardingVoiceText
            lines={["Save your progress.", "Create your account."]}
          />
        )}

        <div className="flex w-full flex-col items-center gap-4">
          {type === "move" && (
            <OnboardingActionButton type="move" onClick={onMove} />
          )}

          {type === "play" && (
            <OnboardingActionButton type="play" onClick={onPlay} />
          )}

          {type === "choose" && (
            <>
              <OnboardingActionButton type="move" onClick={onMove} />
              <OnboardingActionButton type="play" onClick={onPlay} />
            </>
          )}

          {type === "continue" && (
            <>
              <OnboardingActionButton type="primary" onClick={onContinue} />
              <OnboardingActionButton type="secondary" onClick={onMove} />
            </>
          )}
        </div>
      </motion.div>
    </OnboardingShell>
  );
}