import React from "react";
import { motion } from "framer-motion";

export default function StreamCard({ item, active, onClick, onOpen }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={[
        "min-w-0 aspect-square rounded-[18px] border border-white/10 bg-white/[0.04] p-2 text-left transition-all",
        "flex flex-col justify-between",
        active ? "bg-white/[0.08] border-cyan-300/40" : "",
      ].join(" ")}
    >
      <div className="overflow-hidden rounded-[12px] bg-white/[0.04]">
        {item?.artwork ? (
          <img
            src={item.artwork}
            alt={item.title}
            className="aspect-square w-full object-cover"
          />
        ) : null}
      </div>

      <div className="mt-2 line-clamp-2 text-[11px] font-black text-white">
        {item?.title || "Playlist"}
      </div>

      <div className="mt-1 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen?.();
          }}
          className="text-[10px] font-black text-cyan-300"
        >
          Open
        </button>

        <span className="text-[10px] font-black text-white/45">
          Archive
        </span>
      </div>
    </motion.button>
  );
}