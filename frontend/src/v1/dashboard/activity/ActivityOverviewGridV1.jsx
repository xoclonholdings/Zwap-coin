import React from "react";
import { Footprints, Flame, Clock3, Zap } from "lucide-react";

function formatValue(value) {
  if (value === null || value === undefined) return "--";

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  return value;
}

function formatChange(change) {
  if (change === null || change === undefined) return null;

  const safe = Number(change);
  if (!Number.isFinite(safe)) return null;

  return `${safe > 0 ? "+" : ""}${safe}%`;
}

export default function ActivityOverviewGridV1({
  avgSteps,
  calories,
  activeTime,
  zptsEarned,

  avgStepsChangePercent,
  caloriesChangePercent,
  activeTimeChangePercent,
  zptsChangePercent,
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <OverviewCard
        icon={<Footprints size={14} />}
        label="Avg. Steps"
        value={avgSteps}
        change={avgStepsChangePercent}
      />

      <OverviewCard
        icon={<Flame size={14} />}
        label="Calories"
        value={calories}
        change={caloriesChangePercent}
      />

      <OverviewCard
        icon={<Clock3 size={14} />}
        label="Active Time"
        value={activeTime}
        change={activeTimeChangePercent}
      />

      <OverviewCard
        icon={<Zap size={14} />}
        label="zPts Earned"
        value={zptsEarned}
        change={zptsChangePercent}
      />
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */

function OverviewCard({ icon, label, value, change }) {
  const formattedChange = formatChange(change);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2.5">
      
      {/* ICON */}
      <div className="mb-1.5 text-white/60">
        {icon}
      </div>

      {/* LABEL */}
      <div className="text-[10px] text-white/50">
        {label}
      </div>

      {/* VALUE */}
      <div className="mt-0.5 text-[15px] font-semibold tracking-[-0.02em] text-white">
        {formatValue(value)}
      </div>

      {/* CHANGE */}
      {formattedChange && (
        <div className="mt-0.5 text-[10px] text-emerald-400">
          {formattedChange}
        </div>
      )}
    </div>
  );
}