import React from "react";
import { Shield } from "lucide-react";

export default function AccountShieldCardV1({
  onClick,
  label = "Shield",
  description = "Protected account access",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-[18px] border border-white/10",
        "bg-white/[0.03] px-4 py-3 transition active:scale-[0.99]",
      ].join(" ")}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <Shield size={18} strokeWidth={2} className="text-white/55" />
      </div>

      <div className="min-w-0 flex-1 text-left">
        <div className="text-sm font-medium tracking-[-0.02em] text-white/78">
          {label}
        </div>
        <div className="mt-0.5 text-xs text-white/42">
          {description}
        </div>
      </div>

      <div className="text-white/25">›</div>
    </button>
  );
}