import React, { useState, useEffect } from "react";
import useV1DashboardState from "./useV1DashboardState";
import AppHeaderV1 from "./AppHeaderV1";
import DashboardWindowMove from "./windows/DashboardWindowMove";
import DashboardWindowPlay from "./windows/DashboardWindowPlay";
import DashboardWindowShop from "./windows/DashboardWindowShop";
import DashboardWindowZwap from "./windows/DashboardWindowZwap";

export default function DashboardV1({ onOpenAccount }) {
  const {
    gamesPlayedToday,
    playPercent,
    zptsBalance,
    zptsPercent,
  } = useV1DashboardState();

  const [moveIsActive, setMoveIsActive] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const handleToggleMove = () => {
    setMoveIsActive((current) => !current);
  };

  // 🔥 THIS IS THE MISSING PIECE
  useEffect(() => {
    if (!moveIsActive) return;

    const interval = setInterval(() => {
      // timer
      setTimerSeconds((prev) => prev + 1);

      // simulated step increase (replace later with real sensor)
      setSessionSteps((prev) => prev + Math.floor(Math.random() * 3));

      // simple calorie estimate
      setCalories((prev) => prev + 0.04);
    }, 1000);

    return () => clearInterval(interval);
  }, [moveIsActive]);

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