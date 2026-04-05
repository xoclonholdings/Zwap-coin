import React from "react";
import { Crown } from "lucide-react";

function ProgressRing({
  completedTaskCount = 0,
  totalTasks = 4,
}) {
  const safeTotal = Math.max(Number(totalTasks) || 1, 1);
  const safeCompleted = Math.max(Number(completedTaskCount) || 0, 0);
  const percent = Math.max(0, Math.min((safeCompleted / safeTotal) * 100, 100));

  const size = 124;
  const stroke = 11;
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
        <p className="text-[28px] font-bold leading-none text-white">
          {safeCompleted}/{safeTotal}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
          done
        </p>
      </div>
    </div>
  );
}

function getTaskTone(title = "", completed = false) {
  const value = title.toLowerCase();

  if (value.includes("login")) {
    return {
      shell: completed
        ? "border-cyan-400/28 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_48%),linear-gradient(180deg,rgba(8,30,40,0.92),rgba(10,16,28,0.96))] shadow-[0_0_22px_rgba(34,211,238,0.08)]"
        : "border-cyan-400/18 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_48%),rgba(255,255,255,0.04)]",
      iconWrap: "border-cyan-400/25 bg-cyan-400/12",
      icon: "text-cyan-300",
      chip: completed
        ? "border-cyan-400/25 bg-cyan-400/14 text-cyan-200"
        : "border-cyan-400/18 bg-cyan-400/10 text-cyan-300",
    };
  }

  if (value.includes("learn")) {
    return {
      shell: completed
        ? "border-violet-400/28 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_48%),linear-gradient(180deg,rgba(22,14,42,0.92),rgba(12,12,28,0.96))] shadow-[0_0_22px_rgba(168,85,247,0.08)]"
        : "border-violet-400/18 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.12),_transparent_48%),rgba(255,255,255,0.04)]",
      iconWrap: "border-violet-400/25 bg-violet-400/12",
      icon: "text-violet-300",
      chip: completed
        ? "border-violet-400/25 bg-violet-400/14 text-violet-200"
        : "border-violet-400/18 bg-violet-400/10 text-violet-300",
    };
  }

  if (value.includes("play") || value.includes("round")) {
    return {
      shell: completed
        ? "border-pink-400/28 bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_48%),linear-gradient(180deg,rgba(36,14,34,0.92),rgba(16,12,26,0.96))] shadow-[0_0_22px_rgba(244,114,182,0.08)]"
        : "border-pink-400/18 bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.12),_transparent_48%),rgba(255,255,255,0.04)]",
      iconWrap: "border-pink-400/25 bg-pink-400/12",
      icon: "text-pink-300",
      chip: completed
        ? "border-pink-400/25 bg-pink-400/14 text-pink-200"
        : "border-pink-400/18 bg-pink-400/10 text-pink-300",
    };
  }

  return {
    shell: completed
      ? "border-emerald-400/28 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_48%),linear-gradient(180deg,rgba(10,34,34,0.92),rgba(10,16,24,0.96))] shadow-[0_0_22px_rgba(45,212,191,0.08)]"
      : "border-emerald-400/18 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.12),_transparent_48%),rgba(255,255,255,0.04)]",
    iconWrap: "border-emerald-400/25 bg-emerald-400/12",
    icon: "text-emerald-300",
    chip: completed
      ? "border-emerald-400/25 bg-emerald-400/14 text-emerald-200"
      : "border-emerald-400/18 bg-emerald-400/10 text-emerald-300",
  };
}

function TaskTile({
  icon: Icon,
  title,
  reward,
  completed,
  hint,
}) {
  const tone = getTaskTone(title, completed);

  return (
    <div
      className={`rounded-[1.35rem] border p-3.5 transition ${tone.shell}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${tone.iconWrap}`}
        >
          {Icon ? <Icon className={`h-4.5 w-4.5 ${tone.icon}`} /> : null}
        </div>

        <div
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.chip}`}
        >
          +{reward}
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

          <div className="mt-4 flex justify-center pb-1">
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