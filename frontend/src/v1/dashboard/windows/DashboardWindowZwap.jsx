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

  if (swapUnlocked) {
    return "Swap is ready when you are.\nYour progress can now turn into value.";
  }

  if (loopComplete) {
    return "You completed the loop.\nFull cycle done. That day counts.";
  }

  if (eventType === "milestone") {
    return "Milestone reached.\nThis is stacking. Keep building.";
  }

  if (eventType === "play_complete") {
    return "You just earned.\nThat action added to your progress.";
  }

  if (eventType === "move_progress") {
    return "You’re moving.\nSteps are being counted. Stay in motion.";
  }

  if (eventType === "task_complete") {
    return "Task complete.\nOne step closer. Don’t break the flow.";
  }

  if (gardenUnlocked) {
    return "Your effort is growing.\nConsistency is unlocking new layers.";
  }

  if (shopUnlocked) {
    return "Shop is ready.\nYou’ve earned enough to unlock value.";
  }

  if (learnUnlocked) {
    return "There’s more to explore.\nLearning opens new paths forward.";
  }

  if (completedTaskCount > 0) {
    return "Keep the loop going.\nOne more action completes your cycle.";
  }

  return "Start with one action.\nMove, play, or learn to begin your loop.";
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

function ZwapHeader() {
  return (
    <div className="relative z-10 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-300/35 bg-violet-400/14 text-[18px] shadow-[0_0_18px_rgba(168,85,247,0.18)]">
        <span className="translate-y-[1px]">🗣️</span>
      </div>

      <div className="bg-gradient-to-r from-cyan-200 via-violet-200 to-fuchsia-200 bg-clip-text text-[13px] font-black uppercase tracking-[0.22em] text-transparent">
        ZWAP!
      </div>
    </div>
  );
}

function GuidanceText({ guidance }) {
  const lines = String(guidance || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div>
      {lines.map((line, index) => (
        <div
          key={`${line}-${index}`}
          className={
            index === 0
              ? "text-[1.45rem] font-black leading-[1.04] tracking-[-0.06em] text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.08)]"
              : "mt-2 text-[0.82rem] font-bold leading-snug tracking-[-0.03em] text-white/62"
          }
        >
          {line}
        </div>
      ))}
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

  const shellClassName = [
    "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] border border-violet-300/16 p-4 text-left",
    "bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.1),transparent_38%),linear-gradient(180deg,rgba(17,24,39,0.98),rgba(7,10,18,1))]",
    "shadow-[0_16px_38px_rgba(0,0,0,0.34),0_0_28px_rgba(168,85,247,0.1)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isAltView && gardenUnlocked) {
    return (
      <div onClick={handleToggle} role="presentation" className="h-full min-h-0">
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
      <section onClick={handleToggle} className={shellClassName}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full bg-violet-400/14 blur-3xl" />
          <div className="absolute bottom-0 right-3 h-20 w-24 rounded-full bg-cyan-400/8 blur-2xl" />
          <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/28 to-transparent" />
        </div>

        <ZwapHeader />

        <div className="relative z-10 mt-2 text-[0.96rem] font-black leading-tight tracking-[-0.045em] text-white">
          Daily Tasks
        </div>

        <div className="relative z-10 mt-2 grid min-h-0 flex-1 grid-rows-4 gap-1.5 overflow-hidden">
          {taskItems.map((task) => (
            <div
              key={task.id}
              className="flex min-h-0 items-center justify-between rounded-[1.1rem] border border-white/10 bg-white/[0.045] px-2.5 py-1"
            >
              <div className="flex min-w-0 items-center gap-2">
                {task.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0 text-white/30" />
                )}

                <span
                  className={[
                    "whitespace-nowrap text-[0.72rem] font-bold tracking-[-0.025em]",
                    task.completed ? "text-white" : "text-white/66",
                  ].join(" ")}
                >
                  {task.label}
                </span>
              </div>

              <span
                className={[
                  "ml-2 shrink-0 text-[8px] font-black uppercase tracking-[0.12em]",
                  task.completed ? "text-cyan-300" : "text-white/38",
                ].join(" ")}
              >
                {task.completed ? "Done" : "Open"}
              </span>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-2 shrink-0 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.12em] text-white/50">
          {taskLabel}
        </div>
      </section>
    );
  }

  return (
    <section
      onClick={handleToggle}
      className={shellClassName}
      role="button"
      tabIndex={0}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full bg-violet-400/16 blur-3xl" />
        <div className="absolute bottom-0 right-3 h-20 w-24 rounded-full bg-cyan-400/8 blur-2xl" />
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/30 to-transparent" />
      </div>

      <ZwapHeader />

      <div className="relative z-10 flex flex-1 items-center py-4">
        <div className="max-w-[220px]">
          <GuidanceText guidance={guidance} />
        </div>
      </div>

      <div className="relative z-10 mt-auto shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-white/50">
        {taskLabel}
      </div>
    </section>
  );
}
