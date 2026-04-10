import React, { useMemo } from "react";
import { CheckSquare, ChevronRight } from "lucide-react";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function buildStatusLine({
  completedTasks,
  totalTasks,
  isComplete,
}) {
  if (isComplete) {
    return "Daily loop complete";
  }

  const remaining = Math.max(0, totalTasks - completedTasks);

  if (completedTasks === 0) {
    return "Ready to finish today";
  }

  if (remaining === 1) {
    return "1 task left";
  }

  return `${completedTasks} of ${totalTasks} complete`;
}

function MiniTaskPreview({
  taskStates = [],
  maxItems = 4,
  isComplete = false,
}) {
  const visibleTasks = taskStates.slice(0, maxItems);

  if (!visibleTasks.length) return null;

  return (
    <div className="mt-4 flex items-center gap-2">
      {visibleTasks.map((task, index) => {
        const completed = Boolean(task?.completed);
        const label = String(task?.label || "").trim();

        return (
          <div
            key={`${label || "task"}-${index}`}
            className={`inline-flex min-w-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.02em] ${
              completed
                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                : isComplete
                ? "border-violet-400/20 bg-violet-400/10 text-violet-200"
                : "border-white/10 bg-white/[0.04] text-white/58"
            }`}
          >
            <span className="truncate">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardWindowTasks({
  completedTasks = 0,
  totalTasks = 4,
  taskStates = [
    { label: "Login", completed: false },
    { label: "Move", completed: false },
    { label: "Play", completed: false },
    { label: "Learn", completed: false },
  ],
  onOpenTasks,
  className = "",
}) {
  const safeTotalTasks = Math.max(1, Number(totalTasks || 1));
  const safeCompletedTasks = clamp(Number(completedTasks || 0), 0, safeTotalTasks);
  const progress = safeCompletedTasks / safeTotalTasks;
  const isComplete = safeCompletedTasks >= safeTotalTasks;

  const statusLine = useMemo(() => {
    return buildStatusLine({
      completedTasks: safeCompletedTasks,
      totalTasks: safeTotalTasks,
      isComplete,
    });
  }, [safeCompletedTasks, safeTotalTasks, isComplete]);

  const handleClick = () => {
    if (typeof onOpenTasks === "function") {
      onOpenTasks();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "group relative w-full overflow-hidden rounded-[26px] border p-4 text-left transition active:scale-[0.99]",
        isComplete
          ? "border-violet-400/22 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_38%),linear-gradient(180deg,rgba(18,16,32,0.96),rgba(8,10,18,0.98))] shadow-[0_0_28px_rgba(168,85,247,0.10)]"
          : "border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_34%),linear-gradient(180deg,rgba(12,18,26,0.96),rgba(6,10,16,0.98))] shadow-[0_14px_34px_rgba(0,0,0,0.26)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Open tasks"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute inset-x-8 top-0 h-16 rounded-full bg-cyan-400/8 blur-2xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                  isComplete
                    ? "border-violet-400/22 bg-violet-400/12 text-violet-200"
                    : "border-cyan-400/16 bg-cyan-400/8 text-cyan-200"
                }`}
              >
                <CheckSquare className="h-[17px] w-[17px]" strokeWidth={2.1} />
              </div>

              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
                Tasks
              </div>
            </div>

            <div className="mt-3 text-sm font-medium tracking-[-0.02em] text-white/72">
              {statusLine}
            </div>
          </div>

          <div className="mt-0.5 shrink-0 text-white/32 transition group-hover:text-white/56">
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.1} />
          </div>
        </div>

        <MiniTaskPreview
          taskStates={taskStates}
          maxItems={4}
          isComplete={isComplete}
        />

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium tracking-[-0.02em] text-white/46">
              Today
            </span>
            <span className="text-[11px] font-medium tracking-[-0.02em] text-white/62">
              {safeCompletedTasks} / {safeTotalTasks}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isComplete
                  ? "bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 shadow-[0_0_16px_rgba(168,85,247,0.22)]"
                  : "bg-gradient-to-r from-cyan-400/90 via-teal-400/90 to-violet-400/80 shadow-[0_0_12px_rgba(34,211,238,0.14)]"
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}