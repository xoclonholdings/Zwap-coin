import React from "react";
import {
  ChevronRight,
  Footprints,
  Flame,
  Clock3,
  Trophy,
} from "lucide-react";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "--";
  if (typeof value === "number") return value.toLocaleString();
  return value;
}

const ICONS = {
  steps: Footprints,
  calories: Flame,
  time: Clock3,
  trophy: Trophy,
};

export default function ActivityPersonalBestsV1({
  personalBests = [], // [{ type, label, value, date }]
  onViewAll,
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-white/70">
          Personal Bests
        </div>

        {typeof onViewAll === "function" ? (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs text-purple-300/80 transition active:scale-[0.97]"
          >
            View All
            <ChevronRight size={12} />
          </button>
        ) : null}
      </div>

      <div className="grid gap-3">
        {personalBests.length > 0 ? (
          personalBests.map((item, index) => {
            const Icon = ICONS[item.type] || Trophy;

            return (
              <div
                key={`${item.label || "best"}-${index}`}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-cyan-300">
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs text-white/50">
                    {item.label || "Personal Best"}
                  </div>

                  <div className="mt-0.5 truncate text-sm font-semibold text-white">
                    {formatValue(item.value)}
                  </div>

                  {item.date ? (
                    <div className="mt-0.5 truncate text-[10px] text-white/35">
                      {item.date}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-xs text-white/40">
            No personal bests yet.
          </div>
        )}
      </div>
    </div>
  );
}