import React from "react";
import { Check, Circle } from "lucide-react";

function isComplete(value) {
  return Boolean(value);
}

export default function ActivityConsistencyV1({
  consistency = [], // [{ day: "M", complete: true }]
  streakDays,
}) {
  return (
    <div>
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-white/70">
          Consistency
        </div>

        {typeof streakDays === "number" && (
          <div className="text-xs text-orange-400">
            {streakDays} day streak 🔥
          </div>
        )}
      </div>

      {/* ROW */}
      <div className="flex items-center gap-2">
        {consistency.length > 0 ? (
          consistency.map((item, i) => {
            const complete = isComplete(item.complete);

            return (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border transition",
                    complete
                      ? "border-emerald-400 bg-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.35)]"
                      : "border-white/20 bg-white/[0.02]",
                  ].join(" ")}
                >
                  {complete ? (
                    <Check size={14} className="text-emerald-300" />
                  ) : (
                    <Circle size={10} className="text-white/30" />
                  )}
                </div>

                {/* DAY LABEL */}
                <div className="mt-1 text-[10px] text-white/40">
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
