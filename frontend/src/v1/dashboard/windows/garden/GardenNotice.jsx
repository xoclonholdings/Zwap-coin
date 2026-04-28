import React from "react";
import { ChevronRight, Shield } from "lucide-react";

export default function GardenNotice({ message }) {
  return (
    <button
      type="button"
      className="mt-3 flex w-full items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.045] p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-lime-300/25 bg-lime-300/10 text-lime-300 shadow-[0_0_18px_rgba(124,255,91,0.18)]">
        <Shield size={24} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-black text-lime-300">{message.title}</div>
        <div className="mt-0.5 text-xs font-semibold leading-snug text-white/68">
          {message.body}
        </div>
      </div>

      <ChevronRight size={22} className="text-white/60" />
    </button>
  );
}