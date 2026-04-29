import { motion } from "framer-motion";

import OnboardingShell from "@/v1/onboarding/OnboardingShell";
import OnboardingVoiceText from "@/v1/onboarding/OnboardingVoiceText";

export function PlayShell({ children }) {
  return <OnboardingShell>{children}</OnboardingShell>;
}

export function PlayVoiceView({ text }) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
      transition={{ duration: 0.65 }}
    >
      <OnboardingVoiceText lines={[text]} />
    </motion.div>
  );
}

export function PlayCompleteView() {
  return (
    <motion.div
      key="play-complete"
      initial={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(8px)" }}
      transition={{ duration: 0.6 }}
      className="flex max-w-[320px] flex-col items-center gap-4 text-center"
    >
      <OnboardingVoiceText lines={["Play session", "complete."]} />

      <div className="text-sm font-bold leading-relaxed text-white/55">
        Nice. Your round is complete.
      </div>
    </motion.div>
  );
}

export function PlayGameStage({ children }) {
  return (
    <motion.div
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-white"
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative h-full w-full max-w-[460px] overflow-hidden bg-black">
        {children}
      </div>
    </motion.div>
  );
}
