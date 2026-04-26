import React from "react";
import useV1DashboardState from "./useV1DashboardState";
import AppHeaderV1 from "./AppHeaderV1";
import DashboardWindowMove from "./windows/DashboardWindowMove";
import DashboardWindowPlay from "./windows/DashboardWindowPlay";
import DashboardWindowShop from "./windows/DashboardWindowShop";
import DashboardWindowZwap from "./windows/DashboardWindowZwap";

export default function DashboardV1({ onOpenAccount }) {
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
      <div className="shrink-0 px-2.5 pt-2.5">
        <AppHeaderV1 onOpenAccount={onOpenAccount} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2.5 px-2.5 pb-2.5 pt-2.5">
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