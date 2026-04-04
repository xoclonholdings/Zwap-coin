import React from "react";
import DashboardTaskCard from "@/components/ui/dashboard/DashboardTaskCard";

export default function DashboardTasksCard({
  tasks = [],
  completedTaskCount = 0,
  totalTasks = 4,
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
    </div>
  );
}