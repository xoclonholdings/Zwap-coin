import React, { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Flame } from "lucide-react";

import ActivityHeaderV1 from "./ActivityHeaderV1";
import ActivityProgressCardV1 from "./ActivityProgressCardV1";
import ActivityOverviewGridV1 from "./ActivityOverviewGridV1";
import ActivityConsistencyV1 from "./ActivityConsistencyV1";
import ActivityPersonalBestsV1 from "./ActivityPersonalBestsV1";

import { getActivityDashboard } from "./activityApi";

function clampPercent(value = 0) {
  const safe = Number(value || 0);
  if (!Number.isFinite(safe)) return 0;
  return Math.max(0, Math.min(100, safe));
}

function toSafeNumber(value) {
  const safe = Number(value || 0);
  if (!Number.isFinite(safe)) return 0;
  return Math.max(safe, 0);
}

function ProgressBar({ value = 0, max = 1 }) {
  const safeMax = Math.max(1, Number(max || 1));
  const safeValue = Math.max(0, Number(value || 0));
  const percent = clampPercent((safeValue / safeMax) * 100);

  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 shadow-[0_0_14px_rgba(34,211,238,0.22)] transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function DailyLoopCard({
  completedTasks = 0,
  totalTasks = 4,
  dailyStreak = 0,
}) {
  const safeTotal = Math.max(1, toSafeNumber(totalTasks));
  const safeCompleted = Math.min(toSafeNumber(completedTasks), safeTotal);
  const safeStreak = toSafeNumber(dailyStreak);
  const percent = clampPercent((safeCompleted / safeTotal) * 100);

  return (
    <div className="relative mt-4 overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.16),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.10),transparent_36%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.36)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.065),transparent_34%,rgba(34,211,238,0.045))]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
              <CalendarCheck size={24} strokeWidth={2.3} />
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/65">
                Daily Loop
              </div>
              <div className="mt-1 text-[20px] font-black tracking-[-0.06em] text-white">
                {safeCompleted} / {safeTotal} Complete
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-amber-300/16 bg-amber-300/[0.08] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-100">
            <Flame size={12} strokeWidth={2.4} />
            {safeStreak}d
          </div>
        </div>

        <ProgressBar value={safeCompleted} max={safeTotal} />

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-[11px] font-semibold text-white/48">
            Tasks today
          </div>

          <div className="text-[11px] font-black tracking-[-0.03em] text-cyan-100">
            {Math.round(percent)}%
          </div>
        </div>

        <div className="mt-3 rounded-[16px] border border-white/8 bg-black/20 px-3 py-2 text-xs font-medium leading-5 text-white/55">
          Complete all daily lanes to strengthen your streak and feed badge
          progression.
        </div>
      </div>
    </div>
  );
}

const EMPTY_ACTIVITY_DATA = {
  totalSteps: 0,
  weeklyGoal: 70000,
  stepGoal: 70000,
  stepChangePercent: 0,
  weeklySteps: [0, 0, 0, 0, 0, 0, 0],

  avgSteps: 0,
  calories: 0,
  activeTime: "0h 0m",
  zptsEarned: 0,

  avgStepsChangePercent: 0,
  caloriesChangePercent: 0,
  activeTimeChangePercent: 0,
  zptsChangePercent: 0,

  completedTasks: 0,
  totalTasks: 4,
  dailyStreak: 0,

  consistency: [false, false, false, false, false, false, false],
  streakDays: 0,

  personalBests: [],
};

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
          setData(res || null);
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

  const activityData = useMemo(
    () => ({
      ...EMPTY_ACTIVITY_DATA,
      ...(data || {}),
    }),
    [data]
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-y-auto bg-[#030711] px-4 pb-8 pt-4 text-white">
      <ActivityHeaderV1 onBack={onBack} />

      {loading ? (
        <div className="mt-10 text-center text-sm text-white/40">
          Loading activity...
        </div>
      ) : (
        <>
          <ActivityProgressCardV1
            totalSteps={activityData.totalSteps}
            weeklyGoal={activityData.weeklyGoal || activityData.stepGoal}
            stepChangePercent={activityData.stepChangePercent}
            weeklySteps={activityData.weeklySteps}
          />

          <ActivityOverviewGridV1
            avgSteps={activityData.avgSteps}
            calories={activityData.calories}
            activeTime={activityData.activeTime}
            zptsEarned={activityData.zptsEarned}
            avgStepsChangePercent={activityData.avgStepsChangePercent}
            caloriesChangePercent={activityData.caloriesChangePercent}
            activeTimeChangePercent={activityData.activeTimeChangePercent}
            zptsChangePercent={activityData.zptsChangePercent}
          />

          <DailyLoopCard
            completedTasks={
              activityData.completedTasks ??
              activityData.completed_tasks ??
              activityData.daily_tasks_completed ??
              activityData.dailyTasksCompleted
            }
            totalTasks={
              activityData.totalTasks ??
              activityData.total_tasks ??
              activityData.daily_tasks_total ??
              activityData.dailyTasksTotal
            }
            dailyStreak={
              activityData.dailyStreak ??
              activityData.daily_streak ??
              activityData.streakDays ??
              activityData.streak_days
            }
          />

          <ActivityConsistencyV1
            consistency={activityData.consistency}
            streakDays={activityData.streakDays}
          />

          <ActivityPersonalBestsV1
            personalBests={activityData.personalBests}
          />
        </>
      )}
    </div>
  );
}
