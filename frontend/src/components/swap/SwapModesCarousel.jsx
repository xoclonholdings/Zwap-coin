import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  Coins,
  Lock,
  Sparkles,
  WalletCards,
} from "lucide-react";

const STATUS_STYLES = {
  active: {
    chip: "Active",
    chipClass:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    cardClass:
      "border-cyan-400/20 bg-[linear-gradient(180deg,rgba(14,33,44,0.96),rgba(9,18,27,0.96))]",
    iconWrap:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  },
  future: {
    chip: "Future",
    chipClass:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
    cardClass:
      "border-violet-400/15 bg-[linear-gradient(180deg,rgba(21,15,37,0.96),rgba(12,10,24,0.96))]",
    iconWrap:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
  },
  locked: {
    chip: "Locked",
    chipClass:
      "border-white/10 bg-white/6 text-white/55",
    cardClass:
      "border-white/10 bg-[linear-gradient(180deg,rgba(18,18,22,0.96),rgba(12,12,15,0.96))]",
    iconWrap:
      "border-white/10 bg-white/6 text-white/50",
  },
};

function getModeIcon(modeId) {
  switch (modeId) {
    case "convert-zpts":
      return Coins;
    case "swap-zwap":
      return ArrowRightLeft;
    case "quick-convert":
      return Sparkles;
    case "cashout-path":
      return WalletCards;
    case "treasury-route":
      return Lock;
    default:
      return ArrowRightLeft;
  }
}

export default function SwapModesCarousel({
  modes,
  activeMode,
  onSelectMode,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
            Conversion Modes
          </p>
          <h3 className="mt-1 text-sm font-semibold text-white">
            Choose your utility path
          </h3>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] text-white/45">
          Swipe
        </div>
      </div>

      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex gap-3">
          {modes.map((mode, index) => {
            const Icon = getModeIcon(mode.id);
            const styles = STATUS_STYLES[mode.status] || STATUS_STYLES.active;
            const isActive = activeMode === mode.id;

            return (
              <motion.button
                type="button"
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className={`relative w-[248px] flex-shrink-0 rounded-[24px] border p-4 text-left shadow-[0_16px_40px_rgba(0,0,0,0.28)] transition ${
                  styles.cardClass
                } ${
                  isActive
                    ? "ring-1 ring-cyan-300/50 shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_20px_45px_rgba(34,211,238,0.10)]"
                    : "hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${styles.iconWrap}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div
                    className={`rounded-xl border px-2.5 py-1 text-[11px] font-medium ${styles.chipClass}`}
                  >
                    {styles.chip}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-base font-semibold text-white">
                    {mode.name}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-white/58">
                    {mode.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-white/40">
                      Route
                    </p>
                    <p className="mt-1 text-xs font-medium text-white/82">
                      {mode.fromToken} → {mode.toToken}
                    </p>
                  </div>

                  {isActive ? (
                    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
                      Selected
                    </div>
                  ) : (
                    <div className="rounded-xl border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/55">
                      Open
                    </div>
                  )}
                </div>

                {isActive && (
                  <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}