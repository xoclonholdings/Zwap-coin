import React, { useEffect } from "react";
import { motion } from "framer-motion";

import OnboardingShell from "@/v1/onboarding/OnboardingShell";
import OnboardingVoiceText from "@/v1/onboarding/OnboardingVoiceText";

export const COMPLETION_TYPES = {
  learnMore: "learnMore",
  move: "move",
  play: "play",
};

const COMPLETION_DURATION_MS = 2600;

function RewardAnchor({ label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6 }}
      className="flex w-full max-w-[320px] flex-col items-center gap-5 text-center"
    >
      <div className="text-[0.72rem] font-black uppercase tracking-[0.28em] text-white/45">
        {label}
      </div>

      <div className="rounded-[32px] border border-cyan-300/20 bg-white/[0.06] px-8 py-7 shadow-[0_0_48px_rgba(34,211,238,0.16)] backdrop-blur-md">
        <div className="bg-gradient-to-r from-lime-200 via-cyan-300 to-emerald-300 bg-clip-text text-[3rem] font-black leading-none tracking-[-0.07em] text-transparent drop-shadow-[0_0_22px_rgba(45,212,191,0.32)]">
          +50
        </div>

        <div className="mt-2 text-[0.74rem] font-black uppercase tracking-[0.26em] text-white/45">
          zPts
        </div>
      </div>
    </motion.div>
  );
}

function NeutralMoveAnchor() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6 }}
      className="flex w-full max-w-[320px] flex-col items-center text-center"
    >
      <OnboardingVoiceText lines={["MOVE is ready", "when you are."]} />
    </motion.div>
  );
}

export default function CompletionFlow({
  type,
  moveStarted = false,
  onComplete,
}) {
  useEffect(() => {
    if (!type) return undefined;

    const timer = window.setTimeout(() => {
      onComplete?.();
    }, COMPLETION_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [type, onComplete]);

  if (!type) return null;

  return (
    <OnboardingShell>
      {type === COMPLETION_TYPES.learnMore && (
        <OnboardingVoiceText lines={["Ready to earn?"]} />
      )}

      {type === COMPLETION_TYPES.move && moveStarted && (
        <RewardAnchor label="MOVE COMPLETE" />
      )}

      {type === COMPLETION_TYPES.move && !moveStarted && <NeutralMoveAnchor />}

      {type === COMPLETION_TYPES.play && <RewardAnchor label="PLAY COMPLETE" />}
    </OnboardingShell>
  );
}