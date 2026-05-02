import React from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, CheckCircle2, Repeat2, Wallet } from "lucide-react";

function getModeMeta(mode) {
  switch (mode?.id) {
    case "convert":
      return {
        short: "Convert",
        Icon: ArrowRightLeft,
      };
    case "claim":
      return {
        short: "Claim",
        Icon: Wallet,
      };
    case "swap":
      return {
        short: "Swap",
        Icon: Repeat2,
      };
    default:
      return {
        short: mode?.name || "Mode",
        Icon: CheckCircle2,
      };
  }
}

export default function SwapModesCarousel({
  modes = [
    { id: "convert", name: "Convert" },
    { id: "claim", name: "Claim" },
    { id: "swap", name: "Swap" },
  ],
  activeMode,
  onSelectMode,
}) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-[10px] uppercase tracking-[0.24em] text-white/40">
        Modes
      </p>

      <div className="grid grid-cols-3 gap-2">
        {modes.map((mode, index) => {
          const { short, Icon } = getModeMeta(mode);
          const isActive = activeMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode?.(mode.id)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileTap={{ scale: 0.98 }}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-2 text-xs font-semibold transition ${
                isActive
                  ? "border-emerald-400/35 bg-emerald-400/12 text-emerald-300"
                  : "border-white/10 bg-white/[0.04] text-white/70"
              }`}
            >
              <Icon className="h-4 w-4" />
              {short}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}