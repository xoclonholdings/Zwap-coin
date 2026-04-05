import React from "react";
import { Crown } from "lucide-react";

function ProgressRing({
  completedTaskCount = 0,
  totalTasks = 4,
}) {
  const safeTotal = Math.max(Number(totalTasks) || 1, 1);
  const safeCompleted = Math.max(Number(completedTaskCount) || 0, 0);
  const percent = Math.max(0, Math.min((safeCompleted / safeTotal) * 100, 100));

  const size = 138;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#fbbf24"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: "drop-shadow(0 0 10px rgba(251,191,36,0.28))" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold leading-none text-white">
          {safeCompleted}/{safeTotal}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/45">
          done
        </p>
      </div>
    </div>
  );
}

function TaskTile({
  icon: Icon,
  title,
  reward,
  completed,
  hint,
}) {
  return (
    <div
      className={`rounded-[1.35rem] border p-3.5 transition ${
        completed
          ? "border-cyan-400/20 bg-cyan-500/10"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            completed
              ? "border-cyan-400/25 bg-cyan-400/12"
              : "border-white/10 bg-white/[0.04]"
          }`}
        >
          {Icon ? (
            <Icon className={`h-4.5 w-4.5 ${completed ? "text-cyan-300" : "text-white/75"}`} />
          ) : null}
        </div>

        <div
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            completed
              ? "border border-cyan-400/25 bg-cyan-400/12 text-cyan-200"
              : "border border-white/10 bg-white/[0.04] text-cyan-300"
          }`}
        >
          {reward}
        </div>
      </div>

      <div className="mt-3.5">
        <h3 className="text-[14px] font-semibold leading-[1.2] text-white">
          {title}
        </h3>
        <p className="mt-1.5 text-[11px] leading-[1.35] text-white/55 line-clamp-2">
          {hint}
        </p>
      </div>
    </div>
  );
}

export default function DashboardDailyTasksCard({
  tasks = [],
  completedTaskCount = 0,
  totalTasks = 4,
  badgeLabel = "Starter",
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      <div className="relative overflow-hidden rounded-[1.4rem] border border-amber-400/15 bg-gradient-to-br from-amber-500/10 via-orange-500/6 to-transparent px-4 py-5">
        <div className="pointer-events-none absolute -top-8 left-[-1rem] h-24 w-24 rounded-full bg-amber-400/8 blur-3xl" />
        <div className="pointer-events-none absolute right-[-1rem] top-[-1rem] h-20 w-20 rounded-full bg-orange-400/8 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-300/80">
                Daily Tasks
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Complete the loop. Build the habit.
              </p>
            </div>

            <div className="flex items-center gap-2 text-right">
              <Crown className="h-4 w-4 text-amber-300" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-amber-300/80">
                  Badge
                </p>
                <p className="text-sm font-semibold text-white">
                  {badgeLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <ProgressRing
              completedTaskCount={completedTaskCount}
              totalTasks={totalTasks}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {tasks.slice(0, 4).map((task) => (
          <TaskTile
            key={task.title}
            icon={task.icon}
            title={task.title}
            reward={task.reward}
            completed={task.completed}
            hint={task.hint}
          />
        ))}
      </div>
    </div>
  );
}