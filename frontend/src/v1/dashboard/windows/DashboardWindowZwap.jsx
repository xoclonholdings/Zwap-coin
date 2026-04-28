import React, { useMemo } from "react";

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function formatNumber(value) {
  return toNumber(value, 0).toLocaleString();
}

function buildTaskLabel(completed = 0, total = 4) {
  return `${completed} of ${total} tasks complete`;
}

function getNextUnlock({
  zptsBalance = 0,
  shopUnlocked = false,
  learnUnlocked = false,
  swapUnlocked = false,
}) {
  if (!shopUnlocked) {
    return {
      label: "Shop",
      required: 1000,
      remaining: Math.max(0, 1000 - zptsBalance),
    };
  }

  if (!learnUnlocked) {
    return {
      label: "Learn",
      required: 1500,
      remaining: Math.max(0, 1500 - zptsBalance),
    };
  }

  if (!swapUnlocked) {
    return {
      label: "Swap",
      required: 3000,
      remaining: Math.max(0, 3000 - zptsBalance),
    };
  }

  return {
    label: "Next reward",
    required: 0,
    remaining: 0,
  };
}

function buildZapGuidance({
  systemMessage,
  nextStep,
  eventType,

  completedTaskCount = 0,
  totalTaskCount = 4,

  zptsBalance = 0,

  dailySteps = 0,
  stepGoal = 10000,

  gamesPlayedToday = 0,
  playGoal = 1,

  shopUnlocked = false,
  learnUnlocked = false,
  swapUnlocked = false,
}) {
  if (systemMessage) return systemMessage;
  if (nextStep) return nextStep;

  const safeZpts = toNumber(zptsBalance, 0);
  const safeSteps = toNumber(dailySteps, 0);
  const safeStepGoal = Math.max(1, toNumber(stepGoal, 10000));
  const safeGames = toNumber(gamesPlayedToday, 0);
  const safePlayGoal = Math.max(1, toNumber(playGoal, 1));

  const loopComplete =
    completedTaskCount >= totalTaskCount && totalTaskCount > 0;

  const moveComplete = safeSteps >= safeStepGoal;
  const playComplete = safeGames >= safePlayGoal;

  const nextUnlock = getNextUnlock({
    zptsBalance: safeZpts,
    shopUnlocked,
    learnUnlocked,
    swapUnlocked,
  });

  if (swapUnlocked) {
    return `Swap is ready.\nYou have ${formatNumber(safeZpts)} zPts.\nSpend, hold, or swap with intention.`;
  }

  if (loopComplete) {
    return `Daily loop complete.\nYou have ${formatNumber(safeZpts)} zPts.\nThat progress counts toward your next unlock.`;
  }

  if (eventType === "move_progress" || (!moveComplete && safeSteps > 0)) {
    return `You’re moving.\n${formatNumber(safeSteps)} of ${formatNumber(safeStepGoal)} steps logged.\nKeep moving to strengthen today’s loop.`;
  }

  if (eventType === "play_complete" || safeGames > 0) {
    return `You just played.\n${safeGames} of ${safePlayGoal} play goals complete.\nOne more action can push your loop forward.`;
  }

  if (eventType === "milestone") {
    return `Milestone reached.\nYou have ${formatNumber(safeZpts)} zPts.\nKeep stacking progress toward ${nextUnlock.label}.`;
  }

  if (shopUnlocked && safeZpts < 500) {
    return `Shop is open.\nYou have ${formatNumber(safeZpts)} zPts.\nSave a little more before spending.`;
  }

  if (shopUnlocked) {
    return `Shop is open.\nYou have ${formatNumber(safeZpts)} zPts.\nCheck rewards, but spend with a plan.`;
  }

  if (learnUnlocked) {
    return `Learn is open.\nYou have ${formatNumber(safeZpts)} zPts.\nUse Learn to earn while building skill.`;
  }

  if (completedTaskCount > 0) {
    return `${completedTaskCount} of ${totalTaskCount} tasks complete.\nYou have ${formatNumber(safeZpts)} zPts.\nMove or play next to keep the loop going.`;
  }

  if (nextUnlock.remaining > 0) {
    return `Hey, I’m Zap.\nYou have ${formatNumber(safeZpts)} zPts.\nEarn ${formatNumber(nextUnlock.remaining)} more to unlock ${nextUnlock.label}.`;
  }

  return `Hey, I’m Zap.\nI’ll be your guide.\nMove, play, or earn zPts to begin.`;
}

function ZwapHeader() {
  return (
    <div className="relative z-10 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-300/35 bg-violet-400/14 text-[18px] shadow-[0_0_18px_rgba(168,85,247,0.18)]">
        <span className="translate-y-[1px]">🤖</span>
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
              ? "text-[1.32rem] font-black leading-[1.04] tracking-[-0.06em] text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.08)]"
              : "mt-2 text-[0.76rem] font-bold leading-snug tracking-[-0.03em] text-white/64"
          }
        >
          {line}
        </div>
      ))}
    </div>
  );
}

export default function DashboardWindowZwap({
  systemMessage = "",
  eventType = "",
  nextStep = "",

  completedTaskCount = 0,
  totalTaskCount = 4,

  zptsBalance = 0,

  dailySteps = 0,
  stepGoal = 10000,

  gamesPlayedToday = 0,
  playGoal = 1,

  shopUnlocked = false,
  learnUnlocked = false,
  swapUnlocked = false,

  className = "",
}) {
  const taskLabel = buildTaskLabel(completedTaskCount, totalTaskCount);

  const guidance = useMemo(() => {
    return buildZapGuidance({
      systemMessage,
      nextStep,
      eventType,
      completedTaskCount,
      totalTaskCount,
      zptsBalance,
      dailySteps,
      stepGoal,
      gamesPlayedToday,
      playGoal,
      shopUnlocked,
      learnUnlocked,
      swapUnlocked,
    });
  }, [
    systemMessage,
    nextStep,
    eventType,
    completedTaskCount,
    totalTaskCount,
    zptsBalance,
    dailySteps,
    stepGoal,
    gamesPlayedToday,
    playGoal,
    shopUnlocked,
    learnUnlocked,
    swapUnlocked,
  ]);

  return (
    <section
      className={[
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[26px] border border-violet-300/16 p-4 text-left",
        "bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.1),transparent_38%),linear-gradient(180deg,rgba(17,24,39,0.98),rgba(7,10,18,1))]",
        "shadow-[0_16px_38px_rgba(0,0,0,0.34),0_0_28px_rgba(168,85,247,0.1)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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