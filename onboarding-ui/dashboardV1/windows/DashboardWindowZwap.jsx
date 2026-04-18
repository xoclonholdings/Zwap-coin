import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, ChevronRight, Lock } from "lucide-react";

const DEFAULT_IDLE_MESSAGES = [
  "Ready when you are.",
  "A little movement starts the loop.",
  "Progress begins with one action.",
  "You can open this up today.",
];

function buildTaskLabel(completedTaskCount = 0, totalTaskCount = 4) {
  return `${completedTaskCount} of ${totalTaskCount} tasks complete`;
}

function pickHints({
  shopUnlocked,
  gardenUnlocked = false,
  badgeVisibilityUnlocked = false,
  learnUnlocked = false,
  streamUnlocked = false,
  assistUnlocked = false,
  swapUnlocked = false,
  hasNewHighScore = false,
  profileNeedsSetup = false,
  canSpendZpts = false,
  shouldSaveZpts = false,
}) {
  const hints = [];

  if (profileNeedsSetup) {
    hints.push({ label: "Update Profile", unlocked: true });
  }

  if (hasNewHighScore) {
    hints.push({ label: "New High Score", unlocked: true });
  }

  if (shopUnlocked) {
    hints.push({
      label: canSpendZpts ? "Check Shop" : shouldSaveZpts ? "Save zPts" : "Shop Open",
      unlocked: true,
    });
  } else {
    hints.push({ label: "Shop", unlocked: false });
  }

  if (gardenUnlocked) {
    hints.push({ label: "Garden Active", unlocked: true });
  }

  if (badgeVisibilityUnlocked) {
    hints.push({ label: "View Badges", unlocked: true });
  }

  if (learnUnlocked) {
    hints.push({ label: "Learn Open", unlocked: true });
  } else {
    hints.push({ label: "Learn", unlocked: false });
  }

  if (streamUnlocked) {
    hints.push({ label: "Stream Open", unlocked: true });
  } else {
    hints.push({ label: "Stream", unlocked: false });
  }

  if (assistUnlocked) {
    hints.push({ label: "Assist Ready", unlocked: true });
  }

  if (!swapUnlocked) {
    hints.push({ label: "Swap", unlocked: false });
  } else {
    hints.push({ label: "Swap Ready", unlocked: true });
  }

  return hints.slice(0, 3);
}

function HintPill({ label, unlocked = false }) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-[0.02em] ${
        unlocked
          ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
          : "border-white/10 bg-white/[0.04] text-white/52"
      }`}
    >
      {!unlocked ? <Lock className="h-3 w-3" strokeWidth={2.1} /> : null}
      <span>{label}</span>
    </div>
  );
}

function buildVoiceMessage({
  mode,
  systemMessage,
  nextStep,
  eventType,
  completedTaskCount,
  totalTaskCount,
  shopUnlocked,
  gardenUnlocked,
  learnUnlocked,
  streamUnlocked,
  assistUnlocked,
  swapUnlocked,
  badgeVisibilityUnlocked,
  profileNeedsSetup,
  hasNewHighScore,
  canSpendZpts,
  shouldSaveZpts,
}) {
  const taskLine = buildTaskLabel(completedTaskCount, totalTaskCount);

  if (systemMessage) {
    return {
      primary: systemMessage,
      secondary: nextStep || "",
      taskLine,
    };
  }

  if (swapUnlocked) {
    return {
      primary: "Value is becoming real.",
      secondary: nextStep || "Spend, hold, or swap with intention.",
      taskLine,
    };
  }

  if (eventType === "milestone") {
    return {
      primary: "Milestone reached.",
      secondary: nextStep || "Your progress is starting to show.",
      taskLine,
    };
  }

  if (eventType === "shop_unlock") {
    return {
      primary: "Shop is ready.",
      secondary: nextStep || "Effort just opened value.",
      taskLine,
    };
  }

  if (eventType === "garden_unlock" || gardenUnlocked) {
    if (completedTaskCount >= totalTaskCount && totalTaskCount > 0) {
      return {
        primary: "Your effort has taken form.",
        secondary: nextStep || "Daily loop complete. Your garden is responding.",
        taskLine,
      };
    }

    return {
      primary: "Something is growing now.",
      secondary: nextStep || "Consistency unlocked a living layer.",
      taskLine,
    };
  }

  if (eventType === "full_loop" || (completedTaskCount >= totalTaskCount && totalTaskCount > 0)) {
    return {
      primary: "Daily loop complete.",
      secondary: nextStep || "That day counts.",
      taskLine,
    };
  }

  if (eventType === "task_complete") {
    return {
      primary: "Task complete.",
      secondary: nextStep || "Keep the loop moving.",
      taskLine,
    };
  }

  if (eventType === "play_complete") {
    return {
      primary: "You just earned.",
      secondary: nextStep || "That moved the system forward.",
      taskLine,
    };
  }

  if (eventType === "move_progress") {
    return {
      primary: "You’re moving.",
      secondary: nextStep || "Keep the rhythm going.",
      taskLine,
    };
  }

  if (profileNeedsSetup) {
    return {
      primary: "Your profile still has room to grow.",
      secondary: nextStep || "Add identity to your progress.",
      taskLine,
    };
  }

  if (hasNewHighScore) {
    return {
      primary: "A new high score is waiting.",
      secondary: nextStep || "Your last session changed something.",
      taskLine,
    };
  }

  if (badgeVisibilityUnlocked) {
    return {
      primary: "Your identity layer is opening.",
      secondary: nextStep || "Check your badges and see what is forming.",
      taskLine,
    };
  }

  if (learnUnlocked) {
    return {
      primary: "Learn is open now.",
      secondary: nextStep || "Knowledge adds another route forward.",
      taskLine,
    };
  }

  if (streamUnlocked) {
    return {
      primary: "Stream is live.",
      secondary: nextStep || "Try a walk-and-listen session.",
      taskLine,
    };
  }

  if (assistUnlocked) {
    return {
      primary: "Support is part of the system now.",
      secondary: nextStep || "You can move more than your own score.",
      taskLine,
    };
  }

  if (shopUnlocked && canSpendZpts) {
    return {
      primary: "Shop is open.",
      secondary: nextStep || "Spend carefully or hold for something bigger.",
      taskLine,
    };
  }

  if (shopUnlocked && shouldSaveZpts) {
    return {
      primary: "You could spend now.",
      secondary: nextStep || "Saving might open something heavier later.",
      taskLine,
    };
  }

  if (shopUnlocked) {
    return {
      primary: "Shop is ready.",
      secondary: nextStep || "Effort has started opening value.",
      taskLine,
    };
  }

  if (completedTaskCount > 0 && completedTaskCount < totalTaskCount) {
    return {
      primary: "You’re in motion.",
      secondary: nextStep || "A little more completes the loop.",
      taskLine,
    };
  }

  if (mode === "idle") {
    return {
      primary: "Ready when you are.",
      secondary: nextStep || "A little movement starts the loop.",
      taskLine,
    };
  }

  return {
    primary: "Keep going.",
    secondary: nextStep || "",
    taskLine,
  };
}

export default function DashboardWindowZwap({
  mode = "idle",
  systemMessage = "",
  eventType = "",
  nextStep = "",
  idleMessages = DEFAULT_IDLE_MESSAGES,

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

  onOpenZwap,
  className = "",
  rotateIdle = true,
  idleRotateMs = 3600,
}) {
  const safeIdleMessages = useMemo(() => {
    const cleaned = Array.isArray(idleMessages)
      ? idleMessages.filter(Boolean).map((msg) => String(msg))
      : [];

    return cleaned.length ? cleaned : DEFAULT_IDLE_MESSAGES;
  }, [idleMessages]);

  const [idleIndex, setIdleIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (mode !== "idle" || !rotateIdle || safeIdleMessages.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setIdleIndex((prev) => (prev + 1) % safeIdleMessages.length);
    }, idleRotateMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [mode, rotateIdle, idleRotateMs, safeIdleMessages]);

  const voiceContent = useMemo(() => {
    return buildVoiceMessage({
      mode,
      systemMessage,
      nextStep,
      eventType,
      completedTaskCount,
      totalTaskCount,
      shopUnlocked,
      gardenUnlocked,
      learnUnlocked,
      streamUnlocked,
      assistUnlocked,
      swapUnlocked,
      badgeVisibilityUnlocked,
      profileNeedsSetup,
      hasNewHighScore,
      canSpendZpts,
      shouldSaveZpts,
    });
  }, [
    mode,
    systemMessage,
    nextStep,
    eventType,
    completedTaskCount,
    totalTaskCount,
    shopUnlocked,
    gardenUnlocked,
    learnUnlocked,
    streamUnlocked,
    assistUnlocked,
    swapUnlocked,
    badgeVisibilityUnlocked,
    profileNeedsSetup,
    hasNewHighScore,
    canSpendZpts,
    shouldSaveZpts,
  ]);

  const visibleHints = useMemo(() => {
    return pickHints({
      shopUnlocked,
      gardenUnlocked,
      badgeVisibilityUnlocked,
      learnUnlocked,
      streamUnlocked,
      assistUnlocked,
      swapUnlocked,
      hasNewHighScore,
      profileNeedsSetup,
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
    hasNewHighScore,
    profileNeedsSetup,
    canSpendZpts,
    shouldSaveZpts,
  ]);

  const handleClick = () => {
    if (typeof onOpenZwap === "function") {
      onOpenZwap();
    }
  };

  const isActive = mode === "active";
  const idleMessage = safeIdleMessages[idleIndex] || DEFAULT_IDLE_MESSAGES[0];

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "group relative w-full overflow-hidden rounded-[26px] border p-4 text-left transition active:scale-[0.99]",
        isActive
          ? "border-cyan-400/24 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_40%),linear-gradient(180deg,rgba(14,24,36,0.98),rgba(7,12,20,1))] shadow-[0_0_34px_rgba(34,211,238,0.12)]"
          : "border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.12),transparent_34%),linear-gradient(180deg,rgba(14,20,30,0.98),rgba(7,10,16,1))] shadow-[0_14px_34px_rgba(0,0,0,0.28)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Open ZWAP system window"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute left-1/2 top-0 h-20 w-32 -translate-x-1/2 rounded-full blur-3xl transition duration-500 ${
            isActive ? "bg-cyan-400/12" : "bg-violet-400/10"
          }`}
        />
        <div
          className={`absolute bottom-0 right-2 h-16 w-16 rounded-full blur-2xl transition duration-500 ${
            isActive ? "bg-teal-400/10" : "bg-cyan-400/6"
          }`}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                  isActive
                    ? "border-cyan-400/24 bg-cyan-400/12 text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.10)]"
                    : "border-violet-400/20 bg-violet-400/10 text-violet-200"
                }`}
              >
                <Sparkles className="h-[17px] w-[17px]" strokeWidth={2.1} />
              </div>

              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/82">
                ZWAP!
              </div>
            </div>

            <div className="mt-3 min-h-[64px]">
              {isActive ? (
                <>
                  <div className="text-[1rem] font-semibold tracking-[-0.03em] text-white">
                    {voiceContent.primary}
                  </div>

                  {voiceContent.secondary ? (
                    <div className="mt-1 text-sm font-medium tracking-[-0.02em] text-white/58">
                      {voiceContent.secondary}
                    </div>
                  ) : null}

                  <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-white/48">
                    {voiceContent.taskLine}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[1rem] font-medium tracking-[-0.03em] text-white/82">
                    {idleMessage}
                  </div>

                  <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-white/48">
                    {buildTaskLabel(completedTaskCount, totalTaskCount)}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-0.5 shrink-0 text-white/32 transition group-hover:text-white/56">
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.1} />
          </div>
        </div>

        {!isActive ? (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {visibleHints.map((hint) => (
              <HintPill
                key={`${hint.label}-${hint.unlocked ? "on" : "off"}`}
                label={hint.label}
                unlocked={hint.unlocked}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
              <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 shadow-[0_0_12px_rgba(34,211,238,0.16)]" />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}