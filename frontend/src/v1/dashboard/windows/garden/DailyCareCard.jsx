import React from "react";
import { ChevronRight, Sprout } from "lucide-react";

export default function DailyCareCard({ fullLoopCompleted }) {
  return (
    <button
      type="button"
      className="mt-4 flex w-full items-center gap-3 rounded-[1.25rem] border border-lime-300/20 bg-lime-300/[0.045] p-3 text-left"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
        <Sprout size={26} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-black text-lime-300">Daily Care</div>
        <div className="mt-0.5 text-xs font-semibold leading-snug text-white/68">
          {fullLoopCompleted
            ? "You kept your Garden healthy today."
            : "Complete your daily tasks to keep your Garden healthy."}
        </div>
      </div>

      <ChevronRight size={22} className="text-white/60" />
    </button>
  );
}
