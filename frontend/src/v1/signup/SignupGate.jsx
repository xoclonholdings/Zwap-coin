import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const VOICE_DURATION_MS = 2600;
const RESPONSE_DURATION_MS = 1600;
const TRANSITION_GAP_MS = 240;

function renderLine(line) {
  const parts = String(line).split(/(100 zPts|ZWAP!|Keep Earning|Not Now)/g);

  return parts.map((part, index) => {
    if (part === "100 zPts") {
      return (
        <span
          key={`${part}-${index}`}
          className="bg-gradient-to-r from-lime-200 via-cyan-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(45,212,191,0.35)]"
        >
          100 zPts
        </span>
      );
    }

    if (part === "ZWAP!") {
      return (
        <span
          key={`${part}-${index}`}
          className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
        >
          ZWAP!
        </span>
      );
    }

    if (part === "Keep Earning") {
      return (
        <span
          key={`${part}-${index}`}
          className="text-cyan-300 drop-shadow-[0_0_16px_rgba(34,211,238,0.35)]"
        >
          Keep Earning
        </span>
      );
    }

    if (part === "Not Now") {
      return (
        <span
          key={`${part}-${index}`}
          className="text-white/70"
        >
          Not Now
        </span>
      );
    }

    return part;
  });
}

function Shell({ children }) {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(8,10,22,0.96)_58%,_rgba(0,0,0,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(180,134,255,0.08),_transparent_35%,_rgba(34,211,238,0.08))]" />

      <div className="absolute left-1/2 top-1/2 h-[560px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[42px] border border-cyan-300/10 bg-white/[0.025] shadow-[0_0_90px_rgba(34,211,238,0.22)]" />

      <div className="relative z-10 flex min-h-[560px] w-full max-w-[460px] flex-col items-center justify-center px-10 text-center">
        {children}
      </div>
    </div>
  );
}

function VoiceView({ lines }) {
  return (
    <motion.div
      key={lines.join("-")}
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
      transition={{ duration: 0.65 }}
      className="flex max-w-[320px] flex-col items-center gap-3"
    >
      {lines.map((line) => (
        <div
          key={line}
          className="text-center text-[2.15rem] font-black leading-[1.03] tracking-[-0.065em] text-white"
        >
          {renderLine(line)}
        </div>
      ))}
    </motion.div>
  );
}

function PremiumChoiceButton({
  variant = "primary",
  children,
  eyebrow,
  onClick,
}) {
  const isPrimary = variant === "primary";

  const shellClass = isPrimary
    ? "border-cyan-300/45 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.24),rgba(34,211,238,0.12)_42%,rgba(8,12,24,0.9)_100%)] text-cyan-50 shadow-[0_0_32px_rgba(34,211,238,0.28),inset_0_1px_0_rgba(255,255,255,0.16)]"
    : "border-white/12 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(255,255,255,0.045)_42%,rgba(8,10,18,0.86)_100%)] text-white/76 shadow-[0_0_24px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.10)]";

  const glowClass = isPrimary
    ? "from-cyan-200/0 via-cyan-200/45 to-cyan-200/0"
    : "from-white/0 via-white/20 to-white/0";

  const dotClass = isPrimary
    ? "bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.75)]"
    : "bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.35)]";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.965 }}
      onClick={onClick}
      className={[
        "group relative flex-1 overflow-hidden rounded-[24px] border px-4 py-4 text-left transition active:scale-[0.965]",
        shellClass,
      ].join(" ")}
    >
      <motion.div
        aria-hidden="true"
        className={`pointer-events-none absolute left-[-35%] top-0 h-full w-[45%] bg-gradient-to-r ${glowClass} blur-md`}
        animate={{ x: ["0%", "310%", "0%"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex min-h-[54px] flex-col justify-center">
        <div className="mb-1 flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
          <span className="text-[8px] font-black uppercase tracking-[0.22em] text-white/50">
            {eyebrow}
          </span>
        </div>

        <div className="text-[1.03rem] font-black leading-none tracking-[-0.055em] text-white">
          {children}
        </div>
      </div>
    </motion.button>
  );
}

function ChoiceView({ onKeepEarning, onNotNow }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
      transition={{ duration: 0.6 }}
      className="flex w-full max-w-[320px] flex-col items-center gap-5"
    >
      <div className="flex max-w-[300px] flex-col items-center gap-2">
        <div className="text-center text-[2.05rem] font-black leading-[1.03] tracking-[-0.065em] text-white">
          Keep earning?
        </div>

        <div className="text-center text-sm font-bold leading-relaxed tracking-[-0.02em] text-white/55">
          Sign up to save your progress.
        </div>
      </div>

      <div className="flex w-full gap-4">
        <PremiumChoiceButton
          variant="primary"
          eyebrow="SAVE PROGRESS"
          onClick={onKeepEarning}
        >
          Keep Earning
        </PremiumChoiceButton>

        <PremiumChoiceButton
          variant="secondary"
          eyebrow="EXIT"
          onClick={onNotNow}
        >
          Not Now
        </PremiumChoiceButton>
      </div>
    </motion.div>
  );
}

function ExitView({ onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.65 }}
      className="flex max-w-[320px] flex-col items-center gap-5"
    >
      <div className="text-3xl font-black tracking-[-0.06em]">
        {renderLine("ZWAP!")}
      </div>

      <div className="max-w-[260px] text-lg font-black leading-[1.12] tracking-[-0.04em] text-white/85">
        We’ll be here when you’re ready.
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={onDone}
        className="rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-bold text-white/70 shadow-[0_0_18px_rgba(255,255,255,0.05)]"
      >
        Done
      </motion.button>
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
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

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

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [phase, onBeginAuth]);

  if (!hasTriedMove || !hasTriedPlay) return null;

  return (
    <Shell>
      <AnimatePresence mode="wait">
        {phase === "voice" && (
          <VoiceView
            key="voice"
            lines={["You earned 100 zPts.", "Would you like to keep earning?"]}
          />
        )}

        {phase === "choice" && (
          <ChoiceView
            key="choice"
            onKeepEarning={() => setPhase("response_yes")}
            onNotNow={() => setPhase("response_no")}
          />
        )}

        {phase === "response_yes" && (
          <VoiceView key="yes" lines={["Let’s keep going."]} />
        )}

        {phase === "response_no" && (
          <VoiceView key="no" lines={["No pressure."]} />
        )}

        {phase === "exit" && <ExitView key="exit" onDone={onExitOnboarding} />}
      </AnimatePresence>
    </Shell>
  );
}