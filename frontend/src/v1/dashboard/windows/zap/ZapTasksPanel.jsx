import React, { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";

function buildFallbackTaskItems({
  completedTaskCount = 0,
  learnUnlocked = false,
  shopUnlocked = false,
  assistUnlocked = false,
}) {
  const fourthLabel = assistUnlocked
    ? "Assist"
    : learnUnlocked
    ? "Learn"
    : shopUnlocked
    ? "Shop"
    : "Complete Loop";

  const labels = ["Login", "Move", "Play", fourthLabel];

  return labels.map((label, index) => ({
    id: `${label.toLowerCase().replace(/\s+/g, "-")}-${index}`,
    label,
    completed: index < completedTaskCount,
  }));
}

function normalizeTaskItems(taskStates = []) {
  if (!Array.isArray(taskStates) || taskStates.length === 0) return [];

  return taskStates.slice(0, 4).map((task, index) => {
    const label = task?.label || `Task ${index + 1}`;

    return {
      id:
        task?.id ||
        `${String(label).toLowerCase().replace(/\s+/g, "-")}-${index}`,
      label,
      completed: Boolean(task?.completed),
    };
  });
}

function ZwapHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-300/35 bg-violet-400/14 shadow-[0_0_18px_rgba(168,85,247,0.18)]">
        <span className="text-[16px]">📋</span>
      </div>

      <div className="bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200 bg-clip-text text-[13px] font-black uppercase tracking-[0.22em] text-transparent">
        ZWAP!
      </div>
    </div>
  );
}

export default function ZapTasksPanel({
  completedTaskCount = 0,
  taskStates = [],
  learnUnlocked = false,
  shopUnlocked = false,
  assistUnlocked = false,
  className = "",
}) {
  const taskItems = useMemo(() => {
    const normalizedItems = normalizeTaskItems(taskStates);

    if (normalizedItems.length > 0) {
      return normalizedItems;
    }

    return buildFallbackTaskItems({
      completedTaskCount,
      learnUnlocked,
      shopUnlocked,
      assistUnlocked,
    });
  }, [
    taskStates,
    completedTaskCount,
    learnUnlocked,
    shopUnlocked,
    assistUnlocked,
  ]);

  return (
    <section
      className={[
        "relative flex h-full w-full flex-col overflow-hidden rounded-[26px] border border-violet-300/16 p-4 text-left",
        "bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.1),transparent_38%),linear-gradient(180deg,rgba(17,24,39,0.98),rgba(7,10,18,1))]",
        "shadow-[0_16px_38px_rgba(0,0,0,0.34),0_0_28px_rgba(168,85,247,0.1)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full bg-violet-400/14 blur-3xl" />
        <div className="absolute bottom-0 right-3 h-20 w-24 rounded-full bg-cyan-400/8 blur-2xl" />
      </div>

      <ZwapHeader />

      <div className="relative z-10 mt-2 text-[0.95rem] font-black tracking-[-0.03em] text-white">
        Daily Tasks
      </div>

      <div className="relative z-10 mt-2 grid flex-1 grid-rows-4 gap-1.5">
        {taskItems.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-[1.1rem] border border-white/10 bg-white/[0.045] px-3 py-1.5"
          >
            <div className="flex items-center gap-2">
              {task.completed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-white/30" />
              )}

              <span
                className={[
                  "text-[0.72rem] font-bold tracking-[-0.02em]",
                  task.completed ? "text-white" : "text-white/65",
                ].join(" ")}
              >
                {task.label}
              </span>
            </div>

            <span
              className={[
                "text-[8px] font-black uppercase tracking-[0.12em]",
                task.completed ? "text-cyan-300" : "text-white/35",
              ].join(" ")}
            >
              {task.completed ? "Done" : "Open"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}