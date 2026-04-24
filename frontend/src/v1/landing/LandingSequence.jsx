import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingSequence({ onSelect }) {
  const [phase, setPhase] = useState(null);
  const [skipped, setSkipped] = useState(false);

  // CINEMATIC PHASE TIMELINE
  useEffect(() => {
    if (skipped) return;

    let cancelled = false;
    let timer;

    const wait = (ms) =>
      new Promise((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    const runSequence = async () => {
      // Hey…
      setPhase(0);
      await wait(2100);
      if (cancelled) return;

      setPhase(null);
      await wait(450);
      if (cancelled) return;

      // You made it...
      setPhase(1);
      await wait(1500);
      if (cancelled) return;

      setPhase(null);
      await wait(500);
      if (cancelled) return;

      // Welcome to ZWAP
      setPhase(2);
      await wait(1900);
      if (cancelled) return;

      setPhase(null);
      await wait(550);
      if (cancelled) return;

      // Let’s get you started.
      setPhase(3);
      await wait(1600);
      if (cancelled) return;

      setPhase(null);
      await wait(500);
      if (cancelled) return;

      // Actions
      setPhase(4);
    };

    runSequence();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [skipped]);

  const skip = () => {
    setSkipped(true);
    setPhase(4);
  };

  return (
    <div
      onClick={skip}
      className="relative h-screen w-full flex items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.08),_transparent_60%)]" />

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs font-medium tracking-[0.08em] text-white/40">
        Tap anywhere to skip
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        {/* TEXT SEQUENCE */}
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div
              key="hey"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="text-xl"
            >
              Hey…
            </motion.div>
          )}

          {phase === 1 && (
            <motion.div
              key="you-made-it"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="text-xl"
            >
              You made it...
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="text-2xl font-semibold">Welcome to ZWAP!</div>

              <motion.div
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.45, delay: 0.18 }}
                className="text-cyan-400 text-lg"
              >
                ZWAP!
              </motion.div>
            </motion.div>
          )}

          {phase === 3 && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="text-xl"
            >
              Let’s get you started.
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTION AREA */}
        {phase === 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center gap-4 mt-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect("move")}
                className="px-6 py-3 rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
              >
                Move
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect("play")}
                className="px-6 py-3 rounded-xl border border-purple-400/40 bg-purple-400/10 text-purple-300"
              >
                Play
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ duration: 0.35, delay: 0.18 }}
              className="text-sm"
            >
              Or...
            </motion.div>

            <motion.button
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 0.6, filter: "blur(0px)" }}
              transition={{ duration: 0.35, delay: 0.32 }}
              className="text-sm"
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