import React, { useMemo } from "react";

import DashboardWindowMove from "./DashboardWindowMove";
import DashboardWindowPlay from "./DashboardWindowPlay";
import DashboardWindowTasks from "./DashboardWindowTasks";
import DashboardWindowZwap from "./DashboardWindowZwap";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function normalizeTaskStates(taskStates = [], completedTasks = 0, totalTasks = 4) {
  if (Array.isArray(taskStates) && taskStates.length > 0) {
    return taskStates.slice(0, 4);
  }

  const labels = ["Login", "Move", "Play", "Learn"];
  const safeCompleted = Math.max(0, Number(completedTasks || 0));

  return labels.slice(0, totalTasks).map((label, index) => ({
    label,
    completed: index < safeCompleted,
  }));
}

function buildPlayStatus({
  gamesPlayedToday = 0,
  playGoal = 3,
  isPlayActive = false,
}) {
  const safeGoal = Math.max(1, Number(playGoal || 1));
  const safePlayed = Math.max(0, Number(gamesPlayedToday || 0));
  const progress = clamp(safePlayed / safeGoal);

  return {
    gamesPlayedToday: safePlayed,
    playGoal: safeGoal,
    playProgressPercent: progress * 100,
    isPlayActive: Boolean(isPlayActive),
  };
}

export default function DashboardV1({
  todaySteps = 0,
  stepGoal = 10000,
  isMoveActive = false,

  gamesPlayedToday = 0,
  playGoal = 3,
  isPlayActive = false,

  completedTasks = 0,
  totalTasks = 4,
  taskStates = [],

  systemMode = "idle",
  systemMessage = "",
  systemEventType = "",
  systemNextStep = "",
  idleMessages,
  shopUnlocked = false,
  learnUnlocked = false,
  streamUnlocked = false,
  swapUnlocked = false,

  onOpenMove,
  onOpenPlay,
  onOpenTasks,
  onOpenZwap,

  isLoading = false,
  className = "",
}) {
  const moveProgressPercent = useMemo(() => {
    const safeGoal = Math.max(1, Number(stepGoal || 1));
    return clamp(Number(todaySteps || 0) / safeGoal) * 100;
  }, [todaySteps, stepGoal]);

  const playData = useMemo(() => {
    return buildPlayStatus({
      gamesPlayedToday,
      playGoal,
      isPlayActive,
    });
  }, [gamesPlayedToday, playGoal, isPlayActive]);

  const normalizedTaskStates = useMemo(() => {
    return normalizeTaskStates(taskStates, completedTasks, totalTasks);
  }, [taskStates, completedTasks, totalTasks]);

  if (isLoading) {
    return (
      <div className={["w-full px-3 pb-24 pt-3", className].filter(Boolean).join(" ")}>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[190px] animate-pulse rounded-[26px] border border-white/8 bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={["w-full px-3 pb-24 pt-3", className].filter(Boolean).join(" ")}>
      <div className="grid grid-cols-2 gap-3">
        <DashboardWindowMove
          todaySteps={todaySteps}
          stepGoal={stepGoal}
          isActive={isMoveActive}
          progressPercent={moveProgressPercent}
          onOpenMove={onOpenMove}
          className="min-h-[190px]"
        />

        <DashboardWindowPlay
          gamesPlayedToday={playData.gamesPlayedToday}
          playGoal={playData.playGoal}
          isActive={playData.isPlayActive}
          progressPercent={playData.playProgressPercent}
          onOpenPlay={onOpenPlay}
          className="min-h-[190px]"
        />

        <DashboardWindowTasks
          completedTasks={completedTasks}
          totalTasks={totalTasks}
          taskStates={normalizedTaskStates}
          onOpenTasks={onOpenTasks}
          className="min-h-[190px]"
        />

        <DashboardWindowZwap
          mode={systemMode}
          systemMessage={systemMessage}
          eventType={systemEventType}
          nextStep={systemNextStep}
          idleMessages={idleMessages}
          shopUnlocked={shopUnlocked}
          learnUnlocked={learnUnlocked}
          streamUnlocked={streamUnlocked}
          swapUnlocked={swapUnlocked}
          onOpenZwap={onOpenZwap}
          className="min-h-[190px]"
        />
      </div>
    </div>
  );
}