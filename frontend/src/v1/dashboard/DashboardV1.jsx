import React from "react";
import useV1DashboardState from "./useV1DashboardState";
import AppHeaderV1 from "./AppHeaderV1";
import DashboardWindowMove from "./windows/DashboardWindowMove";
import DashboardWindowPlay from "./windows/DashboardWindowPlay";
import DashboardWindowShop from "./windows/DashboardWindowShop";
import DashboardWindowZwap from "./windows/DashboardWindowZwap";

export default function DashboardV1() {
  const {
    steps,
    stepsPercent,
    gamesPlayedToday,
    playPercent,
    zptsBalance,
    zptsPercent,
  } = useV1DashboardState();

  return (
    <div className="w-full flex justify-center px-3 pb-6">
      <div className="w-full max-w-[430px] flex flex-col gap-3">
        <AppHeaderV1 />

        <DashboardWindowMove
          steps={steps}
          stepsPercent={stepsPercent}
        />

        <DashboardWindowPlay
          gamesPlayedToday={gamesPlayedToday}
          playPercent={playPercent}
        />

        <DashboardWindowShop
          zptsBalance={zptsBalance}
        />

        <DashboardWindowZwap
          zptsBalance={zptsBalance}
          zptsPercent={zptsPercent}
        />
      </div>
    </div>
  );
}