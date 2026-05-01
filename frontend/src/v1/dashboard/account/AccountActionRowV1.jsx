import React from "react";
import { ChevronRight } from "lucide-react";

export default function AccountActionRowV1({
  label,
  onClick,
  danger = false,
}) {
  const isAchievements = label === "Achievements";

  const tone = danger
    ? {
        button:
          "border-rose-300/20 bg-[linear-gradient(135deg,rgba(64,20,36,0.78),rgba(20,12,20,0.96))] text-rose-50 shadow-[0_10px_24px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]",
        glow: "bg-rose-300/10",
        arrow: "text-rose-100/45",
      }
    : isAchievements
    ? {
        button:
          "border-amber-300/25 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.18),transparent_40%),linear-gradient(135deg,rgba(60,44,18,0.9),rgba(20,16,10,0.98))] text-amber-100 shadow-[0_10px_24px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08),0_0_14px_rgba(251,191,36,0.12)]",
        glow: "bg-amber-300/20",
        arrow: "text-amber-100/60",
      }
    : {
        button:
          "border-cyan-200/14 bg-[linear-gradient(135deg,rgba(13,25,38,0.94),rgba(10,14,28,0.98))] text-white shadow-[0_10px_24px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)]",
        glow: "bg-cyan-300/10",
        arrow: "text-cyan-100/45",
      };

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative flex h-[54px] w-full items-center justify-center overflow-hidden rounded-[20px] border px-4",
        "text-center text-[14px] font-semibold tracking-[-0.02em]",
        "transition duration-200 active:scale-[0.985]",
        tone.button,
      ].join(" ")}
    >
      {/* subtle top glow */}
      <span
        className={[
          "pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 blur-[0.5px]",
          tone.glow,
        ].join(" ")}
      />

      {/* label */}
      <span className="relative mx-auto text-white/92">{label}</span>

      {/* arrow */}
      {!danger ? (
        <ChevronRight
          size={18}
          strokeWidth={2.35}
          className={[
            "absolute right-4 transition duration-200 group-active:translate-x-0.5",
            tone.arrow,
          ].join(" ")}
        />
      ) : null}
    </button>
  );
}