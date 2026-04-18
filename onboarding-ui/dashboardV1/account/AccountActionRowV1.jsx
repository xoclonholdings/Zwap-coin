import React from "react";

export default function AccountActionRowV1({
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center justify-between rounded-[18px] border px-4 py-3.5",
        "text-left transition active:scale-[0.99]",
        danger
          ? "border-rose-400/18 bg-rose-400/[0.06] text-rose-200"
          : "border-white/10 bg-white/[0.04] text-white/88",
      ].join(" ")}
    >
      <span className="text-sm font-medium tracking-[-0.02em]">
        {label}
      </span>

      <span className={danger ? "text-rose-200/70" : "text-white/30"}>
        ›
      </span>
    </button>
  );
}