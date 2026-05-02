import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Music2 } from "lucide-react";

export default function StreamCard({ item, active, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={`w-[46%] shrink-0 rounded-[18px] border p-3 text-left transition-all ${
        active
          ? "border-cyan-400/30 bg-white/[0.06] shadow-[0_0_24px_rgba(34,211,238,0.10)]"
          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
      }`}
    >
      <div
        className={[
          "flex h-[72px] items-center justify-center rounded-[14px] bg-gradient-to-br",
          item?.accent || "from-cyan-500/20 via-purple-500/10 to-blue-500/20",
        ].join(" ")}
      >
        <Music2 className="h-7 w-7 text-white/80" />
      </div>

      <div className="mt-2 line-clamp-2 text-[12px] font-black leading-4 text-white">
        {item?.title || "ZWAP! Playlist"}
      </div>

      <div className="mt-1 line-clamp-1 text-[10px] text-white/45">
        {item?.subtitle || "Playlist"}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[9px] uppercase tracking-[0.12em] text-white/35">
          {item?.duration || "Playlist"}
        </span>

        <span className="flex items-center gap-1 text-[10px] font-black text-cyan-300">
          Open <ChevronRight size={11} />
        </span>
      </div>
    </motion.button>
  );
}