import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ZWAP_LOGO } from "@/App";

export default function SplashScreen({
  onNewUser,
  onReturningUser,
  onWhatIsZwap,
}) {
  const [stage, setStage] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [taglineComplete, setTaglineComplete] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("zwap_splash_shown");
    if (shown) {
      onReturningUser?.();
      return;
    }

    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1300),
      setTimeout(() => setStage(3), 2100),
      setTimeout(() => setStage(4), 3000),
      setTimeout(() => setTaglineComplete(true), 3950),
      setTimeout(() => setStage(5), 4650),
      setTimeout(() => setShowButtons(true), 6100),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onReturningUser]);

  const handleNewUser = () => {
    sessionStorage.setItem("zwap_splash_shown", "true");
    onNewUser?.();
  };

  const handleReturningUser = () => {
    sessionStorage.setItem("zwap_splash_shown", "true");
    onReturningUser?.();
  };

  const handleWhatIsZwap = () => {
    sessionStorage.setItem("zwap_splash_shown", "true");
    onWhatIsZwap?.();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#04040d] flex flex-col items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,245,255,0.08),transparent_35%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.10),transparent_40%)]" />

        <motion.div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] rounded-full bg-cyan-500/10 blur-[130px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.18, 0.28, 0.18],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <motion.div
          className="absolute bottom-[-8rem] right-[-4rem] w-[26rem] h-[26rem] rounded-full bg-purple-500/12 blur-[120px]"
          animate={{
            scale: [1.08, 1, 1.08],
            opacity: [0.22, 0.14, 0.22],
          }}
          transition={{ duration: 5.5, repeat: Infinity }}
        />

        <motion.div
          className="absolute top-1/3 left-[-5rem] w-[20rem] h-[20rem] rounded-full bg-blue-500/10 blur-[110px]"
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.15, 0.22, 0.15],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6">
        {/* Animated center tagline before logo */}
        <AnimatePresence mode="wait">
          {!taglineComplete && stage >= 1 && stage < 5 && (
            <motion.div
              key="words-center"
              className="flex flex-wrap justify-center gap-x-3 gap-y-2 sm:gap-x-4 text-2xl sm:text-4xl font-black tracking-wide"
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
            >
              {stage >= 1 && (
                <motion.span
                  initial={{ x: -120, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-cyan-400"
                  style={{ textShadow: "0 0 18px rgba(0,245,255,0.8)" }}
                >
                  MOVE.
                </motion.span>
              )}

              {stage >= 2 && (
                <motion.span
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.55 }}
                  className="text-purple-400"
                  style={{ textShadow: "0 0 18px rgba(168,85,247,0.8)" }}
                >
                  PLAY.
                </motion.span>
              )}

              {stage >= 3 && (
                <motion.span
                  initial={{ y: -110, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", damping: 11, stiffness: 120 }}
                  className="text-blue-400"
                  style={{ textShadow: "0 0 18px rgba(59,130,246,0.8)" }}
                >
                  SWAP.
                </motion.span>
              )}

              {stage >= 4 && (
                <span
                  className="text-pink-400"
                  style={{ textShadow: "0 0 18px rgba(236,72,153,0.8)" }}
                >
                  {"SHOP.".split("").map((letter, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logo swirl-in */}
        <AnimatePresence>
          {stage >= 5 && (
            <motion.div
              initial={{ scale: 0.04, rotate: -760, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                type: "spring",
                damping: 18,
                stiffness: 42,
                duration: 2,
              }}
              className="mb-3"
            >
              <motion.div
                className="relative"
                animate={{
                  filter: [
                    "drop-shadow(0 0 25px rgba(0,245,255,0.35))",
                    "drop-shadow(0 0 60px rgba(0,245,255,0.75))",
                    "drop-shadow(0 0 25px rgba(0,245,255,0.35))",
                  ],
                }}
                transition={{ duration: 2.6, repeat: Infinity }}
              >
                <div className="absolute inset-0 rounded-full blur-3xl bg-cyan-500/10 scale-110" />
                <img
                  src={ZWAP_LOGO}
                  alt="ZWAP!"
                  className="relative h-40 sm:h-56 md:h-64 select-none"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Repositioned tagline under logo */}
        <AnimatePresence>
          {stage >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm sm:text-lg font-extrabold tracking-wide mt-1"
            >
              <span
                className="text-cyan-400"
                style={{ textShadow: "0 0 10px rgba(0,245,255,0.6)" }}
              >
                MOVE.
              </span>
              <span
                className="text-purple-400"
                style={{ textShadow: "0 0 10px rgba(168,85,247,0.6)" }}
              >
                PLAY.
              </span>
              <span
                className="text-blue-400"
                style={{ textShadow: "0 0 10px rgba(59,130,246,0.6)" }}
              >
                SWAP.
              </span>
              <span
                className="text-pink-400"
                style={{ textShadow: "0 0 10px rgba(236,72,153,0.6)" }}
              >
                SHOP.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA panel */}
        <AnimatePresence>
          {showButtons && (
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-10 w-full max-w-sm"
            >
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.35)] p-4 sm:p-5">
                <div className="space-y-3">
                  <Button
                    onClick={handleNewUser}
                    className="w-full h-13 sm:h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 shadow-[0_0_25px_rgba(0,245,255,0.22)]"
                    data-testid="splash-new-user"
                  >
                    New User
                  </Button>

                  <Button
                    onClick={handleReturningUser}
                    className="w-full h-13 sm:h-14 text-base font-semibold rounded-2xl bg-[#151733] hover:bg-[#1b1e42] text-white border border-cyan-500/20"
                    data-testid="splash-returning-user"
                  >
                    Returning User
                  </Button>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={handleWhatIsZwap}
                    className="text-sm font-medium text-cyan-300/90 hover:text-cyan-200 transition-colors"
                    data-testid="splash-about"
                  >
                    What is ZWAP?
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}