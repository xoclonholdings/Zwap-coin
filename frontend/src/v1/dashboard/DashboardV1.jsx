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
    <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden">
      <div className="shrink-0 px-3 pt-3">
        <AppHeaderV1 />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3 px-3 pb-3 pt-3">
        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowMove
            steps={steps}
            stepsPercent={stepsPercent}
          />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowPlay
            gamesPlayedToday={gamesPlayedToday}
            playPercent={playPercent}
          />
        </div>

        <div className="min-h-0 overflow-hidden [&>*]:h-full">
          <DashboardWindowShop
            zptsBalance={zptsBalance}
          />
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