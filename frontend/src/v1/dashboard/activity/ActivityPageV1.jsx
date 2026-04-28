import React, { useEffect, useState } from "react";

import ActivityHeaderV1 from "./ActivityHeaderV1";
import ActivityProgressCardV1 from "./ActivityProgressCardV1";
import ActivityOverviewGridV1 from "./ActivityOverviewGridV1";
import ActivityConsistencyV1 from "./ActivityConsistencyV1";
import ActivityPersonalBestsV1 from "./ActivityPersonalBestsV1";

import { getActivityDashboard } from "./activityApi";

export default function ActivityPageV1({
  onBack,
  walletAddress,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await getActivityDashboard(walletAddress);

        if (mounted) {
          setData(res);
        }
      } catch (err) {
        console.error("Activity load failed:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (walletAddress) {
      load();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [walletAddress]);

  return (
    <div className="relative h-[100dvh] w-full overflow-y-auto bg-[#030711] px-4 pb-8 pt-4 text-white">
      
      <ActivityHeaderV1 onBack={onBack} />

      {loading ? (
        <div className="mt-10 text-center text-white/40 text-sm">
          Loading activity...
        </div>
      ) : !data ? (
        <div className="mt-10 text-center text-white/40 text-sm">
          No activity data available.
        </div>
      ) : (
        <>
          <ActivityProgressCardV1
            totalSteps={data.totalSteps}
            weeklyGoal={data.weeklyGoal}
            stepChangePercent={data.stepChangePercent}
            weeklySteps={data.weeklySteps}
          />

          <ActivityOverviewGridV1
            avgSteps={data.avgSteps}
            calories={data.calories}
            activeTime={data.activeTime}
            zptsEarned={data.zptsEarned}
            avgStepsChangePercent={data.avgStepsChangePercent}
            caloriesChangePercent={data.caloriesChangePercent}
            activeTimeChangePercent={data.activeTimeChangePercent}
            zptsChangePercent={data.zptsChangePercent}
          />

          <ActivityConsistencyV1
            consistency={data.consistency}
            streakDays={data.streakDays}
          />

          <ActivityPersonalBestsV1
            personalBests={data.personalBests}
          />
        </>
      )}
    </div>
  );
}