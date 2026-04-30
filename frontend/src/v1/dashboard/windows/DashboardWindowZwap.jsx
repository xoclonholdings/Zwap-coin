import React, { useMemo } from "react";

import zapBubble from "@/assets/zap/zap-bubble.png";
import zapHead from "@/assets/zap/zap-head.png";

import ZapTasksPanel from "./zap/ZapTasksPanel";
import { buildZapGuidance } from "./zap/zapGuidanceEngine";

function ZwapHeader() {
  return (
    <div className="relative z-10 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-300/35 bg-violet-400/14 shadow-[0_0_18px_rgba(168,85,247,0.18)]">
        <img
          src={zapHead}
          alt="Zap"
          className="h-8 w-8 object-contain"
          draggable={false}
        />
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
    <div className="relative z-10 px-5 py-4 text-center">
      {lines.map((line, index) => (
        <div
          key={`${line}-${index}`}
          className={
            index === 0
              ? "text-[1.05rem] font-black leading-[1.08] tracking-[-0.05em] text-white"
              : "mt-2 text-[0.72rem] font-bold leading-snug tracking-[-0.025em] text-white/70"
          }
        >
          {line}
        </div>
      ))}
    </div>
  );
}

function ZapGuidanceStage({ guidance }) {
  return (
    <div className="relative z-10 flex flex-1 flex-col justify-between pt-2">
      
      {/* BUBBLE */}
      <div className="relative mx-auto w-full max-w-[92%] min-h-[150px]">
        <img
          src={zapBubble}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-fill opacity-95"
          draggable={false}
        />

        <GuidanceText guidance={guidance} />
      </div>

      {/* ZAP HEAD */}
      <div className="relative flex justify-center -mt-4">
        <div className="absolute bottom-0 h-8 w-28 rounded-full bg-violet-500/25 blur-xl" />

        <img
          src={zapHead}
          alt="Zap guide"
          className="relative h-[92px] w-[120px] object-contain drop-shadow-[0_0_22px_rgba(168,85,247,0.32)]"
          draggable={false}
        />
      </div>
    </div>
  );
}

export default function DashboardWindowZwap({
  isAltView = false,

  systemMessage = "",
  eventType = "",
  nextStep = "",
  activitySignal = null,

  completedTaskCount = 0,
  totalTaskCount = 4,

  zptsBalance = 0,

  dailySteps = 0,
  stepGoal = 10000,

  gamesPlayedToday = 0,
  playGoal = 1,

  lessonsCompletedToday = 0,

  shopUnlocked = false,
  learnUnlocked = false,
  assistUnlocked = false,
  swapUnlocked = false,

  onToggleAltView,
  className = "",
}) {
  const guidance = useMemo(() => {
    const result = buildZapGuidance({
      systemMessage,
      nextStep,
      eventType,
      activitySignal,
      completedTaskCount,
      totalTaskCount,
      zptsBalance,
      dailySteps,
      stepGoal,
      gamesPlayedToday,
      playGoal,
      lessonsCompletedToday,
      shopUnlocked,
      learnUnlocked,
      swapUnlocked,
    });

    return result?.text || "";
  }, [
    systemMessage,
    nextStep,
    eventType,
    activitySignal,
    completedTaskCount,
    totalTaskCount,
    zptsBalance,
    dailySteps,
    stepGoal,
    gamesPlayedToday,
    playGoal,
    lessonsCompletedToday,
    shopUnlocked,
    learnUnlocked,
    swapUnlocked,
  ]);

  const handleToggle = () => {
    if (typeof onToggleAltView === "function") {
      onToggleAltView();
    }
  };

  const shellClassName = [
    "relative flex h-full w-full flex-col overflow-hidden rounded-[26px] border border-violet-300/16 p-4 text-left",
    "bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.1),transparent_38%),linear-gradient(180deg,rgba(17,24,39,0.98),rgba(7,10,18,1))]",
    "shadow-[0_16px_38px_rgba(0,0,0,0.34),0_0_28px_rgba(168,85,247,0.1)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isAltView) {
    return (
      <div onClick={handleToggle} className="h-full">
        <ZapTasksPanel
          completedTaskCount={completedTaskCount}
          learnUnlocked={learnUnlocked}
          shopUnlocked={shopUnlocked}
          assistUnlocked={assistUnlocked}
        />
      </div>
    );
  }

  return (
    <section onClick={handleToggle} className={shellClassName}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full bg-violet-400/16 blur-3xl" />
        <div className="absolute bottom-0 right-3 h-20 w-24 rounded-full bg-cyan-400/8 blur-2xl" />
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/30 to-transparent" />
      </div>

      <ZwapHeader />
      <ZapGuidanceStage guidance={guidance} />
    </section>
  );
}