import React from "react";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function formatSteps(value) {
  return Number(value || 0).toLocaleString();
}

function formatDistance(value) {
  return `${Number(value || 0).toFixed(2)} mi`;
}

function formatCalories(value) {
  return `${Number(value || 0).toLocaleString()} kcal`;
}

function buildCircleStyle(progress) {
  const safeProgress = clamp(progress);
  const degrees = safeProgress * 360;

  return {
    background: `conic-gradient(
      from 180deg,
      rgba(34,211,238,1) 0deg,
      rgba(45,212,191,1) ${degrees * 0.65}deg,
      rgba(168,85,247,1) ${degrees}deg,
      rgba(255,255,255,0.10) ${degrees}deg,
      rgba(255,255,255,0.10) 360deg
    )`,
  };
}

function ProgressCircle({ label, progress }) {
  const completed = progress >= 1;

  return (
    <div className="flex items-center justify-center">
      <div
        className={`relative h-20 w-20 rounded-full p-[6px] transition ${
          completed
            ? "shadow-[0_0_34px_rgba(34,211,238,0.34)]"
            : "shadow-[0_0_20px_rgba(34,211,238,0.14)]"
        }`}
        style={buildCircleStyle(progress)}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),rgba(10,20,29,1)_58%)]">
          <span
            className={`text-xs font-semibold tracking-[0.14em] ${
              completed ? "text-cyan-300" : "text-white/75"
            }`}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, accentClass = "text-white" }) {
  return (
    <div className="rounded-2xl border border-cyan-400/12 bg-[linear-gradient(180deg,rgba(18,40,56,0.92),rgba(10,22,32,0.95))] px-3 py-3 shadow-[0_0_18px_rgba(34,211,238,0.06)]">
      <p className="text-[10px] uppercase tracking-wide text-cyan-100/50">
        {label}
      </p>
      <p className={`mt-1 text-base font-semibold ${accentClass}`}>{value}</p>
    </div>
  );
}

export default function MoveStatsCard({
  steps = 0,
  distanceMiles = 0,
  calories = 0,
}) {
  const milestones = [
    {
      id: "milestone-1",
      label: "1K",
      progress: clamp(steps / 1000),
    },
    {
      id: "milestone-2",
      label: "5K",
      progress: clamp((steps - 1000) / 4000),
    },
    {
      id: "milestone-3",
      label: "10K",
      progress: clamp((steps - 5000) / 5000),
    },
    {
      id: "milestone-4",
      label: "15K",
      progress: clamp((steps - 10000) / 5000),
    },
  ];

  return (
    <div className="rounded-[26px] border border-cyan-400/15 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,rgba(10,25,35,0.96),rgba(5,15,20,0.98))] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/55">
          Session Progress
        </p>
        <h3 className="mt-1 text-sm font-semibold text-white">
          Progress + Stats
        </h3>
      </div>

      <div className="grid grid-cols-[1.15fr_0.85fr] gap-4">
        <div className="rounded-[22px] border border-cyan-400/12 bg-[linear-gradient(180deg,rgba(12,28,40,0.94),rgba(7,16,24,0.98))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="grid grid-cols-2 gap-4">
            {milestones.map((milestone) => (
              <ProgressCircle
                key={milestone.id}
                label={milestone.label}
                progress={milestone.progress}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <StatRow
            label="Steps"
            value={formatSteps(steps)}
            accentClass="text-cyan-300"
          />
          <StatRow
            label="Distance"
            value={formatDistance(distanceMiles)}
            accentClass="text-violet-300"
          />
          <StatRow
            label="Calories"
            value={formatCalories(calories)}
            accentClass="text-amber-300"
          />
        </div>
      </div>
    </div>
  );
}