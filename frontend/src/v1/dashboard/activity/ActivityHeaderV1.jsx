import React from "react";
import { ArrowLeft } from "lucide-react";

export default function ActivityHeaderV1({
  title = "Activity",
  subtitle = "Your Progress",
  onBack,
  className = "",
}) {
  return (
    <div
      className={[
        "mb-5 flex items-center justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* LEFT: Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/80 transition active:scale-[0.96]"
        aria-label="Back"
      >
        <ArrowLeft size={18} />
      </button>

      {/* CENTER: Title */}
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.18em] text-white/40">
          {title}
        </div>
        <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">
          {subtitle}
        </div>
      </div>

      {/* RIGHT: Spacer for symmetry */}
      <div className="w-10" />
    </div>
  );
}
