import React from "react";

export default function ZapManControls({ open, onDirection }) {
  if (!open) return null;

  return (
    <div className="mt-4 grid w-full max-w-[220px] grid-cols-3 gap-2">
      <div />

      <button
        type="button"
        onClick={() => onDirection("up")}
        className="rounded-2xl border border-white/10 bg-white/[0.06] py-2 text-sm font-black text-white/75 active:scale-[0.97]"
      >
        ↑
      </button>

      <div />

      <button
        type="button"
        onClick={() => onDirection("left")}
        className="rounded-2xl border border-white/10 bg-white/[0.06] py-2 text-sm font-black text-white/75 active:scale-[0.97]"
      >
        ←
      </button>

      <button
        type="button"
        onClick={() => onDirection("down")}
        className="rounded-2xl border border-white/10 bg-white/[0.06] py-2 text-sm font-black text-white/75 active:scale-[0.97]"
      >
        ↓
      </button>

      <button
        type="button"
        onClick={() => onDirection("right")}
        className="rounded-2xl border border-white/10 bg-white/[0.06] py-2 text-sm font-black text-white/75 active:scale-[0.97]"
      >
        →
      </button>
    </div>
  );
}