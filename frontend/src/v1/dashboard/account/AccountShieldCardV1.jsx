import React from "react";
import { Shield } from "lucide-react";

export default function AccountShieldCardV1({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="System Access"
      className="
        flex w-full flex-col items-center justify-center
        py-4
        transition active:scale-[0.97]
      "
    >
      <div
        className="
          flex h-12 w-12 items-center justify-center
          rounded-full
          border border-cyan-300/30
          bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.28),rgba(6,12,20,0.95))]
          text-cyan-200
          shadow-[0_0_22px_rgba(34,211,238,0.22)]
        "
      >
        <Shield size={22} strokeWidth={2.4} />
      </div>

      <div
        className="
          mt-2
          text-[12px]
          font-medium
          uppercase
          tracking-[0.14em]
          text-white/55
        "
      >
        Secure
      </div>
    </button>
  );
}