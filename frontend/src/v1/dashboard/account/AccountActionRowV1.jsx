import React from "react";
import { ChevronRight } from "lucide-react";

export default function AccountActionRowV1({
  label,
  onClick,
  danger = false,
}) {
  const tone = danger
    ? {
        button:
          "border-rose-300/28 bg-[radial-gradient(circle_at_18%_18%,rgba(251,113,133,0.22),transparent_38%),linear-gradient(135deg,rgba(92,20,48,0.92),rgba(31,10,24,0.96)_58%,rgba(12,8,18,0.98))] text-rose-50 shadow-[0_12px_28px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.12),0_0_18px_rgba(244,63,94,0.12)]",
        shine: "from-rose-200/20 via-white/8 to-transparent",
        arrow: "text-rose-100/55",
      }
    : {
        button:
          "border-cyan-200/18 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_86%_78%,rgba(168,85,247,0.14),transparent_42%),linear-gradient(135deg,rgba(12,31,48,0.96),rgba(13,16,35,0.98)_52%,rgba(8,10,22,1))] text-white shadow-[0_12px_28px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.12),0_0_18px_rgba(34,211,238,0.1)]",
        shine: "from-cyan-200/20 via-white/8 to-transparent",
        arrow: "text-cyan-100/62",
      };

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex h-[56px] w-full items-center justify-center overflow-hidden rounded-[20px] border px-4",
        "text-center text-[14px] font-black uppercase tracking-[0.08em]",
        "transition duration-200 active:scale-[0.985]",
        tone.button,
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r",
          tone.shine,
        ].join(" ")}
      />

      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_42%,rgba(0,0,0,0.18))]" />

      <span className="relative mx-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.16)]">
        {label}
      </span>

      {!danger ? (
        <ChevronRight
          size={18}
          strokeWidth={2.7}
          className={[
            "absolute right-4 transition duration-200 group-active:translate-x-0.5",
            tone.arrow,
          ].join(" ")}
        />
      ) : null}
    </button>
  );
}