import React, { useMemo } from "react";
import { ChevronDown, Target } from "lucide-react";

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function clamp(value, min = 0, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function ActivityProgressCardV1({
  totalSteps = 0,
  stepGoal = 0,
  stepChangePercent,
  stepsData = [],
  rangeLabel = "This Week",
  onRangeChange,
}) {
  const safeStepsData = Array.isArray(stepsData) ? stepsData : [];

  const maxSteps = useMemo(() => {
    if (!safeStepsData.length) return 1;
    return Math.max(...safeStepsData.map((d) => Number(d.steps || 0)), 1);
  }, [safeStepsData]);

  const goalPercent = useMemo(() => {
    if (!stepGoal) return 0;
    return clamp((totalSteps / stepGoal) * 100);
  }, [totalSteps, stepGoal]);

  const handleRangeClick = (event) => {
    event.stopPropagation();

    if (typeof onRangeChange === "function") {
      onRangeChange();
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-xs text-white/50">Total Steps</div>

          <div className="text-3xl font-bold tracking-[-0.03em] text-white">
            {formatNumber(totalSteps)}
          </div>

          {stepChangePercent !== undefined && (
            <div className="text-xs text-emerald-400">
              {stepChangePercent > 0 ? "+" : ""}
              {stepChangePercent}%
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleRangeClick}
          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70"
        >
          {rangeLabel}
          <ChevronDown size={12} />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 text-xs text-white/60">
        <Target size={14} />
        Goal: {formatNumber(stepGoal)} steps
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-300"
          style={{ width: `${goalPercent}%` }}
        />
      </div>

      {safeStepsData.length > 0 && (
        <div className="flex items-end gap-2">
          {safeStepsData.map((item, index) => {
            const height = clamp((Number(item.steps || 0) / maxSteps) * 100);

            return (
              <div
                key={`${item.day || item.label || "step"}-${index}`}
                className="flex flex-1 flex-col items-center"
              >
                <div className="h-28 w-full rounded-xl bg-white/[0.04]">
                  <div
                    className="w-full rounded-xl bg-gradient-to-t from-cyan-400 via-blue-500 to-purple-500"
                    style={{ height: `${height}%` }}
                  />
                </div>

                <div className="mt-1 text-[10px] text-white/50">
                  {item.day || item.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {safeStepsData.length === 0 && (
        <div className="mt-4 text-center text-xs text-white/40">
          No step data yet.
        </div>
      )}
    </div>
  );
}