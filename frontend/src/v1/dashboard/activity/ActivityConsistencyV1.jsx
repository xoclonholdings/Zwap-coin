import React from "react";
import { Check, Circle } from "lucide-react";

const FALLBACK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function isComplete(value) {
  if (typeof value === "boolean") return value;
  if (value && typeof value === "object") return Boolean(value.complete);
  return Boolean(value);
}

function getDayLabel(value, index) {
  if (value && typeof value === "object") {
    return value.day || value.label || FALLBACK_DAYS[index] || `${index + 1}`;
  }

  return FALLBACK_DAYS[index] || `${index + 1}`;
}

export default function ActivityConsistencyV1({
  consistency = [],
  streakDays,
}) {
  const items =
    Array.isArray(consistency) && consistency.length > 0
      ? consistency.slice(0, 7)
      : [];

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm font-black tracking-[-0.03em] text-white/78">
          Consistency
        </div>

        {typeof streakDays === "number" ? (
          <div className="shrink-0 text-xs font-bold text-orange-300">
            {streakDays} day streak 🔥
          </div>
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-7 gap-1.5">
          {items.map((item, index) => {
            const complete = isComplete(item);

            return (
              <div key={index} className="flex min-w-0 flex-col items-center">
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
                  {getDayLabel(item, index)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-white/40">No consistency data yet.</div>
      )}
    </div>
  );
}