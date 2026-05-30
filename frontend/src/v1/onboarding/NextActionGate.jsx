import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import OnboardingShell from "@/v1/onboarding/OnboardingShell";
import OnboardingVoiceText from "@/v1/onboarding/OnboardingVoiceText";
import OnboardingActionButton from "@/v1/onboarding/OnboardingActionButton";

const CONTINUE_SCREENS = [
  ["You earned", "+100 zPts."],
  ["Want to", "keep earning?"],
  ["Save your progress."],
  ["Create your account."],
];

const CONTINUE_SCREEN_HOLD_MS = 1600;

export default function NextActionGate({
  type, // "move" | "play" | "choose" | "continue"
  onMove,
  onPlay,
  onContinue,
}) {
  const [continueScreenIndex, setContinueScreenIndex] = useState(0);

  useEffect(() => {
    if (type !== "continue") {
      setContinueScreenIndex(0);
      return undefined;
    }

    if (continueScreenIndex >= CONTINUE_SCREENS.length - 1) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setContinueScreenIndex((currentIndex) => currentIndex + 1);
    }, CONTINUE_SCREEN_HOLD_MS);

    return () => window.clearTimeout(timer);
  }, [type, continueScreenIndex]);

  if (!type) return null;

  const isContinueFinalScreen =
    type === "continue" &&
    continueScreenIndex === CONTINUE_SCREENS.length - 1;

  return (
    <OnboardingShell>
      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6 }}
        className="flex w-full max-w-[320px] flex-col items-center gap-6"
      >
        {type === "move" && (
          <OnboardingVoiceText
            lines={[
              "Nice… you just earned",
              "+50 zPts.",
              "",
              "That’s how ZWAP! turns",
              "your movement into value.",
              "",
              "Want to try PLAY?",
            ]}
          />
        )}

        {type === "play" && (
          <OnboardingVoiceText lines={["Now try", "PLAY."]} />
        )}

        {type === "choose" && (
          <OnboardingVoiceText lines={["Choose your", "next action."]} />
        )}

        {type === "continue" && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`continue-${continueScreenIndex}`}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
              transition={{ duration: 0.42 }}
            >
              <OnboardingVoiceText
                lines={CONTINUE_SCREENS[continueScreenIndex]}
              />
            </motion.div>
          </AnimatePresence>
        )}

        <div className="flex w-full flex-col items-center gap-4">
          {type === "move" && (
            <>
              <OnboardingActionButton type="play" onClick={onPlay} />

              <button
                type="button"
                onClick={onMove}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.08em] text-white/70 transition active:scale-[0.97]"
              >
                Learn More
              </button>
            </>
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

          {isContinueFinalScreen && (
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