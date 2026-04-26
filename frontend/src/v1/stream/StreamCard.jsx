import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Headphones,
  PlayCircle,
  Radio,
  Video,
} from "lucide-react";

export default function StreamCard({ item, active, onClick, tabId }) {
  const iconMap = {
    watch: Video,
    listen: Headphones,
    live: Radio,
    library: BookOpen,
  };

  const Icon = iconMap[tabId] || PlayCircle;
  const isLiveBadge = item.duration === "LIVE";

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={`w-full rounded-[22px] border p-4 text-left transition-all ${
        active
          ? "border-cyan-400/30 bg-white/[0.06] shadow-[0_0_24px_rgba(34,211,238,0.10)]"
          : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            active
              ? "border-cyan-400/25 bg-gradient-to-br from-cyan-500/20 to-purple-500/20"
              : "border-white/10 bg-white/[0.04]"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${active ? "text-cyan-300" : "text-gray-300"}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="truncate font-semibold text-white">{item.title}</h4>

            {item.duration ? (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                  isLiveBadge
                    ? "border border-red-400/30 bg-red-500/15 text-red-200"
                    : "border border-white/10 bg-white/5 text-gray-300"
                }`}
              >
                {item.duration}
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-gray-400">{item.subtitle}</p>

          {item.reward ? (
            <div className="mt-3 inline-flex rounded-full border border-cyan-300/15 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-200">
              {item.reward}
            </div>
          ) : null}
        </div>
      </div>
    </motion.button>
  );
}