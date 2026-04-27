import React from "react";

export default function AdminSectionCardV1({ title, children, className = "" }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/[0.05] p-4",
        "shadow-[0_12px_34px_rgba(0,0,0,0.22)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title ? (
        <div className="mb-2 text-sm font-semibold tracking-[-0.02em] text-white">
          {title}
        </div>
      ) : null}

      <div className="text-xs leading-5 text-white/60">{children}</div>
    </div>
  );
}