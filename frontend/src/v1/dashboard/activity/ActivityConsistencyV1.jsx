import React from "react";
import { Check, Circle } from "lucide-react";

const FALLBACK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function normalizeConsistency(consistency = []) {
  if (!Array.isArray(consistency) || consistency.length === 0) {
    return FALLBACK_DAYS.map((day) => ({
      day,
      complete: false,
    }));
  }

  return FALLBACK_DAYS.map((fallbackDay, index) => {
    const item = consistency[index];

    if (typeof item === "boolean") {
      return {
        day: fallbackDay,
        complete: item,
      };
    }

    if (item && typeof item === "object") {
      return {
        day: item.day || item.label || fallbackDay,
        complete: Boolean(item.complete),
      };
    }

    return {
      day: fallbackDay,
      complete: Boolean(item),
    };
  });
}

export default function ActivityConsistencyV1({
  consistency = [],
  streakDays = 0,
}) {
  const items = normalizeConsistency(consistency);

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm font-black tracking-[-0.03em] text-white/78">
          Consistency
        </div>

        <div className="shrink-0 text-xs font-bold text-orange-300">
          {Number(streakDays || 0)} day streak 🔥
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {items.map((item, index) => {
          const complete = Boolean(item.complete);

          return (
            <div key={`${item.day}-${index}`} className="flex min-w-0 flex-col items-center">
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
        })}
      </div>
    </div>
  );
}