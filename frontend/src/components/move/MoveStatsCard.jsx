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
    <div className="flex flex-col items-center justify-center">
      <div
        className={`relative h-16 w-16 rounded-full p-[5px] transition ${
          completed ? "shadow-[0_0_22px_rgba(34,211,238,0.22)]" : ""
        }`}
        style={buildCircleStyle(progress)}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0b141d]">
          <span
            className={`text-[11px] font-semibold tracking-wide ${
              completed ? "text-cyan-300" : "text-white/70"
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
    <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
      <p className="text-[10px] uppercase tracking-wide text-white/45">
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
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="mb-3">
        <p className="text-[11px] uppercase tracking-wide text-white/45">
          Session Progress
        </p>
        <h3 className="mt-1 text-sm font-semibold text-white">
          Progress + Stats
        </h3>
      </div>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="rounded-[20px] border border-white/8 bg-black/20 p-3">
          <div className="grid grid-cols-2 gap-3">
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