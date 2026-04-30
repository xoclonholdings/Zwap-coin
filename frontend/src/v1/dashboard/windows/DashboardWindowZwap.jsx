import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import zapBubble from "@/assets/zap/zap-bubble.png";
import zapHead from "@/assets/zap/zap-head.png";

import ZapTasksPanel from "./zap/ZapTasksPanel";
import { buildZapGuidance } from "./zap/zapGuidanceEngine";

const ZAP_IDLE_ROTATION_MS = 7000;
const ZAP_RESPONSE_HOLD_MS = 5200;
const ZAP_TYPE_SPEED_MS = 70;

function WindowAltIndicator() {
  return (
    <div className="absolute right-3 top-3 z-20">
      <ChevronRight
        size={22}
        strokeWidth={2.8}
        className="text-white/70 drop-shadow-[0_0_10px_rgba(168,85,247,0.25)]"
      />
    </div>
  );
}

function ZwapHeader() {
  return (
    <div className="relative z-10 flex items-center gap-3 pr-10">
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

function GuidanceText({ guidance, onTypingChange }) {
  const lines = useMemo(() => {
    return String(guidance || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 3);
  }, [guidance]);

  const fullText = lines.join("\n");
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);

    if (!fullText) {
      onTypingChange?.(false);
      return undefined;
    }

    onTypingChange?.(true);

    const interval = window.setInterval(() => {
      setVisibleCount((current) => {
        if (current >= fullText.length) {
          window.clearInterval(interval);
          onTypingChange?.(false);
          return current;
        }

        return current + 1;
      });
    }, ZAP_TYPE_SPEED_MS);

    return () => {
      window.clearInterval(interval);
      onTypingChange?.(false);
    };
  }, [fullText, onTypingChange]);

  function getVisibleLine(line, index) {
    const previousLength = lines
      .slice(0, index)
      .reduce((total, item) => total + item.length + 1, 0);

    const available = visibleCount - previousLength;

    if (available <= 0) return "";
    return line.slice(0, available);
  }

  function isTypingLine(index) {
    if (visibleCount >= fullText.length) return false;

    const previousLength = lines
      .slice(0, index)
      .reduce((total, item) => total + item.length + 1, 0);

    return (
      visibleCount > previousLength &&
      visibleCount <= previousLength + lines[index].length
    );
  }

  return (
    <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-4 pt-6 text-center">
      {lines.map((line, index) => {
        const visibleLine = getVisibleLine(line, index);
        const isEdgeLine = index === 0 || index === lines.length - 1;

        return (
          <div
            key={`${line}-${index}`}
            className={
              isEdgeLine
                ? "text-[0.92rem] font-extrabold uppercase leading-[1.06] tracking-[0.06em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.16)]"
                : "text-[0.72rem] font-semibold leading-snug tracking-[-0.02em] text-white/70"
            }
          >
            {visibleLine}
            {isTypingLine(index) ? (
              <span className="ml-0.5 animate-pulse text-cyan-200">|</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ZapGuidanceStage({ guidance }) {
  const [isTyping, setIsTyping] = useState(false);

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between pt-2">
      <motion.div
        key={`bubble-${guidance}`}
        className="relative mx-auto h-[150px] w-full max-w-[94%]"
        initial={{ scale: 0.985, opacity: 0.92 }}
        animate={{
          scale: isTyping ? [1, 1.004, 1] : [0.985, 1.014, 1],
          opacity: 1,
          filter: isTyping
            ? [
                "drop-shadow(0 0 8px rgba(168,85,247,0.16))",
                "drop-shadow(0 0 14px rgba(34,211,238,0.18))",
                "drop-shadow(0 0 8px rgba(168,85,247,0.16))",
              ]
            : "drop-shadow(0 0 8px rgba(168,85,247,0.12))",
        }}
        transition={{
          duration: isTyping ? 1.6 : 0.52,
          repeat: isTyping ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        <img
          src={zapBubble}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-fill opacity-95"
          draggable={false}
        />

        <GuidanceText guidance={guidance} onTypingChange={setIsTyping} />
      </motion.div>

      <div className="relative -mt-5 flex justify-center">
        <div className="absolute bottom-0 h-8 w-32 rounded-full bg-violet-500/25 blur-xl" />

        <motion.img
          src={zapHead}
          alt="Zap guide"
          className="relative h-[104px] w-[134px] object-contain drop-shadow-[0_0_22px_rgba(168,85,247,0.32)]"
          draggable={false}
          animate={
            isTyping
              ? {
                  y: [0, -1.5, 0, -0.8, 0],
                  scale: [1, 1.018, 1, 1.012, 1],
                  rotate: [0, -0.5, 0.4, -0.2, 0],
                }
              : {
                  y: 0,
                  scale: 1,
                  rotate: 0,
                }
          }
          transition={{
            duration: 1.6,
            repeat: isTyping ? Infinity : 0,
            ease: "easeInOut",
          }}
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
  taskStates = [],

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
  const [idleTick, setIdleTick] = useState(0);
  const responseHoldUntilRef = useRef(0);
  const didMountRef = useRef(false);

  const activityFingerprint = useMemo(() => {
    const stepBucket = Math.floor(Number(dailySteps || 0) / 25);

    return [
      activitySignal?.type || "",
      activitySignal?.created_at || activitySignal?.createdAt || "",
      completedTaskCount,
      zptsBalance,
      stepBucket,
      gamesPlayedToday,
      lessonsCompletedToday,
      shopUnlocked ? "shop-open" : "shop-locked",
      learnUnlocked ? "learn-open" : "learn-locked",
      swapUnlocked ? "swap-open" : "swap-locked",
    ].join("|");
  }, [
    activitySignal,
    completedTaskCount,
    zptsBalance,
    dailySteps,
    gamesPlayedToday,
    lessonsCompletedToday,
    shopUnlocked,
    learnUnlocked,
    swapUnlocked,
  ]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (Date.now() < responseHoldUntilRef.current) return;

      setIdleTick((current) => current + 1);
    }, ZAP_IDLE_ROTATION_MS);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    responseHoldUntilRef.current = Date.now() + ZAP_RESPONSE_HOLD_MS;
    setIdleTick((current) => current + 1);
  }, [activityFingerprint]);

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
      idleTick,
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
    idleTick,
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
      <div
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        className="relative h-full"
      >
        <WindowAltIndicator />

        <ZapTasksPanel
          completedTaskCount={completedTaskCount}
          taskStates={taskStates}
          learnUnlocked={learnUnlocked}
          shopUnlocked={shopUnlocked}
          assistUnlocked={assistUnlocked}
        />
      </div>
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

      <WindowAltIndicator />

      <ZwapHeader />
      <ZapGuidanceStage guidance={guidance} />
    </section>
  );
}