import React, { useEffect, useRef, useState } from "react";
import useV1DashboardState from "./useV1DashboardState";
import AppHeaderV1 from "./AppHeaderV1";
import DashboardWindowMove from "./windows/DashboardWindowMove";
import DashboardWindowPlay from "./windows/DashboardWindowPlay";
import DashboardWindowShop from "./windows/DashboardWindowShop";
import DashboardWindowZwap from "./windows/DashboardWindowZwap";

import StackzGame from "@/v1/components/games/stackz/StackzGame";
import BreakerzGame from "@/v1/components/games/breakerz/BreakerzGame";
import PulzeGame from "@/v1/components/games/pulze/PulzeGame";
import ZapManGame from "@/v1/components/games/zapman/ZapManGame";

import { getDeviceSteps, subscribeToDeviceSteps } from "@/services/stepService";

function estimateCaloriesFromSteps(steps) {
  const safeSteps = Math.max(0, Number(steps || 0));
  return Math.round(safeSteps * 0.04);
}

export default function DashboardV1({ onOpenAccount, user, authUser }) {
  const { play, zpts, zwap } = useV1DashboardState({
    user,
    authUser,
  });

  const [moveIsActive, setMoveIsActive] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeGameId, setActiveGameId] = useState(null);

  const sessionStartStepsRef = useRef(0);

  const handleToggleMove = () => {
    setMoveIsActive((current) => {
      const nextState = !current;

      if (nextState) {
        sessionStartStepsRef.current = getDeviceSteps();
        setSessionSteps(0);
        setTimerSeconds(0);
      }

      return nextState;
    });
  };

  const handleStartGame = (game) => {
    if (!game || game.locked) return;
    setActiveGameId(game.id);
  };

  const handleGameEnd = (result) => {
    console.log("Game ended:", result);
    setActiveGameId(null);
  };

  useEffect(() => {
    if (!moveIsActive) return;

    const unsubscribe = subscribeToDeviceSteps((deviceSteps) => {
      const startSteps = Number(sessionStartStepsRef.current || 0);
      setSessionSteps(Math.max(0, Number(deviceSteps || 0) - startSteps));
    });

    return () => unsubscribe();
  }, [moveIsActive]);

  useEffect(() => {
    if (!moveIsActive) return;

    const interval = window.setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [moveIsActive]);

  const calories = estimateCaloriesFromSteps(sessionSteps);

  if (activeGameId === "stackz") {
    return (
      <StackzGame
        isPlaying={true}
        onGameEnd={handleGameEnd}
      />
    );
  }

  if (activeGameId === "breakerz") {
    return (
      <BreakerzGame
        isPlaying={true}
        onGameEnd={handleGameEnd}
      />
    );
  }

  if (activeGameId === "pulze") {
    return (
      <PulzeGame
        isPlaying={true}
        onGameEnd={handleGameEnd}
      />
    );
  }

  if (activeGameId === "zap-man") {
    return (
      <ZapManGame
        isPlaying={true}
        onGameEnd={handleGameEnd}
      />
    );
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden">
      <div className="shrink-0 px-2.5 pt-2.5">
        <AppHeaderV1 onOpenAccount={onOpenAccount} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2.5 px-2.5 pb-2.5 pt-2.5">
        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowMove
            isActive={moveIsActive}
            sessionSteps={sessionSteps}
            calories={calories}
            timerSeconds={timerSeconds}
            onToggleMove={handleToggleMove}
          />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowPlay
            onStartGame={handleStartGame}
            onOpenPlay={handleStartGame}
          />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowShop zptsBalance={zpts.zptsBalance} />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowZwap
            zptsBalance={zpts.zptsBalance}
            zwapMode={zwap.zwapMode}
            zwapMessage={zwap.zwapMessage}
            zwapHint={zwap.zwapHint}
          />
        </div>
      </div>
    </div>
  );
}