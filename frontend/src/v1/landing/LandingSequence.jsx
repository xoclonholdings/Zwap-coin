import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import zwapLogo from "@/assets/logo/Zwap_logo_full.png";

function OnboardingActionButton({ type = "move", onClick }) {
  const isMove = type === "move";

  const label = isMove ? "Move" : "Play";
  const eyebrow = isMove ? "STEP INTO VALUE" : "ENTER THE ARCADE";

  const shellClass = isMove
    ? "border-cyan-300/45 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.24),rgba(34,211,238,0.12)_42%,rgba(8,12,24,0.9)_100%)] text-cyan-50 shadow-[0_0_32px_rgba(34,211,238,0.28),inset_0_1px_0_rgba(255,255,255,0.16)]"
    : "border-violet-300/45 bg-[radial-gradient(circle_at_top,rgba(216,180,254,0.24),rgba(168,85,247,0.13)_42%,rgba(12,8,24,0.9)_100%)] text-violet-50 shadow-[0_0_32px_rgba(168,85,247,0.28),inset_0_1px_0_rgba(255,255,255,0.16)]";

  const glowClass = isMove
    ? "from-cyan-200/0 via-cyan-200/45 to-cyan-200/0"
    : "from-violet-200/0 via-fuchsia-200/45 to-violet-200/0";

  const dotClass = isMove
    ? "bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.75)]"
    : "bg-violet-200 shadow-[0_0_14px_rgba(168,85,247,0.75)]";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.965 }}
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

        <div className="text-[1.25rem] font-black leading-none tracking-[-0.055em] text-white">
          {label}
        </div>
      </div>
    </motion.button>
  );
}

export default function LandingSequence({ onSelect }) {
  const [phase, setPhase] = useState(null);
  const [waitingForContinue, setWaitingForContinue] = useState(false);
  const [continuing, setContinuing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;

    const wait = (ms) =>
      new Promise((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const runSequence = async () => {
      setPhase(0);
      await wait(1700);
      if (cancelled) return;

      setPhase(null);
      await wait(500);
      if (cancelled) return;

      setPhase(1);
      await wait(1700);
      if (cancelled) return;

      setPhase(null);
      await wait(550);
      if (cancelled) return;

      setPhase(2);
      await wait(1800);
      if (cancelled) return;

      setWaitingForContinue(true);
    };

    runSequence();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!continuing) return;

    let cancelled = false;
    let timer;

    const wait = (ms) =>
      new Promise((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const continueSequence = async () => {
      setWaitingForContinue(false);

      setPhase(null);
      await wait(450);
      if (cancelled) return;

      setPhase(3);
      await wait(1800);
      if (cancelled) return;

      setPhase(null);
      await wait(550);
      if (cancelled) return;

      setPhase(4);
    };

    continueSequence();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [continuing]);

  const handleTap = () => {
    if (phase === 2 && waitingForContinue && !continuing) {
      setContinuing(true);
    }
  };

  return (
    <div
      onClick={handleTap}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(8,10,22,0.96)_58%,_rgba(0,0,0,1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(180,134,255,0.08),_transparent_35%,_rgba(34,211,238,0.08))]" />

      <div className="relative z-10 h-[560px] w-[360px] overflow-hidden rounded-[42px] border border-cyan-300/10 bg-white/[0.025] px-10 text-center shadow-[0_0_90px_rgba(34,211,238,0.22)]">
        {waitingForContinue && !continuing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-6 left-0 flex w-full justify-center"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="h-px w-10 bg-cyan-300/70"
                animate={{ scaleX: [0.6, 1, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />

              <div className="text-[10px] font-semibold uppercase tracking-[0.38em] text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                Tap to Continue
              </div>

              <motion.div
                className="h-px w-10 bg-cyan-300/70"
                animate={{ scaleX: [0.6, 1, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}

        <div className="flex h-full w-full flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div
                key="hey"
                initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
                transition={{ duration: 0.65 }}
                className="text-5xl font-black tracking-[-0.05em]"
              >
                Hey…
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div
                key="you-made-it"
                initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
                transition={{ duration: 0.65 }}
                className="whitespace-nowrap text-4xl font-black tracking-[-0.05em]"
              >
                You made it…
              </motion.div>
            )}

            {phase === 2 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 1.02 }}
                transition={{ duration: 0.7 }}
                className="flex w-full flex-col items-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mb-8 w-48 drop-shadow-[0_0_25px_rgba(34,211,238,0.45)]"
                >
                  <motion.img
                    src={zwapLogo}
                    alt="ZWAP!"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.65,
                    }}
                    className="w-full"
                  />
                </motion.div>

                <div className="whitespace-nowrap text-3xl font-black tracking-[-0.05em] text-white">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    ZWAP!
                  </span>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mt-4 whitespace-nowrap text-sm font-bold tracking-[0.24em] text-cyan-300"
                >
                  MOVE. PLAY. EARN TODAY.
                </motion.div>
              </motion.div>
            )}

            {phase === 3 && (
              <motion.div
                key="start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-4xl font-black"
              >
                Let’s get you started.
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 4 && (
            <div className="flex w-full flex-col items-center gap-5">
              <img
                src={zwapLogo}
                alt="ZWAP!"
                className="mb-5 w-40 opacity-90"
              />

              <div className="flex w-full gap-4">
                <OnboardingActionButton
                  type="move"
                  onClick={() => onSelect("move")}
                />

                <OnboardingActionButton
                  type="play"
                  onClick={() => onSelect("play")}
                />
              </div>

              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-white/60 transition hover:text-white/80 active:scale-[0.97]"
                onClick={() => onSelect("learn")}
              >
                Learn More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}