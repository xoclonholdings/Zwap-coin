import React, { useEffect, useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";

import ActivityHeaderV1 from "./ActivityHeaderV1";
import ActivityProgressCardV1 from "./ActivityProgressCardV1";
import ActivityOverviewGridV1 from "./ActivityOverviewGridV1";
import ActivityConsistencyV1 from "./ActivityConsistencyV1";
import ActivityPersonalBestsV1 from "./ActivityPersonalBestsV1";

import { getActivityDashboard } from "./activityApi";

const PROGRESS_RANGES = [
  {
    id: "day",
    label: "Today",
    totalKey: "todaySteps",
    goalKey: "dailyGoal",
    dataKeys: ["hourlySteps", "todayStepsData", "dailyStepsData"],
    fallbackLabels: ["6A", "9A", "12P", "3P", "6P", "9P"],
  },
  {
    id: "week",
    label: "This Week",
    totalKey: "totalSteps",
    goalKey: "weeklyGoal",
    dataKeys: ["weeklySteps"],
    fallbackLabels: ["S", "M", "T", "W", "T", "F", "S"],
  },
  {
    id: "month",
    label: "This Month",
    totalKey: "monthlySteps",
    goalKey: "monthlyGoal",
    dataKeys: ["monthlyStepsData", "monthSteps", "dailyMonthSteps"],
    fallbackLabels: ["W1", "W2", "W3", "W4"],
  },
  {
    id: "year",
    label: "This Year",
    totalKey: "yearlySteps",
    goalKey: "yearlyGoal",
    dataKeys: ["yearlyStepsData", "yearSteps", "monthlyYearSteps"],
    fallbackLabels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  },
];

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

function resolveCompletedTasks(activityData = {}) {
  const directCompleted = toSafeNumber(
    activityData.completedTasks ??
      activityData.completed_tasks ??
      activityData.daily_tasks_completed ??
      activityData.dailyTasksCompleted ??
      activityData.completedTaskCount
  );

  const hasDailyLoginSignal =
    toSafeNumber(
      activityData.dailyStreak ??
        activityData.daily_streak ??
        activityData.streakDays ??
        activityData.streak_days
    ) > 0 ||
    (Array.isArray(activityData.consistency) &&
      activityData.consistency.some(Boolean));

  if (hasDailyLoginSignal) {
    return Math.max(1, directCompleted);
  }

  return directCompleted;
}

function normalizeStepsData(value, fallbackLabels = []) {
  if (Array.isArray(value) && value.length > 0) {
    return value.map((item, index) => {
      if (typeof item === "number") {
        return {
          day: fallbackLabels[index] || `${index + 1}`,
          steps: item,
        };
      }

      return {
        ...item,
        day: item.day || item.label || fallbackLabels[index] || `${index + 1}`,
        steps: Number(item.steps || item.value || 0),
      };
    });
  }

  return fallbackLabels.map((label) => ({
    day: label,
    steps: 0,
  }));
}

function resolveStepsData(activityData = {}, range = PROGRESS_RANGES[1]) {
  const foundKey = range.dataKeys.find((key) => Array.isArray(activityData[key]));
  const rawData = foundKey ? activityData[foundKey] : [];

  return normalizeStepsData(rawData, range.fallbackLabels);
}

function resolveProgressTotal(activityData = {}, range = PROGRESS_RANGES[1], stepsData = []) {
  const directValue = activityData[range.totalKey];

  if (toSafeNumber(directValue) > 0) {
    return toSafeNumber(directValue);
  }

  return stepsData.reduce((sum, item) => sum + toSafeNumber(item.steps), 0);
}

function resolveProgressGoal(activityData = {}, range = PROGRESS_RANGES[1]) {
  const directGoal = activityData[range.goalKey];

  if (toSafeNumber(directGoal) > 0) {
    return toSafeNumber(directGoal);
  }

  if (range.id === "day") return toSafeNumber(activityData.dailyGoal || 10000);
  if (range.id === "week") return toSafeNumber(activityData.weeklyGoal || activityData.stepGoal || 70000);
  if (range.id === "month") return toSafeNumber(activityData.monthlyGoal || 300000);
  if (range.id === "year") return toSafeNumber(activityData.yearlyGoal || 3650000);

  return toSafeNumber(activityData.stepGoal || 70000);
}

function ProgressBar({ value = 0, max = 1 }) {
  const safeMax = Math.max(1, Number(max || 1));
  const safeValue = Math.max(0, Number(value || 0));
  const percent = clampPercent((safeValue / safeMax) * 100);

  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 shadow-[0_0_14px_rgba(34,211,238,0.22)] transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function DailyLoopCard({ completedTasks = 0, totalTasks = 4 }) {
  const safeTotal = Math.max(1, toSafeNumber(totalTasks));
  const safeCompleted = Math.min(toSafeNumber(completedTasks), safeTotal);
  const percent = clampPercent((safeCompleted / safeTotal) * 100);

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.16),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.10),transparent_36%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] px-3 py-2.5 shadow-[0_16px_42px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.065),transparent_34%,rgba(34,211,238,0.045))]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.14)]">
              <CalendarCheck size={18} strokeWidth={2.3} />
            </div>

            <div className="min-w-0">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-100/65">
                Daily Loop
              </div>
              <div className="mt-0.5 text-[16px] font-black leading-none tracking-[-0.06em] text-white">
                {safeCompleted} / {safeTotal}
              </div>
            </div>
          </div>

          <div className="text-[10px] font-black tracking-[-0.03em] text-cyan-100">
            {Math.round(percent)}%
          </div>
        </div>

        <ProgressBar value={safeCompleted} max={safeTotal} />

        <div className="mt-1.5 text-[10px] font-semibold text-white/48">
          Tasks today
        </div>
      </div>
    </div>
  );
}

function PageDots({ activeIndex = 0, total = 1 }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={[
            "h-1.5 rounded-full transition-all duration-300",
            index === activeIndex
              ? "w-5 bg-cyan-200 shadow-[0_0_8px_rgba(103,242,255,0.22)]"
              : "w-1.5 bg-white/22",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

const EMPTY_ACTIVITY_DATA = {
  totalSteps: 0,
  todaySteps: 0,
  monthlySteps: 0,
  yearlySteps: 0,

  dailyGoal: 10000,
  weeklyGoal: 70000,
  monthlyGoal: 300000,
  yearlyGoal: 3650000,
  stepGoal: 70000,

  stepChangePercent: 0,

  hourlySteps: [],
  weeklySteps: [0, 0, 0, 0, 0, 0, 0],
  monthlyStepsData: [],
  yearlyStepsData: [],

  avgSteps: 0,
  calories: 0,
  activeTime: "0h 0m",
  zptsEarned: 0,

  avgStepsChangePercent: 0,
  caloriesChangePercent: 0,
  activeTimeChangePercent: 0,
  zptsChangePercent: 0,

  completedTasks: 0,
  completedTaskCount: 0,
  totalTasks: 4,
  totalTaskCount: 4,
  dailyStreak: 0,

  consistency: [false, false, false, false, false, false, false],
  streakDays: 0,

  personalBests: [],
};

export default function ActivityPageV1({ onBack, email }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [panelIndex, setPanelIndex] = useState(0);
  const [progressRangeIndex, setProgressRangeIndex] = useState(1);
  const [touchStartX, setTouchStartX] = useState(null);

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

  const progressRange =
    PROGRESS_RANGES[progressRangeIndex] || PROGRESS_RANGES[1];

  const progressStepsData = useMemo(
    () => resolveStepsData(activityData, progressRange),
    [activityData, progressRange]
  );

  const progressTotalSteps = useMemo(
    () => resolveProgressTotal(activityData, progressRange, progressStepsData),
    [activityData, progressRange, progressStepsData]
  );

  const progressStepGoal = useMemo(
    () => resolveProgressGoal(activityData, progressRange),
    [activityData, progressRange]
  );

  function handleProgressRangeChange() {
    setProgressRangeIndex((current) => (current + 1) % PROGRESS_RANGES.length);
  }

  const panels = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        content: (
          <>
            <DailyLoopCard
              completedTasks={resolveCompletedTasks(activityData)}
              totalTasks={
                activityData.totalTasks ??
                activityData.total_tasks ??
                activityData.daily_tasks_total ??
                activityData.dailyTasksTotal ??
                activityData.totalTaskCount
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
        ),
      },
      {
        id: "progress",
        label: "Progress",
        content: (
          <>
            <ActivityProgressCardV1
              totalSteps={progressTotalSteps}
              stepGoal={progressStepGoal}
              stepChangePercent={activityData.stepChangePercent}
              stepsData={progressStepsData}
              rangeLabel={progressRange.label}
              onRangeChange={handleProgressRangeChange}
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
          </>
        ),
      },
    ],
    [
      activityData,
      progressRange.label,
      progressStepGoal,
      progressStepsData,
      progressTotalSteps,
    ]
  );

  function showNextPanel() {
    setPanelIndex((current) => (current + 1) % panels.length);
  }

  function showPreviousPanel() {
    setPanelIndex((current) =>
      current === 0 ? panels.length - 1 : current - 1
    );
  }

  function handleTouchEnd(event) {
    if (touchStartX === null) return;

    const touchEndX = event.changedTouches[0]?.clientX;
    const distance = touchStartX - touchEndX;

    if (distance > 35) showNextPanel();
    if (distance < -35) showPreviousPanel();

    setTouchStartX(null);
  }

  const activePanel = panels[panelIndex] || panels[0];

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#030711] px-4 pb-4 pt-4 text-white">
      <ActivityHeaderV1
        onBack={onBack}
        title="Activity"
        subtitle={activePanel?.label || "Overview"}
        className="shrink-0"
      />

      {loading ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-white/40">
          Loading activity...
        </div>
      ) : (
        <>
          <div className="mb-2.5 grid shrink-0 grid-cols-2 gap-2">
            {panels.map((panel, index) => (
              <button
                key={panel.id}
                type="button"
                onClick={() => setPanelIndex(index)}
                className={[
                  "rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition active:scale-[0.97]",
                  panelIndex === index
                    ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.12)]"
                    : "border-white/10 bg-white/[0.035] text-white/42",
                ].join(" ")}
              >
                {panel.label}
              </button>
            ))}
          </div>

          <div
            className="min-h-0 flex-1 overflow-hidden"
            onClick={showNextPanel}
            onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX)}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${panelIndex * 100}%)` }}
            >
              {panels.map((panel) => (
                <div
                  key={panel.id}
                  className="flex min-w-full flex-col justify-start gap-2.5 pt-2.5"
                >
                  {panel.content}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2.5 shrink-0">
            <PageDots activeIndex={panelIndex} total={panels.length} />
          </div>
        </>
      )}
    </div>
  );
}