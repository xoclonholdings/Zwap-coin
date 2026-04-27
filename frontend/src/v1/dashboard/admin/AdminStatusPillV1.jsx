import React from "react";

export default function AdminStatusPillV1({
  children,
  tone = "neutral",
  className = "",
}) {
  const toneClass =
    tone === "active"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
      : tone === "locked"
        ? "border-white/10 bg-white/[0.04] text-white/45"
        : tone === "warning"
          ? "border-amber-400/25 bg-amber-500/10 text-amber-300"
          : tone === "phase"
            ? "border-cyan-400/25 bg-cyan-500/10 text-cyan-300"
            : "border-white/10 bg-white/[0.04] text-white/55";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1",
        "text-[10px] font-semibold uppercase tracking-[0.12em]",
        toneClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}