import React from "react";
import { Shield } from "lucide-react";

export default function AccountShieldCardV1({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="System Access"
      className="
        relative flex w-full items-center justify-center
        rounded-[22px] border border-white/10
        bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_40%),linear-gradient(180deg,rgba(10,16,26,0.96),rgba(5,8,14,0.98))]
        py-5
        shadow-[0_14px_32px_rgba(0,0,0,0.28)]
        transition active:scale-[0.98]
      "
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)]">
        <Shield size={22} strokeWidth={2.2} />
      </div>
    </button>
  );
}
