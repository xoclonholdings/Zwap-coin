import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingSequence({ onSelect }) {
  const [phase, setPhase] = useState(0);
  const [skipped, setSkipped] = useState(false);

  // PHASE TIMELINE
  useEffect(() => {
    if (skipped) return;

    const timers = [
      setTimeout(() => setPhase(1), 1100),  // "You made it..."
      setTimeout(() => setPhase(2), 2500),  // Welcome
      setTimeout(() => setPhase(3), 4300),  // Let's get started
      setTimeout(() => setPhase(4), 5900),  // Buttons
    ];

    return () => timers.forEach(clearTimeout);
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
          {phase === 0 && !skipped && (
            <motion.div
              key="hey"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xl"
            >
              Hey…
            </motion.div>
          )}

          {phase === 1 && !skipped && (
            <motion.div
              key="you-made-it"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xl"
            >
              You made it...
            </motion.div>
          )}

          {phase === 2 && !skipped && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="text-2xl font-semibold">
                Welcome to ZWAP
              </div>

              <motion.div
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-cyan-400 text-lg"
              >
                ZWAP
              </motion.div>
            </motion.div>
          )}

          {phase === 3 && !skipped && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-xl"
            >
              Let’s get you started.
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTION AREA */}
        {(phase === 4 || skipped) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 mt-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* BUTTONS */}
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

            {/* OR... */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ duration: 0.22, delay: 0.12 }}
              className="text-sm"
            >
              Or...
            </motion.div>

            {/* LEARN MORE */}
            <motion.button
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 0.6, filter: "blur(0px)" }}
              transition={{ duration: 0.2, delay: 0.22 }}
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
