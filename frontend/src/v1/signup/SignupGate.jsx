import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const VOICE_DURATION_MS = 2600;
const RESPONSE_DURATION_MS = 1800;
const TRANSITION_GAP_MS = 240;

function GradientZPts({ value }) {
  return (
    <span className="bg-gradient-to-r from-lime-200 via-cyan-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(45,212,191,0.35)]">
      {value} zPts
    </span>
  );
}

function VoiceScreen({ children }) {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7 text-center"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.32 }}
    >
      <div className="flex max-w-[320px] flex-col items-center justify-center gap-3 text-[1.45rem] font-medium leading-[1.18] tracking-[-0.03em] text-white/96">
        {children}
      </div>
    </motion.div>
  );
}

function ChoiceScreen({ onYes, onNotNow }) {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24 }}
    >
      <div className="flex w-full max-w-[330px] flex-col items-center gap-4">
        <motion.button
          type="button"
          onClick={onYes}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-[22px] border border-cyan-400/30 bg-cyan-400/[0.12] px-6 py-4 text-[1.05rem] font-semibold text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.14)]"
        >
          Keep Earning
        </motion.button>

        <motion.button
          type="button"
          onClick={onNotNow}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-[22px] border border-white/10 bg-white/[0.05] px-6 py-4 text-[1.05rem] font-semibold text-white/75"
        >
          Not Now
        </motion.button>
      </div>
    </motion.div>
  );
}

function ExitScreen({ onDone }) {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex w-full max-w-[320px] flex-col items-center justify-center gap-6">
        <div className="text-[2rem] font-semibold tracking-[-0.05em] text-cyan-300 drop-shadow-[0_0_24px_rgba(34,211,238,0.18)]">
          ZWAP!
        </div>

        <div className="text-[1.15rem] font-medium leading-[1.25] tracking-[-0.025em] text-white/88">
          We’ll be here when you’re ready.
        </div>

        <button
          type="button"
          onClick={onDone}
          className="rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/72"
        >
          Done
        </button>
      </div>
    </motion.div>
  );
}

export default function SignupGate({
  hasTriedMove,
  hasTriedPlay,
  onBeginAuth,
  onExitOnboarding,
}) {
  // HARD GUARD — this screen should never exist otherwise
  if (!hasTriedMove || !hasTriedPlay) {
    return null;
  }

  const [phase, setPhase] = useState("voice");
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (phase === "voice") {
      timeoutRef.current = setTimeout(() => {
        setPhase("choice");
      }, VOICE_DURATION_MS + TRANSITION_GAP_MS);
    }

    if (phase === "response_yes") {
      timeoutRef.current = setTimeout(() => {
        onBeginAuth?.();
      }, RESPONSE_DURATION_MS + TRANSITION_GAP_MS);
    }

    if (phase === "response_no") {
      timeoutRef.current = setTimeout(() => {
        setPhase("exit");
      }, RESPONSE_DURATION_MS + TRANSITION_GAP_MS);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [phase, onBeginAuth]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_60%)]" />

      <div className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {phase === "voice" && (
            <VoiceScreen key="voice">
              <div>
                You earned <GradientZPts value={100} />
              </div>
              <div>Would you like to keep earning?</div>
            </VoiceScreen>
          )}

          {phase === "choice" && (
            <ChoiceScreen
              key="choice"
              onYes={() => setPhase("response_yes")}
              onNotNow={() => setPhase("response_no")}
            />
          )}

          {phase === "response_yes" && (
            <VoiceScreen key="yes">
              <div>Let’s keep going.</div>
            </VoiceScreen>
          )}

          {phase === "response_no" && (
            <VoiceScreen key="no">
              <div>No pressure.</div>
            </VoiceScreen>
          )}

          {phase === "exit" && (
            <ExitScreen
              key="exit"
              onDone={onExitOnboarding}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}