import React from "react";
import { Shield } from "lucide-react";

export default function AccountShieldCardV1({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group w-full rounded-[18px] border border-white/8
        bg-[linear-gradient(180deg,rgba(18,22,30,0.85),rgba(8,12,18,0.95))]
        px-4 py-3.5 text-left
        transition active:scale-[0.99]
      "
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50 transition group-hover:text-white/80">
            <Shield size={16} strokeWidth={2} />
          </div>

          <div className="text-sm font-medium tracking-[-0.02em] text-white/55 group-hover:text-white/80 transition">
            System Access
          </div>
        </div>

        <div className="h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-white/40 transition" />
      </div>
    </button>
  );
}