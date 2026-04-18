import React from "react";
import { motion } from "framer-motion";
import { clamp } from "./garden.utils";

export default function GardenHealthBar({
  healthPercent = 0,
  healthBand = "stable",
}) {
  const safeHealth = clamp(healthPercent);
  const width = `${safeHealth}%`;

  const fillClass =
    healthBand === "healthy"
      ? "from-emerald-400 via-lime-300 to-cyan-300"
      : healthBand === "stable"
      ? "from-teal-400 via-emerald-400 to-lime-300"
      : healthBand === "fading"
      ? "from-amber-300 via-lime-300 to-emerald-300"
      : healthBand === "weak"
      ? "from-amber-400 via-orange-400 to-pink-400"
      : "from-rose-500 via-orange-500 to-amber-400";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-white/55">
        <span>Health</span>
        <span>{safeHealth}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${fillClass}`}
          initial={{ width: 0 }}
          animate={{ width }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}