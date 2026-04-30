import React from "react";
import { Check, Circle } from "lucide-react";

function isComplete(value) {
  return Boolean(value);
}

export default function ActivityConsistencyV1({
  consistency = [],
  streakDays,
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-black tracking-[-0.03em] text-white/78">
          Consistency
        </div>

        {typeof streakDays === "number" ? (
          <div className="text-xs font-bold text-orange-300">
            {streakDays} day streak 🔥
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-1.5">
        {consistency.length > 0 ? (
          consistency.map((item, i) => {
            const complete = isComplete(item.complete);

            return (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border transition",
                    complete
                      ? "border-emerald-300 bg-emerald-400/20 shadow-[0_0_12px_rgba(52,211,153,0.35)]"
                      : "border-white/20 bg-white/[0.02]",
                  ].join(" ")}
                >
                  {complete ? (
                    <Check size={14} className="text-emerald-200" />
                  ) : (
                    <Circle size={10} className="text-white/30" />
                  )}
                </div>

                <div className="mt-1 text-[10px] font-bold text-white/42">
                  {item.day}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-white/40">
            No consistency data yet.
          </div>
        )}
      </div>
    </div>
  );
}