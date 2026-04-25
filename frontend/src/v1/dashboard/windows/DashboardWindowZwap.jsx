import React, { useMemo } from "react";
import {
  ChevronRight,
  Circle,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import GardenWindow from "./garden/GardenWindow";

function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function buildTaskLabel(completedTaskCount = 0, totalTaskCount = 4) {
  return `${completedTaskCount} of ${totalTaskCount} tasks complete`;
}

function buildAltTaskItems({
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

function pickGuidancePills({
  shopUnlocked,
  gardenUnlocked,
  badgeVisibilityUnlocked,
  learnUnlocked,
  streamUnlocked,
  assistUnlocked,
  swapUnlocked,
  profileNeedsSetup,
  hasNewHighScore,
  canSpendZpts,
  shouldSaveZpts,
}) {
  const pills = [];

  if (profileNeedsSetup) {
    pills.push({ label: "Update Profile", tone: "active" });
  }

  if (hasNewHighScore) {
    pills.push({ label: "New High Score", tone: "active" });
  }

  if (shopUnlocked) {
    pills.push({
      label: canSpendZpts ? "Check Shop" : shouldSaveZpts ? "Save zPts" : "Shop Open",
      tone: "active",
    });
  } else {
    pills.push({ label: "Shop Locked", tone: "locked" });
  }

  if (gardenUnlocked) {
    pills.push({ label: "Garden Active", tone: "active" });
  }

  if (badgeVisibilityUnlocked) {
    pills.push({ label: "View Badges", tone: "active" });
  }

  if (learnUnlocked) {
    pills.push({ label: "Learn Open", tone: "active" });
  } else {
    pills.push({ label: "Learn Locked", tone: "locked" });
  }

  if (streamUnlocked) {
    pills.push({ label: "Stream Open", tone: "active" });
  }

  if (assistUnlocked) {
    pills.push({ label: "Assist Ready", tone: "active" });
  }

  if (swapUnlocked) {
    pills.push({ label: "Swap Ready", tone: "active" });
  } else {
    pills.push({ label: "Swap Locked", tone: "locked" });
  }

  return pills.slice(0, 3);
}

function GuidancePill({ label, tone = "locked" }) {
  const isActive = tone === "active";

  return (
    <div
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1",
        "text-[10px] font-black uppercase tracking-[0.1em]",
        isActive
          ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 bg-white/[0.04] text-white/48",
      ].join(" ")}
    >
      {!isActive ? <Lock className="h-3 w-3" strokeWidth={2.2} /> : null}
      <span>{label}</span>
    </div>
  );
}

function buildVoiceMessage({
  systemMessage,
  nextStep,
  eventType,
  completedTaskCount,
  totalTaskCount,
  shopUnlocked,
  gardenUnlocked,
  badgeVisibilityUnlocked,
  learnUnlocked,
  streamUnlocked,
  assistUnlocked,
  swapUnlocked,
  profileNeedsSetup,
  hasNewHighScore,
  canSpendZpts,
  shouldSaveZpts,
}) {
  const loopComplete = completedTaskCount >= totalTaskCount && totalTaskCount > 0;

  if (systemMessage) {
    return {
      eyebrow: "SYSTEM GUIDANCE",
      primary: systemMessage,
      secondary: nextStep || "",
    };
  }

  if (swapUnlocked) {
    return {
      eyebrow: "SWAP READY",
      primary: "Value is becoming real.",
      secondary: nextStep || "Spend, hold, or swap with intention.",
    };
  }

  if (eventType === "milestone") {
    return {
      eyebrow: "MILESTONE",
      primary: "Milestone reached.",
      secondary: nextStep || "Your progress is starting to show.",
    };
  }

  if (eventType === "move_progress") {
    return {
      eyebrow: "MOVE ACTIVE",
      primary: "You’re moving.",
      secondary: nextStep || "Keep the rhythm going.",
    };
  }

  if (eventType === "play_complete") {
    return {
      eyebrow: "PLAY COMPLETE",
      primary: "You just earned.",
      secondary: nextStep || "That moved the system forward.",
    };
  }

  if (loopComplete) {
    return {
      eyebrow: "DAILY LOOP",
      primary: gardenUnlocked ? "Your effort has taken form." : "Daily loop complete.",
      secondary: gardenUnlocked
        ? "Your garden is responding."
        : "That day counts.",
    };
  }

  if (gardenUnlocked) {
    return {
      eyebrow: "GARDEN ACTIVE",
      primary: "Something is growing now.",
      secondary: "A little consistency keeps it alive.",
    };
  }

  if (profileNeedsSetup) {
    return {
      eyebrow: "PROFILE",
      primary: "Your profile still has room to grow.",
      secondary: "Add identity to your progress.",
    };
  }

  if (hasNewHighScore) {
    return {
      eyebrow: "PLAY SIGNAL",
      primary: "A new high score is waiting.",
      secondary: "Your last session changed something.",
    };
  }

  if (badgeVisibilityUnlocked) {
    return {
      eyebrow: "BADGES",
      primary: "Your identity layer is opening.",
      secondary: "Check your badges and see what is forming.",
    };
  }

  if (learnUnlocked) {
    return {
      eyebrow: "LEARN OPEN",
      primary: "Learn is open now.",
      secondary: "Knowledge adds another route forward.",
    };
  }

  if (streamUnlocked) {
    return {
      eyebrow: "STREAM OPEN",
      primary: "Stream is live.",
      secondary: "Try a walk-and-listen session.",
    };
  }

  if (assistUnlocked) {
    return {
      eyebrow: "ASSIST READY",
      primary: "Support is part of the system now.",
      secondary: "You can move more than your own score.",
    };
  }

  if (shopUnlocked && canSpendZpts) {
    return {
      eyebrow: "SHOP OPEN",
      primary: "Shop is open.",
      secondary: "Spend carefully or hold for something bigger.",
    };
  }

  if (shopUnlocked && shouldSaveZpts) {
    return {
      eyebrow: "ZPTS STRATEGY",
      primary: "You could spend now.",
      secondary: "Saving might open something heavier later.",
    };
  }

  if (shopUnlocked) {
    return {
      eyebrow: "SHOP READY",
      primary: "Shop is ready.",
      secondary: "Effort has started opening value.",
    };
  }

  if (completedTaskCount > 0) {
    return {
      eyebrow: "TODAY",
      primary: "You’re in motion.",
      secondary: "A little more completes the loop.",
    };
  }

  return {
    eyebrow: "START HERE",
    primary: "Ready when you are.",
    secondary: "Move, play, or earn zPts to wake the system.",
  };
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
  badgeVisibilityUnlocked = false,
  learnUnlocked = false,
  streamUnlocked = false,
  assistUnlocked = false,
  swapUnlocked = false,

  profileNeedsSetup = false,
  hasNewHighScore = false,
  canSpendZpts = false,
  shouldSaveZpts = false,

  zptsPercent = 0,

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

  onOpenZwap,
  className = "",
}) {
  const taskLine = buildTaskLabel(completedTaskCount, totalTaskCount);
  const safeZptsPercent = clampPercent(zptsPercent);

  const voiceContent = useMemo(() => {
    return buildVoiceMessage({
      systemMessage,
      nextStep,
      eventType,
      completedTaskCount,
      totalTaskCount,
      shopUnlocked,
      gardenUnlocked,
      badgeVisibilityUnlocked,
      learnUnlocked,
      streamUnlocked,
      assistUnlocked,
      swapUnlocked,
      profileNeedsSetup,
      hasNewHighScore,
      canSpendZpts,
      shouldSaveZpts,
    });
  }, [
    systemMessage,
    nextStep,
    eventType,
    completedTaskCount,
    totalTaskCount,
    shopUnlocked,
    gardenUnlocked,
    badgeVisibilityUnlocked,
    learnUnlocked,
    streamUnlocked,
    assistUnlocked,
    swapUnlocked,
    profileNeedsSetup,
    hasNewHighScore,
    canSpendZpts,
    shouldSaveZpts,
  ]);

  const guidancePills = useMemo(() => {
    return pickGuidancePills({
      shopUnlocked,
      gardenUnlocked,
      badgeVisibilityUnlocked,
      learnUnlocked,
      streamUnlocked,
      assistUnlocked,
      swapUnlocked,
      profileNeedsSetup,
      hasNewHighScore,
      canSpendZpts,
      shouldSaveZpts,
    });
  }, [
    shopUnlocked,
    gardenUnlocked,
    badgeVisibilityUnlocked,
    learnUnlocked,
    streamUnlocked,
    assistUnlocked,
    swapUnlocked,
    profileNeedsSetup,
    hasNewHighScore,
    canSpendZpts,
    shouldSaveZpts,
  ]);

  const altTaskItems = useMemo(() => {
    return buildAltTaskItems({
      completedTaskCount,
      learnUnlocked,
      shopUnlocked,
      assistUnlocked,
    });
  }, [completedTaskCount, learnUnlocked, shopUnlocked, assistUnlocked]);

  const handleClick = () => {
    if (typeof onOpenZwap === "function") {
      onOpenZwap();
    }
  };

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
          "relative w-full overflow-hidden rounded-[26px] border border-white/10 p-4",
          "bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),linear-gradient(180deg,rgba(12,19,30,0.98),rgba(6,10,17,1))]",
          "shadow-[0_14px_34px_rgba(0,0,0,0.28)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-10 left-1/2 h-24 w-36 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-4 h-16 w-20 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200/75">
                ZWAP! TASKS
              </div>
              <div className="mt-2 text-[1.35rem] font-black leading-none tracking-[-0.05em] text-white">
                Daily Loop
              </div>
              <div className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/52">
                {taskLine}
              </div>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/52">
              Swipe State
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {altTaskItems.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-cyan-300" strokeWidth={2.2} />
                  ) : (
                    <Circle className="h-5 w-5 text-white/30" strokeWidth={2.2} />
                  )}

                  <span
                    className={[
                      "text-sm font-extrabold tracking-[-0.02em]",
                      task.completed ? "text-white" : "text-white/58",
                    ].join(" ")}
                  >
                    {task.label}
                  </span>
                </div>

                <span
                  className={[
                    "text-[10px] font-black uppercase tracking-[0.14em]",
                    task.completed ? "text-cyan-300" : "text-white/35",
                  ].join(" ")}
                >
                  {task.completed ? "Done" : "Open"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "group relative w-full overflow-hidden rounded-[26px] border p-4 text-left transition active:scale-[0.99]",
        "border-cyan-300/16 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.17),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_38%),linear-gradient(180deg,rgba(12,20,34,0.98),rgba(6,10,18,1))]",
        "shadow-[0_16px_38px_rgba(0,0,0,0.34),0_0_28px_rgba(34,211,238,0.08)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Open ZWAP system window"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full bg-cyan-400/14 blur-3xl" />
        <div className="absolute bottom-0 right-3 h-20 w-24 rounded-full bg-violet-400/14 blur-2xl" />
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />
      </div>

      <div className="relative z-10 flex h-full min-h-[188px] flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/24 bg-cyan-300/12 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.14)]">
                <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100/76">
                  ZWAP!
                </div>
                <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/35">
                  {voiceContent.eyebrow}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="max-w-[190px] text-[1.35rem] font-black leading-[1.02] tracking-[-0.06em] text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.08)]">
                {voiceContent.primary}
              </div>

              {voiceContent.secondary ? (
                <div className="mt-2 max-w-[190px] text-[0.78rem] font-bold leading-snug tracking-[-0.03em] text-white/62">
                  {voiceContent.secondary}
                </div>
              ) : null}

              <div className="mt-3 inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100/72">
                {taskLine}
              </div>
            </div>
          </div>

          <div className="mt-1 shrink-0 text-white/36 transition group-hover:text-white/70">
            <ChevronRight className="h-[19px] w-[19px]" strokeWidth={2.3} />
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {guidancePills.map((pill) => (
              <GuidancePill
                key={`${pill.label}-${pill.tone}`}
                label={pill.label}
                tone={pill.tone}
              />
            ))}
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-violet-300 shadow-[0_0_12px_rgba(34,211,238,0.18)]"
              style={{ width: `${Math.max(8, safeZptsPercent || 8)}%` }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}