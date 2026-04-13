import React from "react";
import useV1DashboardState from "@/hooks/useV1DashboardState";
import AppHeaderV1 from "@/components/ui/dashboard/v1/AppHeaderV1";
import DashboardWindowMove from "@/components/ui/dashboard/v1/DashboardWindowMove";
import DashboardWindowPlay from "@/components/ui/dashboard/v1/DashboardWindowPlay";
import DashboardWindowShop from "@/components/ui/dashboard/v1/DashboardWindowShop";
import DashboardWindowZwap from "@/components/ui/dashboard/v1/DashboardWindowZwap";

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