import React from "react";
import { Crown } from "lucide-react";
import DashboardTaskCard from "@/components/ui/dashboard/DashboardTaskCard";

function BadgeProgressMeter({
  completedTaskCount = 0,
  totalTasks = 4,
  badgeLabel = "Finisher",
  badgeHint = "Complete all daily tasks to progress this badge.",
  badgeProgress = 0,
  badgeGoal = 7,
}) {
  const safeGoal = Math.max(Number(badgeGoal) || 1, 1);
  const safeProgress = Math.max(Number(badgeProgress) || 0, 0);
  const percent = Math.max(0, Math.min((safeProgress / safeGoal) * 100, 100));

  const size = 132;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <div className="rounded-[1.5rem] border border-amber-400/15 bg-gradient-to-br from-amber-500/10 via-orange-500/6 to-transparent p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300/80">
            Badge Progress
          </p>
          <h3 className="mt-2 text-lg font-bold text-white">{badgeLabel}</h3>
          <p className="mt-1 text-[11px] text-gray-400">{badgeHint}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10">
          <Crown className="h-4 w-4 text-amber-300" />
        </div>
      </div>

      <div className="flex items-center justify-center">
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
            style={{ filter: "drop-shadow(0 0 8px rgba(251,191,36,0.28))" }}
          />
          <text
            x="50%"
            y="46%"
            textAnchor="middle"
            className="fill-white text-[18px] font-bold"
          >
            {safeProgress}/{safeGoal}
          </text>
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            className="fill-gray-500 text-[10px]"
          >
            days
          </text>
        </svg>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              Daily completion
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {completedTaskCount}/{totalTasks} tasks done
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              Bonus
            </p>
            <p className="mt-1 text-sm font-semibold text-amber-300">
              Full loop
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardDailyTasksCard({
  tasks = [],
  completedTaskCount = 0,
  totalTasks = 4,
  badgeLabel = "Finisher",
  badgeHint = "Complete all daily tasks to progress this badge.",
  badgeProgress = 0,
  badgeGoal = 7,
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Daily Tasks</h2>
          <p className="mt-1 text-[11px] text-gray-500">
            Complete the loop. Build the habit.
          </p>
        </div>

        <div className="self-start rounded-full border border-cyan-400/15 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
          {completedTaskCount}/{totalTasks} done
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {tasks.map((task) => (
            <DashboardTaskCard
              key={task.title}
              icon={task.icon}
              title={task.title}
              reward={task.reward}
              completed={task.completed}
              hint={task.hint}
            />
          ))}
        </div>

        <BadgeProgressMeter
          completedTaskCount={completedTaskCount}
          totalTasks={totalTasks}
          badgeLabel={badgeLabel}
          badgeHint={badgeHint}
          badgeProgress={badgeProgress}
          badgeGoal={badgeGoal}
        />
      </div>
    </div>
  );
}