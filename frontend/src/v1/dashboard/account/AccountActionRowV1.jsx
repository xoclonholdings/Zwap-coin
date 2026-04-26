import React from "react";
import { ChevronRight } from "lucide-react";

export default function AccountActionRowV1({
  label,
  onClick,
  danger = false,
}) {
  const tone = danger
    ? "border-rose-400/18 bg-rose-400/[0.06] text-rose-200 hover:bg-rose-400/[0.10]"
    : "border-white/10 bg-white/[0.04] text-white/88 hover:bg-white/[0.07]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full items-center justify-between",
        "rounded-[18px] border px-4 py-3.5",
        "text-sm font-medium transition",
        "active:scale-[0.99]",
        tone,
      ].join(" ")}
    >
      <span className="tracking-[-0.02em]">{label}</span>

      {!danger ? (
        <ChevronRight
          size={16}
          strokeWidth={2}
          className="opacity-50 transition group-hover:opacity-80"
        />
      ) : null}
    </button>
  );
}