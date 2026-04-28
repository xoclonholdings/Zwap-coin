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
      await wait(1800); // ⬅ slightly slower pacing for readability
      if (cancelled) return;

      setWaitingForContinue(true); // ⬅ stays on SAME screen
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

        {/* 🔻 TAP TO CONTINUE — FIXED */}
        {waitingForContinue && !continuing && (
          <div className="absolute bottom-6 left-0 w-full flex justify-center">
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-cyan-300/50" />
              <div className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/70">
                Tap to Continue
              </div>
              <div className="h-px w-10 bg-cyan-300/50" />
            </div>
          </div>
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
                <motion.img
                  src={zwapLogo}
                  alt="ZWAP!"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{
                    opacity: 1,
                    scale: [1, 1.045, 1],
                  }}
                  transition={{
                    opacity: { duration: 0.6 },
                    scale: {
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className="mb-8 w-48"
                />

                <div className="whitespace-nowrap text-3xl font-black tracking-[-0.05em] text-white">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    ZWAP!
                  </span>
                </div>

                <div className="mt-4 whitespace-nowrap text-sm font-bold tracking-[0.24em] text-cyan-300">
                  MOVE. PLAY. EARN TODAY.
                </div>
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
              <img src={zwapLogo} alt="ZWAP!" className="mb-5 w-40" />

              <div className="flex w-full gap-4">
                <button
                  onClick={() => onSelect("move")}
                  className="flex-1 rounded-2xl border border-cyan-300/45 bg-cyan-300/15 px-6 py-4 text-lg font-black text-cyan-100"
                >
                  Move
                </button>

                <button
                  onClick={() => onSelect("play")}
                  className="flex-1 rounded-2xl border border-purple-300/45 bg-purple-400/15 px-6 py-4 text-lg font-black text-purple-100"
                >
                  Play
                </button>
              </div>

              <div className="text-sm font-bold text-white/55">Or…</div>

              <button
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-bold text-white/70"
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
