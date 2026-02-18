import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp, ZWAP_LOGO } from "@/App";

export default function SplashScreen({ onEnter }) {
  const [stage, setStage] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [taglineComplete, setTaglineComplete] = useState(false);
  const navigate = useNavigate();
  const { walletAddress } = useApp();

  const words = ["MOVE.", "PLAY.", "SWAP.", "SHOP."];

  useEffect(() => {
    // Check if splash was already shown this session
    const shown = sessionStorage.getItem("zwap_splash_shown");
    if (shown) {
      onEnter();
      return;
    }

    // Animation sequence - slower timing
    const timers = [
      setTimeout(() => setStage(1), 600),   // MOVE slides in
      setTimeout(() => setStage(2), 1500),  // PLAY dissolves
      setTimeout(() => setStage(3), 2400),  // SWAP falls
      setTimeout(() => setStage(4), 3300),  // SHOP letter by letter
      setTimeout(() => setTaglineComplete(true), 4200), // Tagline complete, starts moving
      setTimeout(() => setStage(5), 5000),  // Logo appears
      setTimeout(() => setShowButtons(true), 6500), // Buttons appear
    ];

    return () => timers.forEach(clearTimeout);
  }, [onEnter]);

  const handleEnter = () => {
    sessionStorage.setItem("zwap_splash_shown", "true");
    onEnter();
  };

  const handleWhatIsZwap = () => {
    sessionStorage.setItem("zwap_splash_shown", "true");
    navigate("/about");
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050510] flex flex-col items-center justify-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Logo and tagline container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo swirl in - 3-5x larger */}
        <AnimatePresence>
          {stage >= 5 && (
            <motion.div
              initial={{ scale: 0.05, rotate: -720, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                damping: 20, 
                stiffness: 40,
                duration: 2 
              }}
              className="mb-4"
            >
              <motion.img
                src={ZWAP_LOGO}
                alt="ZWAP!"
                className="h-40 sm:h-56 drop-shadow-[0_0_40px_rgba(0,245,255,0.6)]"
                animate={{ 
                  filter: [
                    "drop-shadow(0 0 30px rgba(0,245,255,0.4))",
                    "drop-shadow(0 0 60px rgba(0,245,255,0.8))",
                    "drop-shadow(0 0 30px rgba(0,245,255,0.4))"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline: "MOVE. PLAY. SWAP. SHOP." - animated words then repositioned */}
        <AnimatePresence mode="wait">
          {!taglineComplete && stage >= 1 && stage < 5 && (
            <motion.div
              key="words-center"
              className="flex gap-3 sm:gap-4 text-2xl sm:text-4xl font-extrabold"
              exit={{ opacity: 0 }}
            >
              {/* MOVE - slides in */}
              {stage >= 1 && (
                <motion.span
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-cyan-400"
                  style={{ textShadow: "0 0 20px rgba(0,245,255,0.8)" }}
                >
                  MOVE.
                </motion.span>
              )}

              {/* PLAY - dissolves in */}
              {stage >= 2 && (
                <motion.span
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.6 }}
                  className="text-purple-400"
                  style={{ textShadow: "0 0 20px rgba(153,69,255,0.8)" }}
                >
                  PLAY.
                </motion.span>
              )}

              {/* SWAP - falls from top */}
              {stage >= 3 && (
                <motion.span
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="text-blue-400"
                  style={{ textShadow: "0 0 20px rgba(59,130,246,0.8)" }}
                >
                  SWAP.
                </motion.span>
              )}

              {/* SHOP - letter by letter */}
              {stage >= 4 && (
                <span className="text-pink-400" style={{ textShadow: "0 0 20px rgba(236,72,153,0.8)" }}>
                  {"SHOP.".split("").map((letter, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagline repositioned under logo */}
        <AnimatePresence>
          {stage >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex gap-2 sm:gap-3 text-sm sm:text-lg font-bold mt-2"
            >
              <span className="text-cyan-400" style={{ textShadow: "0 0 10px rgba(0,245,255,0.6)" }}>MOVE.</span>
              <span className="text-purple-400" style={{ textShadow: "0 0 10px rgba(153,69,255,0.6)" }}>PLAY.</span>
              <span className="text-blue-400" style={{ textShadow: "0 0 10px rgba(59,130,246,0.6)" }}>SWAP.</span>
              <span className="text-pink-400" style={{ textShadow: "0 0 10px rgba(236,72,153,0.6)" }}>SHOP.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 items-center relative z-10 mt-12"
          >
            <Button
              onClick={handleEnter}
              className="px-12 py-6 text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-full shadow-[0_0_30px_rgba(0,245,255,0.4)] hover:shadow-[0_0_50px_rgba(0,245,255,0.6)] transition-all"
              data-testid="splash-enter"
            >
              ENTER
            </Button>
            
            <Button
              onClick={handleWhatIsZwap}
              className="px-8 py-5 text-base font-semibold bg-transparent border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 rounded-full transition-all hover:shadow-[0_0_20px_rgba(0,245,255,0.3)]"
              data-testid="splash-about"
            >
              WHAT IS ZWAP!?
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip button (appears early) */}
      {!showButtons && stage > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          onClick={handleEnter}
          className="absolute bottom-8 text-gray-500 text-xs hover:text-gray-300"
        >
          Skip →
        </motion.button>
      )}
    </div>
  );
}
