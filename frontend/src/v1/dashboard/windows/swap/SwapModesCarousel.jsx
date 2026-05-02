import React from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, CheckCircle2, Repeat2, Wallet } from "lucide-react";

function getModeMeta(mode) {
  switch (mode?.id) {
    case "convert":
      return {
        label: "zPts → ZWAP",
        short: "Convert",
        Icon: ArrowRightLeft,
      };
    case "claim":
      return {
        label: "Claim to wallet",
        short: "Claim",
        Icon: Wallet,
      };
    case "swap":
      return {
        label: "ZWAP → assets",
        short: "Swap",
        Icon: Repeat2,
      };
    default:
      return {
        label: mode?.label || "Mode",
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
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
          Modes
        </p>

        <div className="rounded-xl border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] text-white/45">
          Tap to switch
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {modes.map((mode, index) => {
          const { short, label, Icon } = getModeMeta(mode);
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
              className={`flex min-h-[74px] flex-col items-center justify-center rounded-[18px] border px-2 py-2 text-center transition ${
                isActive
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 shadow-[0_0_0_1px_rgba(52,211,153,0.10)]"
                  : "border-white/8 bg-white/5 text-white/72 hover:bg-white/8"
              }`}
            >
              <div
                className={`mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl border ${
                  isActive
                    ? "border-emerald-400/20 bg-emerald-400/10"
                    : "border-white/10 bg-white/6"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <span className="text-[12px] font-semibold leading-none">
                {short}
              </span>

              <span className="mt-1 line-clamp-2 text-[9px] leading-3 text-white/45">
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}