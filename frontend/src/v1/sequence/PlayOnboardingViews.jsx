import { motion } from "framer-motion";

import OnboardingActionButton from "@/v1/onboarding/OnboardingActionButton";
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

export function PlayRewardView({ amount = 50 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.55 }}
      className="rounded-[28px] border border-cyan-300/15 bg-white/[0.06] px-8 py-6 text-center shadow-[0_0_42px_rgba(34,211,238,0.16)] backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.96 }}
        animate={{ scale: [0.96, 1.06, 1] }}
        transition={{ duration: 0.42 }}
        className="text-4xl font-black tracking-[-0.05em] text-cyan-300"
      >
        +{amount} zPts
      </motion.div>
    </motion.div>
  );
}

export function PlayMoveOfferView({ onTryMove, onLearnMore }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.65 }}
      className="flex w-full max-w-[320px] flex-col items-center gap-5"
    >
      <OnboardingActionButton type="move" onClick={onTryMove} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.75, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="text-sm font-bold text-white/55"
      >
        Or
      </motion.div>

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 0.4, delay: 0.32 }}
        className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.08em] text-white/70 transition active:scale-[0.97]"
        onClick={onLearnMore}
      >
        Learn More
      </motion.button>
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