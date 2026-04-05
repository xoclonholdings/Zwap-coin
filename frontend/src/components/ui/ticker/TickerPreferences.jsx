import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Lock } from "lucide-react";
import {
  ALWAYS_ON_CATEGORIES,
  OPTIONAL_CATEGORIES,
  TICKER_META,
} from "@/lib/ticker/constants";

export default function TickerPreferences({
  preferences,
  toggleCategory,
}) {
  const [open, setOpen] = useState(false);

  const lockedCategories = new Set(ALWAYS_ON_CATEGORIES);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
        title="Ticker preferences"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="absolute right-0 top-11 z-50 w-[300px] rounded-2xl border border-cyan-500/15 bg-[#0b1222]/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl"
          >
            <div className="mb-3">
              <p className="text-sm font-semibold text-white">Ticker Preferences</p>
              <p className="mt-1 text-xs text-gray-400">
                YOU and Did You Know stay on. Everything else is yours to tune.
              </p>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {ALWAYS_ON_CATEGORIES.map((category) => {
                const meta = TICKER_META[category];
                const Icon = meta.icon;

                return (
                  <div
                    key={category}
                    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold ${meta.chipClass}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                    <span>{meta.chip}</span>
                    <Lock className="h-3 w-3 opacity-70" />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {OPTIONAL_CATEGORIES.map((category) => {
                const meta = TICKER_META[category];
                const Icon = meta.icon;
                const isEnabled = Boolean(preferences[category]);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                      isEnabled
                        ? meta.chipClass
                        : "border-white/10 bg-white/[0.03] text-gray-400"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isEnabled ? meta.color : "text-gray-500"}`} />
                    <span>{meta.chip}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}