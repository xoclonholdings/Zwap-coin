import React, { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import GardenWindow from "./garden/GardenWindow";

function buildTaskLabel(completed = 0, total = 4) {
  return `${completed} of ${total} tasks complete`;
}

function buildGuidance({
  systemMessage,
  nextStep,
  eventType,
  completedTaskCount,
  totalTaskCount,
  shopUnlocked,
  gardenUnlocked,
  learnUnlocked,
  swapUnlocked,
}) {
  const loopComplete =
    completedTaskCount >= totalTaskCount && totalTaskCount > 0;

  if (systemMessage) return systemMessage;
  if (nextStep) return nextStep;

  if (swapUnlocked) return "Swap is ready when you are.";
  if (eventType === "move_progress") return "You’re moving.";
  if (eventType === "play_complete") return "You just earned.";
  if (eventType === "task_complete") return "Task complete.";
  if (eventType === "milestone") return "Milestone reached.";
  if (loopComplete) return "You completed the loop.";
  if (gardenUnlocked) return "Your effort is growing.";
  if (shopUnlocked) return "Shop is ready.";
  if (learnUnlocked) return "There’s more to explore.";
  if (completedTaskCount > 0) return "Keep the loop going.";

  return "Start with one action.";
}

function buildTaskItems({
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

function ZwapVoiceIcon() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-300/28 bg-violet-400/12 text-[18px] shadow-[0_0_18px_rgba(168,85,247,0.16)]">
      <span className="translate-y-[1px]">🗣️</span>
    </div>
  );
}

export default function DashboardWindowZwap({
  isAltView = false,

  systemMessage = "",
  eventType = "",
  nextStep = "",

  completedTaskCount = 0,
  totalTaskCount = 4,

  shopUnlocked = false,
  gardenUnlocked = false,
  learnUnlocked = false,
  assistUnlocked = false,
  swapUnlocked = false,

  streakDays = 0,
  dailySteps = 0,
  gamesPlayedToday = 0,
  lessonsCompletedToday = 0,
  lastActiveAt = null,
  fullLoopCompleted = false,

  healthPercent = 0,
  growthStage = "seed",
  plantName = "Garden",
  rarePlantUnlocked = false,
  longestStreak = 0,
  totalBlooms = 0,
  activeDays = 0,
  missedDays = 0,
  daysUntilNextBloom = 0,
  nextRareUnlock = null,
  streakGraceDaysRemaining = 3,

  onToggleAltView,
  className = "",
}) {
  const taskLabel = buildTaskLabel(completedTaskCount, totalTaskCount);

  const guidance = useMemo(() => {
    return buildGuidance({
      systemMessage,
      nextStep,
      eventType,
      completedTaskCount,
      totalTaskCount,
      shopUnlocked,
      gardenUnlocked,
      learnUnlocked,
      swapUnlocked,
    });
  }, [
    systemMessage,
    nextStep,
    eventType,
    completedTaskCount,
    totalTaskCount,
    shopUnlocked,
    gardenUnlocked,
    learnUnlocked,
    swapUnlocked,
  ]);

  const taskItems = useMemo(() => {
    return buildTaskItems({
      completedTaskCount,
      learnUnlocked,
      shopUnlocked,
      assistUnlocked,
    });
  }, [completedTaskCount, learnUnlocked, shopUnlocked, assistUnlocked]);

  const handleToggle = () => {
    if (typeof onToggleAltView === "function") {
      onToggleAltView();
    }
  };

  if (isAltView && gardenUnlocked) {
    return (
      <div onClick={handleToggle} role="presentation">
        <GardenWindow
          streakDays={streakDays}
          dailySteps={dailySteps}
          gamesPlayedToday={gamesPlayedToday}
          lessonsCompletedToday={lessonsCompletedToday}
          lastActiveAt={lastActiveAt}
          fullLoopCompleted={fullLoopCompleted}
          healthPercent={healthPercent}
          growthStage={growthStage}
          plantName={plantName}
          rarePlantUnlocked={rarePlantUnlocked}
          longestStreak={longestStreak}
          totalBlooms={totalBlooms}
          activeDays={activeDays}
          missedDays={missedDays}
          daysUntilNextBloom={daysUntilNextBloom}
          nextRareUnlock={nextRareUnlock}
          streakGraceDaysRemaining={streakGraceDaysRemaining}
        />
      </div>
    );
  }

  if (isAltView && !gardenUnlocked) {
    return (
      <section
        onClick={handleToggle}
        className={[
          "relative flex min-h-[214px] w-full flex-col overflow-hidden rounded-[26px] border border-violet-300/16 p-4 text-left",
          "bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.09),transparent_38%),linear-gradient(180deg,rgba(17,24,39,0.98),rgba(7,10,18,1))]",
          "shadow-[0_16px_38px_rgba(0,0,0,0.34),0_0_28px_rgba(168,85,247,0.08)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full bg-violet-400/14 blur-3xl" />
          <div className="absolute bottom-0 right-3 h-20 w-24 rounded-full bg-cyan-400/8 blur-2xl" />
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/28 to-transparent" />
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <ZwapVoiceIcon />
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/78">
            ZWAP!
          </div>
        </div>

        <div className="relative z-10 mt-5 text-[1.25rem] font-black leading-tight tracking-[-0.05em] text-white">
          Daily Tasks
        </div>

        <div className="relative z-10 mt-4 space-y-2">
          {taskItems.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                {task.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                ) : (
                  <Circle className="h-4 w-4 text-white/30" />
                )}

                <span
                  className={[
                    "text-sm font-bold tracking-[-0.02em]",
                    task.completed ? "text-white" : "text-white/60",
                  ].join(" ")}
                >
                  {task.label}
                </span>
              </div>

              <span
                className={[
                  "text-[10px] font-black uppercase tracking-[0.12em]",
                  task.completed ? "text-cyan-300" : "text-white/35",
                ].join(" ")}
              >
                {task.completed ? "Done" : "Open"}
              </span>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-auto pt-4 text-[11px] font-black uppercase tracking-[0.16em] text-white/50">
          {taskLabel}
        </div>
      </section>
    );
  }

  return (
    <section
      onClick={handleToggle}
      className={[
        "relative flex min-h-[214px] w-full flex-col overflow-hidden rounded-[26px] border border-violet-300/16 p-4 text-left",
        "bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.1),transparent_38%),linear-gradient(180deg,rgba(17,24,39,0.98),rgba(7,10,18,1))]",
        "shadow-[0_16px_38px_rgba(0,0,0,0.34),0_0_28px_rgba(168,85,247,0.1)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="button"
      tabIndex={0}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full bg-violet-400/16 blur-3xl" />
        <div className="absolute bottom-0 right-3 h-20 w-24 rounded-full bg-cyan-400/8 blur-2xl" />
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/30 to-transparent" />
      </div>

      <div className="relative z-10 flex items-center gap-2">
        <ZwapVoiceIcon />
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/78">
          ZWAP!
        </div>
      </div>

      <div className="relative z-10 flex flex-1 items-center py-5">
        <div className="max-w-[220px] text-[1.5rem] font-black leading-[1.03] tracking-[-0.065em] text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.08)]">
          {guidance}
        </div>
      </div>

      <div className="relative z-10 mt-auto text-[11px] font-black uppercase tracking-[0.16em] text-white/50">
        {taskLabel}
      </div>
    </section>
  );
}