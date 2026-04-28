import React, { useEffect, useState } from "react";

import ActivityHeaderV1 from "./ActivityHeaderV1";
import ActivityProgressCardV1 from "./ActivityProgressCardV1";
import ActivityOverviewGridV1 from "./ActivityOverviewGridV1";
import ActivityConsistencyV1 from "./ActivityConsistencyV1";
import ActivityPersonalBestsV1 from "./ActivityPersonalBestsV1";

import { getActivityDashboard } from "./activityApi";

export default function ActivityPageV1({ onBack, email }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      try {
        const res = await getActivityDashboard(email);

        if (mounted) {
          setData(res);
        }
      } catch (err) {
        console.error("Activity load failed:", err);

        if (mounted) {
          setData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (email) {
      load();
    } else {
      setData(null);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [email]);

  return (
    <div className="relative h-[100dvh] w-full overflow-y-auto bg-[#030711] px-4 pb-8 pt-4 text-white">
      <ActivityHeaderV1 onBack={onBack} />

      {loading ? (
        <div className="mt-10 text-center text-sm text-white/40">
          Loading activity...
        </div>
      ) : !data ? (
        <div className="mt-10 text-center text-sm text-white/40">
          No activity data available.
        </div>
      ) : (
        <>
          <ActivityProgressCardV1
            totalSteps={data.totalSteps}
            weeklyGoal={data.weeklyGoal || data.stepGoal}
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

          <ActivityPersonalBestsV1 personalBests={data.personalBests} />
        </>
      )}
    </div>
  );
}