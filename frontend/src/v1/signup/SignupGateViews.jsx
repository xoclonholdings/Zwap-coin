import React from "react";
import { motion } from "framer-motion";

import OnboardingActionButton from "@/v1/onboarding/OnboardingActionButton";
import OnboardingShell from "@/v1/onboarding/OnboardingShell";
import OnboardingVoiceText from "@/v1/onboarding/OnboardingVoiceText";

export function SignupGateShell({ children }) {
  return <OnboardingShell>{children}</OnboardingShell>;
}

export function SignupGateVoiceView({ lines }) {
  return (
    <motion.div
      key={lines.join("-")}
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
      transition={{ duration: 0.65 }}
    >
      <OnboardingVoiceText lines={lines} />
    </motion.div>
  );
}

export function SignupGateChoiceView({ onKeepEarning, onNotNow }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.6 }}
      className="flex w-full max-w-[320px] flex-col items-center gap-5"
    >
      <OnboardingVoiceText
        lines={["Keep earning?", "Sign up to save your progress."]}
      />

      <div className="flex w-full gap-4">
        <OnboardingActionButton
          type="save"
          label="Keep Earning"
          eyebrow="SAVE PROGRESS"
          onClick={onKeepEarning}
        />

        <OnboardingActionButton
          type="secondary"
          label="Not Now"
          eyebrow="EXIT"
          onClick={onNotNow}
        />
      </div>
    </motion.div>
  );
}

export function SignupGateExitView({ onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.65 }}
      className="flex max-w-[320px] flex-col items-center gap-5"
    >
      <OnboardingVoiceText
        lines={["ZWAP!", "We’ll be here when you’re ready."]}
      />

      <button
        type="button"
        onClick={onDone}
        className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-bold text-white/70 shadow-[0_0_18px_rgba(255,255,255,0.05)] transition active:scale-[0.96]"
      >
        Done
      </button>
    </motion.div>
  );
}
