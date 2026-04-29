import React from "react";
import { motion } from "framer-motion";

const BUTTON_CONFIG = {
  move: {
    label: "Move",
    eyebrow: "STEP INTO VALUE",
    shell:
      "border-cyan-300/45 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.24),rgba(34,211,238,0.12)_42%,rgba(8,12,24,0.9)_100%)] text-cyan-50 shadow-[0_0_32px_rgba(34,211,238,0.28),inset_0_1px_0_rgba(255,255,255,0.16)]",
    glow: "from-cyan-200/0 via-cyan-200/45 to-cyan-200/0",
    dot: "bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.75)]",
  },
  play: {
    label: "Play",
    eyebrow: "ENTER THE ARCADE",
    shell:
      "border-violet-300/45 bg-[radial-gradient(circle_at_top,rgba(216,180,254,0.24),rgba(168,85,247,0.13)_42%,rgba(12,8,24,0.9)_100%)] text-violet-50 shadow-[0_0_32px_rgba(168,85,247,0.28),inset_0_1px_0_rgba(255,255,255,0.16)]",
    glow: "from-violet-200/0 via-fuchsia-200/45 to-violet-200/0",
    dot: "bg-violet-200 shadow-[0_0_14px_rgba(168,85,247,0.75)]",
  },
  primary: {
    label: "Keep Earning",
    eyebrow: "SAVE PROGRESS",
    shell:
      "border-cyan-300/45 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.24),rgba(34,211,238,0.12)_42%,rgba(8,12,24,0.9)_100%)] text-cyan-50 shadow-[0_0_32px_rgba(34,211,238,0.28),inset_0_1px_0_rgba(255,255,255,0.16)]",
    glow: "from-cyan-200/0 via-cyan-200/45 to-cyan-200/0",
    dot: "bg-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.75)]",
  },
  secondary: {
    label: "Not Now",
    eyebrow: "EXIT",
    shell:
      "border-white/12 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),rgba(255,255,255,0.045)_42%,rgba(8,10,18,0.86)_100%)] text-white/76 shadow-[0_0_24px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.10)]",
    glow: "from-white/0 via-white/20 to-white/0",
    dot: "bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.35)]",
  },
};

export default function OnboardingActionButton({
  type = "move",
  label,
  eyebrow,
  onClick,
  className = "",
}) {
  const config = BUTTON_CONFIG[type] || BUTTON_CONFIG.move;

  const finalLabel = label || config.label;
  const finalEyebrow = eyebrow || config.eyebrow;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.965 }}
      className={[
        "group relative mx-auto w-[270px] max-w-full overflow-hidden rounded-[24px] border px-5 py-4 transition active:scale-[0.965]",
        "flex flex-col items-center justify-center text-center", // 🔒 hard center lock
        config.shell,
        className,
      ].join(" ")}
    >
      {/* Glow sweep */}
      <motion.div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute left-[-40%] top-0 h-full w-[50%] bg-gradient-to-r blur-md",
          config.glow,
        ].join(" ")}
        animate={{ x: ["0%", "320%", "0%"] }}
        transition={{
          duration: 5.5, // 🧊 slowed down (was 3.2)
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center text-center">
        <div className="mb-1 flex items-center justify-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
          <span className="text-[8px] font-black uppercase tracking-[0.22em] text-white/50 text-center">
            {finalEyebrow}
          </span>
        </div>

        <div className="text-[1.25rem] font-black leading-none tracking-[-0.055em] text-white text-center">
          {finalLabel}
        </div>
      </div>
    </motion.button>
  );
}
