import React from "react";
import { motion } from "framer-motion";

export default function StreamCard({ item, active, onClick, onOpen }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={[
        "min-w-0 rounded-2xl border p-2 text-left transition-all",
        active
          ? "border-cyan-300/40 bg-white/[0.08]"
          : "border-white/10 bg-white/[0.04]",
      ].join(" ")}
    >
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
        {item?.artwork ? (
          <img
            src={item.artwork}
            alt={item.title}
            className="aspect-square w-full object-cover"
          />
        ) : null}
      </div>

      <div className="mt-2 min-w-0">
        <p className="truncate text-[11px] font-black text-white">
          {item.title}
        </p>

        <p className="mt-0.5 truncate text-[9px] text-white/50">
          {item.subtitle}
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[9px]">
        <span className="truncate font-black uppercase tracking-[0.08em] text-white/40">
          {item.duration || "PLAYLIST"}
        </span>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen?.();
          }}
          className="shrink-0 font-black text-cyan-300"
        >
          Open
        </button>
      </div>
    </motion.button>
  );
}