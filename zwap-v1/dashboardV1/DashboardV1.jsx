import React from "react";
import useV1DashboardState from "./useV1DashboardState";
import DashboardWindowMove from "./windows/DashboardWindowMove";
import DashboardWindowPlay from "./windows/DashboardWindowPlay";
import DashboardWindowShop from "./windows/DashboardWindowShop";
import DashboardWindowZwap from "./windows/DashboardWindowZwap";

export default function DashboardV1({
  user,
  authUser,
  todaySteps,
  stepGoal,
  isMoveActive,
  gamesPlayedToday,
  playGoal,
  isPlayActive,
  completedTasks,
  totalTasks,
  taskStates,
  zptsBalance,
  shopUnlocked,
  systemMode,
  systemMessage,
  systemEventType,
  systemNextStep,
  idleMessages,
  learnUnlocked = false,
  streamUnlocked = false,
  swapUnlocked = false,
  onOpenMove,
  onOpenPlay,
  onOpenTasks,
  onOpenZwap,
}) {
  const {
    move,
    play,
    zpts,
    unlocks,
    zwap,
  } = useV1DashboardState({
    user,
    authUser,
    todaySteps,
    stepGoal,
    isMoveActive,
    gamesPlayedToday,
    playGoal,
    isPlayActive,
    completedTaskCount: completedTasks,
    totalTaskCount: totalTasks,
    taskStates,
    zptsBalance,
    shopUnlocked,
    zwapMode: systemMode,
    zwapMessage: systemMessage,
    zwapHint: systemNextStep,
  });

  return (
    <div className="w-full flex justify-center px-3 pb-6">
      <div className="w-full max-w-[430px] flex flex-col gap-3">
        <DashboardWindowMove
          todaySteps={move.todaySteps}
          stepGoal={move.stepGoal}
          isActive={move.isMoveActive}
          progressPercent={move.moveProgressPercent}
          onOpenMove={onOpenMove}
        />

        <DashboardWindowPlay
          gamesPlayedToday={play.gamesPlayedToday}
          playGoal={play.playGoal}
          isActive={play.isPlayActive}
          progressPercent={play.playProgressPercent}
          onOpenPlay={onOpenPlay}
        />

        <DashboardWindowShop
          zptsBalance={zpts.zptsBalance}
          onOpenTasks={onOpenTasks}
          shopUnlocked={unlocks.shopUnlocked}
        />

        <DashboardWindowZwap
          mode={zwap.zwapMode}
          systemMessage={zwap.zwapMessage}
          eventType={systemEventType}
          nextStep={zwap.zwapHint}
          idleMessages={idleMessages}
          shopUnlocked={unlocks.shopUnlocked}
          learnUnlocked={learnUnlocked}
          streamUnlocked={streamUnlocked}
          swapUnlocked={swapUnlocked}
          onOpenZwap={onOpenZwap}
        />
      </div>
    </div>
  );
}
