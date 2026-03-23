import React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function MoveEarningTiers({ tiers = [] }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-cyan-300" />
        <h3 className="text-sm font-semibold text-white">
          Earning Tiers
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tiers.map((tier) => (
          <motion.div
            key={tier.range}
            whileTap={{ scale: 0.98 }}
            className={`rounded-2xl border p-3 transition ${
              tier.active
                ? "border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
                : "border-white/8 bg-white/5"
            }`}
          >
            <p
              className={`text-[11px] uppercase tracking-wide ${
                tier.active ? "text-cyan-300" : "text-white/45"
              }`}
            >
              {tier.range}
            </p>
            <p
              className={`mt-1 text-lg font-semibold ${
                tier.active ? "text-white" : "text-white/70"
              }`}
            >
              {tier.rate}
            </p>
            <p className="text-[11px] text-white/40">ZWAP / step</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}