import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  Bitcoin,
  CircleDollarSign,
  Coins,
} from "lucide-react";

function getModeMeta(mode) {
  switch (mode?.id) {
    case "swap-pol":
      return {
        label: "ZWAP → POL",
        short: "POL",
        Icon: ArrowRightLeft,
      };
    case "swap-btc":
      return {
        label: "ZWAP → BTC",
        short: "BTC",
        Icon: Bitcoin,
      };
    case "swap-eth":
      return {
        label: "ZWAP → ETH",
        short: "ETH",
        Icon: ArrowRightLeft,
      };
    case "swap-usdc":
      return {
        label: "ZWAP → USDC",
        short: "USDC",
        Icon: CircleDollarSign,
      };
    case "convert-zpts":
      return {
        label: "zPts",
        short: "zPts",
        Icon: Coins,
      };
    default:
      return {
        label: `${mode?.fromToken || ""} → ${mode?.toToken || ""}`.trim(),
        short: mode?.name || "Route",
        Icon: ArrowRightLeft,
      };
  }
}

export default function SwapModesCarousel({
  modes = [],
  activeMode,
  onSelectMode,
}) {
  const visibleModes = modes.slice(0, 4);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">
          Swap Routes
        </p>

        <div className="rounded-xl border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] text-white/45">
          Tap to switch
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {visibleModes.map((mode, index) => {
          const { short, label, Icon } = getModeMeta(mode);
          const isActive = activeMode === mode.id;

          return (
            <motion.button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
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
