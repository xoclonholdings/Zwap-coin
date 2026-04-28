import React from "react";
import { ChevronRight } from "lucide-react";

export default function AccountActionRowV1({
  label,
  onClick,
  danger = false,
}) {
  const tone = danger
    ? "border-rose-300/18 bg-[linear-gradient(180deg,rgba(90,28,46,0.22),rgba(30,12,20,0.82))] text-rose-100"
    : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))] text-white/88";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex h-[54px] w-full items-center justify-center rounded-[20px] border px-4",
        "text-center text-[15px] font-black tracking-[-0.035em]",
        "shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition active:scale-[0.99]",
        tone,
      ].join(" ")}
    >
      <span className="mx-auto">{label}</span>

      {!danger ? (
        <ChevronRight
          size={18}
          strokeWidth={2.4}
          className="absolute right-4 text-white/45"
        />
      ) : null}
    </button>
  );
}
