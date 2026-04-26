import React, { useEffect, useRef, useState } from "react";
import useV1DashboardState from "./useV1DashboardState";
import AppHeaderV1 from "./AppHeaderV1";
import DashboardWindowMove from "./windows/DashboardWindowMove";
import DashboardWindowPlay from "./windows/DashboardWindowPlay";
import DashboardWindowShop from "./windows/DashboardWindowShop";
import DashboardWindowZwap from "./windows/DashboardWindowZwap";

function estimateCaloriesFromSteps(steps) {
  const safeSteps = Math.max(0, Number(steps || 0));

  // Conservative estimate: roughly 0.04 calories per step.
  return Math.round(safeSteps * 0.04);
}

export default function DashboardV1({ onOpenAccount }) {
  const {
    steps,
    gamesPlayedToday,
    playPercent,
    zptsBalance,
    zptsPercent,
  } = useV1DashboardState();

  const [moveIsActive, setMoveIsActive] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const sessionStartStepsRef = useRef(0);

  const handleToggleMove = () => {
    setMoveIsActive((current) => {
      const nextState = !current;

      if (nextState) {
        sessionStartStepsRef.current = Number(steps || 0);
        setSessionSteps(0);
        setTimerSeconds(0);
      }

      return nextState;
    });
  };

  useEffect(() => {
    if (!moveIsActive) return;

    const currentSteps = Number(steps || 0);
    const startSteps = Number(sessionStartStepsRef.current || 0);

    setSessionSteps(Math.max(0, currentSteps - startSteps));
  }, [steps, moveIsActive]);

  useEffect(() => {
    if (!moveIsActive) return;

    const interval = window.setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [moveIsActive]);

  const calories = estimateCaloriesFromSteps(sessionSteps);

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
            gamesPlayedToday={gamesPlayedToday}
            playPercent={playPercent}
          />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowShop zptsBalance={zptsBalance} />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowZwap
            zptsBalance={zptsBalance}
            zptsPercent={zptsPercent}
          />
        </div>
      </div>
    </div>
  );
}