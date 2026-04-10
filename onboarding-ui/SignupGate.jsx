import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const VOICE_DURATION_MS = 1800;
const RESPONSE_DURATION_MS = 1400;
const TRANSITION_GAP_MS = 220;

function VoiceScreen({ lines }) {
  return (
    <motion.div
      className="flex min-h-screen w-full items-center justify-center px-7 text-center"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.32 }}
    >
      <div className="flex max-w-[320px] flex-col items-center justify-center gap-3">
        {lines.map((line) => (
          <div
            key={line}
            className="text-[1.45rem] font-medium leading-[1.18] tracking-[-0.03em] text-white/96"
          >
            {line}
          </div>
        ))}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-[22px] border border-cyan-400/22 bg-cyan-400/[0.10] px-6 py-4 text-[1.03rem] font-semibold tracking-[-0.02em] text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.12)]"
        >
          Yes
        </motion.button>

        <motion.button
          type="button"
          onClick={onNotNow}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.08 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-[22px] border border-violet-400/20 bg-violet-400/[0.10] px-6 py-4 text-[1.03rem] font-semibold tracking-[-0.02em] text-violet-200 shadow-[0_0_28px_rgba(168,85,247,0.10)]"
        >
          Not now
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
        <motion.div
          initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.3 }}
          className="text-[2rem] font-semibold tracking-[-0.05em] text-cyan-300 drop-shadow-[0_0_24px_rgba(34,211,238,0.18)]"
        >
          ZWAP!
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.12 }}
          className="text-[1.15rem] font-medium leading-[1.25] tracking-[-0.025em] text-white/88"
        >
          We’ll be here when you’re ready.
        </motion.div>

        <motion.button
          type="button"
          onClick={onDone}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.72, y: 0 }}
          transition={{ duration: 0.24, delay: 0.22 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-[18px] border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/72"
        >
          Done
        </motion.button>
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
  const [phase, setPhase] = useState("voice");
  const [selection, setSelection] = useState(null);
  const timeoutRef = useRef(null);

  const canRender = hasTriedMove === true && hasTriedPlay === true;

  useEffect(() => {
    if (!canRender) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (phase === "voice") {
      timeoutRef.current = setTimeout(() => {
        setPhase("choice");
      }, VOICE_DURATION_MS + TRANSITION_GAP_MS);
    }

    if (phase === "response_yes") {
      timeoutRef.current = setTimeout(() => {
        if (typeof onBeginAuth === "function") {
          onBeginAuth();
        }
      }, RESPONSE_DURATION_MS + TRANSITION_GAP_MS);
    }

    if (phase === "response_no") {
      timeoutRef.current = setTimeout(() => {
        setPhase("exit");
      }, RESPONSE_DURATION_MS + TRANSITION_GAP_MS);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [phase, canRender, onBeginAuth]);

  if (!canRender) return null;

  const handleYes = () => {
    setSelection("yes");
    setPhase("response_yes");
  };

  const handleNotNow = () => {
    setSelection("no");
    setPhase("response_no");
  };

  const handleDone = () => {
    if (typeof onExitOnboarding === "function") {
      onExitOnboarding();
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_58%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,14,0.40),rgba(0,0,0,0.82))]" />

      <div className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          {phase === "voice" && (
            <VoiceScreen
              key="voice"
              lines={["Want to keep earning?"]}
            />
          )}

          {phase === "choice" && (
            <ChoiceScreen
              key="choice"
              onYes={handleYes}
              onNotNow={handleNotNow}
            />
          )}

          {phase === "response_yes" && selection === "yes" && (
            <VoiceScreen
              key="response_yes"
              lines={["Save your progress."]}
            />
          )}

          {phase === "response_no" && selection === "no" && (
            <VoiceScreen
              key="response_no"
              lines={["No rush.", "We’ll be here when you’re ready."]}
            />
          )}

          {phase === "exit" && (
            <ExitScreen
              key="exit"
              onDone={handleDone}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}