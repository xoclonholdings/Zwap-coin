import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import zwapLogo from "../../assets/Zwap_logo_full.png";

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
      await wait(2200);
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
      await wait(1500);
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

      <div className="absolute left-1/2 top-1/2 h-[560px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[42px] border border-cyan-300/10 bg-white/[0.025] shadow-[0_0_90px_rgba(34,211,238,0.22)]" />

      <AnimatePresence>
        {waitingForContinue && !continuing && (
          <motion.div
            key="tap-to-continue"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.58, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.45 }}
            className="absolute bottom-8 left-1/2 z-20 w-[360px] -translate-x-1/2 text-center text-[10px] font-medium tracking-[0.22em] text-white/45"
          >
            TAP TO CONTINUE
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex min-h-[560px] w-full max-w-[460px] flex-col items-center justify-center px-10 text-center">
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
                initial={{ opacity: 0, scale: 0.82, filter: "blur(14px)" }}
                animate={{
                  opacity: 1,
                  scale: [0.98, 1.035, 1],
                  filter: [
                    "blur(0px) drop-shadow(0 0 22px rgba(34,211,238,0.42))",
                    "blur(0px) drop-shadow(0 0 42px rgba(180,134,255,0.42))",
                    "blur(0px) drop-shadow(0 0 30px rgba(34,211,238,0.46))",
                  ],
                }}
                transition={{
                  opacity: { duration: 0.75, delay: 0.15 },
                  scale: {
                    duration: 2.6,
                    delay: 0.15,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  },
                  filter: {
                    duration: 2.6,
                    delay: 0.15,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  },
                }}
                className="relative mb-8 w-48"
              >
                <img src={zwapLogo} alt="ZWAP!" className="w-full" />
              </motion.div>

              <div className="whitespace-nowrap text-3xl font-black tracking-[-0.05em] text-white">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]">
                  ZWAP!
                </span>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.75, y: 0 }}
                transition={{ duration: 0.55, delay: 0.45 }}
                className="mt-4 whitespace-nowrap text-sm font-bold tracking-[0.24em] text-cyan-300"
              >
                MOVE. PLAY. EARN TODAY.
              </motion.div>
            </motion.div>
          )}

          {phase === 3 && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
              transition={{ duration: 0.65 }}
              className="whitespace-nowrap text-4xl font-black tracking-[-0.05em]"
            >
              Let’s get you started.
            </motion.div>
          )}
        </AnimatePresence>

        {phase === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.65 }}
            className="flex w-full flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zwapLogo}
              alt="ZWAP!"
              className="mb-5 w-40 opacity-95 drop-shadow-[0_0_28px_rgba(34,211,238,0.38)]"
            />

            <div className="flex w-full gap-4">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelect("move")}
                className="flex-1 rounded-2xl border border-cyan-300/45 bg-cyan-300/15 px-6 py-4 text-lg font-black text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.16)]"
              >
                Move
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => onSelect("play")}
                className="flex-1 rounded-2xl border border-purple-300/45 bg-purple-400/15 px-6 py-4 text-lg font-black text-purple-100 shadow-[0_0_28px_rgba(180,134,255,0.16)]"
              >
                Play
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.75, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="text-sm font-bold text-white/55"
            >
              Or…
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              transition={{ duration: 0.4, delay: 0.32 }}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold tracking-[0.08em] text-white/70"
              onClick={() => onSelect("learn")}
            >
              Learn More
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}