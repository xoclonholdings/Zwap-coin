import React from "react";
import { motion } from "framer-motion";
import { Music2 } from "lucide-react";

export default function StreamCard({
  item,
  active,
  onClick,
  onOpen,
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={[
        "relative flex flex-col justify-between rounded-2xl border p-3 text-left transition-all",
        active
          ? "border-cyan-300/40 bg-white/[0.08]"
          : "border-white/10 bg-white/[0.04]",
      ].join(" ")}
    >
      {/* ICON */}
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
        <Music2 className="h-4 w-4 text-white/80" />
      </div>

      {/* TEXT */}
      <div className="min-w-0">
        <p className="truncate text-[12px] font-bold text-white">
          {item.title}
        </p>

        <p className="mt-0.5 text-[10px] text-white/50">
          {item.subtitle}
        </p>
      </div>

      {/* FOOTER */}
      <div className="mt-3 flex items-center justify-between text-[10px]">
        <span className="text-white/40">
          {item.duration || "PLAYLIST"}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.();
          }}
          className="text-cyan-300 font-semibold"
        >
          Open
        </button>
      </div>
    </motion.button>
  );
}