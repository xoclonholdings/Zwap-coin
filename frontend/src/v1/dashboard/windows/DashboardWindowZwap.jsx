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
  const loopComplete = completedTaskCount >= totalTaskCount && totalTaskCount > 0;

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

  if (isAltView && gardenUnlocked) {
    return (
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
    );
  }

  if (isAltView && !gardenUnlocked) {
    return (
      <section
        className={[
          "w-full rounded-[26px] border border-white/10 bg-[#0b1220] p-4 text-left shadow-[0_14px_34px_rgba(0,0,0,0.28)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex items-center gap-2">
          <div className="text-lg leading-none">🗣️</div>

          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            ZWAP!
          </div>
        </div>

        <div className="mt-3 text-[1.05rem] font-semibold tracking-[-0.03em] text-white">
          Tasks
        </div>

        <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-white/50">
          {taskLabel}
        </div>

        <div className="mt-4 space-y-3">
          {taskItems.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
            >
              <div className="flex items-center gap-2">
                {task.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                ) : (
                  <Circle className="h-4 w-4 text-white/30" />
                )}

                <span
                  className={[
                    "text-sm font-medium",
                    task.completed ? "text-white" : "text-white/60",
                  ].join(" ")}
                >
                  {task.label}
                </span>
              </div>

              <span
                className={[
                  "text-[10px] uppercase tracking-[0.12em]",
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

  return (
    <section
      className={[
        "w-full rounded-[26px] border border-white/10 bg-[#0b1220] p-4 text-left shadow-[0_14px_34px_rgba(0,0,0,0.28)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-2">
        <div className="text-lg leading-none">🗣️</div>

        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
          ZWAP!
        </div>
      </div>

      <div className="mt-3 text-[1.15rem] font-semibold leading-tight tracking-[-0.03em] text-white">
        {guidance}
      </div>

      <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/50">
        {taskLabel}
      </div>
    </section>
  );
}