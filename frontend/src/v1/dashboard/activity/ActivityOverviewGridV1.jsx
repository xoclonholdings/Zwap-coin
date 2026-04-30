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
    <div className="grid grid-cols-2 gap-2.5">
      <OverviewCard
        icon={<Footprints size={15} />}
        label="Avg. Steps"
        value={avgSteps}
        change={avgStepsChangePercent}
      />

      <OverviewCard
        icon={<Flame size={15} />}
        label="Calories"
        value={calories}
        change={caloriesChangePercent}
      />

      <OverviewCard
        icon={<Clock3 size={15} />}
        label="Active Time"
        value={activeTime}
        change={activeTimeChangePercent}
      />

      <OverviewCard
        icon={<Zap size={15} />}
        label="zPts Earned"
        value={zptsEarned}
        change={zptsChangePercent}
      />
    </div>
  );
}

function OverviewCard({ icon, label, value, change }) {
  const formattedChange = formatChange(change);

  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 text-cyan-100/70">{icon}</div>

      <div className="text-[11px] font-semibold text-white/55">{label}</div>

      <div className="mt-1 text-[1.35rem] font-black leading-none tracking-[-0.05em] text-white">
        {formatValue(value)}
      </div>

      {formattedChange ? (
        <div className="mt-1 text-[11px] font-bold text-emerald-300">
          {formattedChange}
        </div>
      ) : null}
    </div>
  );
}