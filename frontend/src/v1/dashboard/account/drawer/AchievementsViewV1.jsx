import React from "react";
import {
  Award,
  CalendarCheck,
  ChevronLeft,
  Flame,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getNextBadge } from "@/lib/badges/getNextBadge";

function clampPercent(value = 0) {
  const safe = Number(value || 0);
  if (!Number.isFinite(safe)) return 0;
  return Math.max(0, Math.min(100, safe));
}

function toSafeNumber(value) {
  return Math.max(Number(value || 0), 0);
}

function ProgressBar({ value = 0, max = 1, tone = "cyan" }) {
  const safeMax = Math.max(1, Number(max || 1));
  const safeValue = Math.max(0, Number(value || 0));
  const percent = clampPercent((safeValue / safeMax) * 100);

  const fill =
    tone === "amber"
      ? "bg-gradient-to-r from-amber-300 via-orange-300 to-cyan-300 shadow-[0_0_14px_rgba(251,191,36,0.18)]"
      : "bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 shadow-[0_0_14px_rgba(34,211,238,0.22)]";

  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
      <div
        className={`h-full rounded-full transition-all duration-300 ${fill}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function HeaderButton({ children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/75 shadow-[0_0_10px_rgba(255,255,255,0.06)]"
    >
      {children}
    </button>
  );
}

function DailyLoopCard({
  completedTasks = 0,
  totalTasks = 4,
  dailyStreak = 0,
}) {
  const safeCompleted = Math.min(
    Math.max(toSafeNumber(completedTasks), 0),
    Math.max(1, toSafeNumber(totalTasks))
  );
  const safeTotal = Math.max(1, toSafeNumber(totalTasks));
  const safeStreak = toSafeNumber(dailyStreak);
  const percent = clampPercent((safeCompleted / safeTotal) * 100);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.16),transparent_44%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.10),transparent_36%),linear-gradient(180deg,rgba(12,20,32,0.96),rgba(5,9,18,0.98))] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.36)]">
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

function TrophyCard({ trophyCount = 0, trophyBonusPercent = 0 }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-amber-300/16 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.13),transparent_48%),linear-gradient(180deg,rgba(24,18,8,0.94),rgba(8,9,12,0.98))] p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_38%)]" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-300/24 bg-amber-300/[0.08] text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.14)]">
          <Trophy size={19} strokeWidth={2.3} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-black tracking-[-0.04em] text-white">
            Trophy Progress
          </div>
          <div className="mt-0.5 text-[11px] font-medium text-white/48">
            Permanent bonus +{Number(trophyBonusPercent || 0)}%
          </div>
        </div>

        <div className="text-[25px] font-black tracking-[-0.06em] text-amber-100">
          {Number(trophyCount || 0)}
        </div>
      </div>
    </div>
  );
}

function NextBadgeCard({ badge }) {
  const percent = clampPercent((badge.progress / Math.max(1, badge.goal)) * 100);

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-cyan-300/14 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_42%),linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.26)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_40%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.12)]">
              <Award size={19} strokeWidth={2.3} />
            </div>

            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/60">
                Next Badge
              </div>
              <div className="mt-0.5 text-[17px] font-black tracking-[-0.05em] text-white">
                {badge.label}
              </div>
            </div>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/48">
            {badge.category}
          </div>
        </div>

        <ProgressBar value={badge.progress} max={badge.goal} />

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-[11px] font-semibold text-white/48">
            {badge.progress} / {badge.goal}
          </div>

          <div className="text-[11px] font-black tracking-[-0.03em] text-cyan-100">
            {Math.round(percent)}%
          </div>
        </div>

        <div className="mt-2 rounded-[14px] border border-white/8 bg-black/20 px-3 py-2 text-[11px] font-medium leading-4 text-white/52">
          {badge.hint}
        </div>
      </div>
    </div>
  );
}

function LockedIdentityCard() {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50">
          <Lock size={18} strokeWidth={2.2} />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-black tracking-[-0.03em] text-white">
            Identity Tracking Locked
          </div>
          <div className="mt-1 text-xs leading-5 text-white/48">
            Badges become visible after enough real activity. Your progress can
            still build quietly in the background.
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }) {
  const name = achievement?.name || "";
  const level = achievement?.level || "";
  const progress = achievement?.progress || 0;
  const target = achievement?.target || 1;
  const description = achievement?.description || "";

  return (
    <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,24,34,0.94),rgba(6,10,18,0.98))] p-3 shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-cyan-300/18 bg-cyan-400/10 text-cyan-100">
          <Award size={18} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-black tracking-[-0.03em] text-white">
                {name}
              </div>

              {description ? (
                <div className="mt-0.5 line-clamp-2 text-xs leading-5 text-white/50">
                  {description}
                </div>
              ) : null}
            </div>

            {level ? (
              <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/55">
                {level}
              </div>
            ) : null}
          </div>

          <ProgressBar value={progress} max={target} />

          <div className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
            {progress} / {target}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AchievementsViewV1({
  onBack,
  user,
  achievements = [],
  trophyCount = 0,
  trophyBonusPercent = 0,
  dailyStreak,
  completedTasks,
  totalTasks = 4,
}) {
  const hasAchievements = Array.isArray(achievements) && achievements.length > 0;
  const nextBadge = getNextBadge(user || {});

  const resolvedDailyStreak =
    dailyStreak ??
    user?.daily_streak ??
    user?.dailyStreak ??
    user?.streak_days ??
    user?.streakDays ??
    0;

  const resolvedCompletedTasks =
    completedTasks ??
    user?.completedTasks ??
    user?.completed_tasks ??
    user?.daily_tasks_completed ??
    user?.dailyTasksCompleted ??
    0;

  const resolvedTotalTasks =
    totalTasks ??
    user?.totalTasks ??
    user?.total_tasks ??
    user?.daily_tasks_total ??
    user?.dailyTasksTotal ??
    4;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,rgba(6,12,18,0.98),rgba(4,8,14,1))] text-white">
      <div className="flex h-[56px] shrink-0 items-center justify-between border-b border-white/8 px-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-black tracking-[-0.03em] text-white/78"
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
          Back
        </button>

        <div className="text-[15px] font-black tracking-[-0.04em] text-white/92">
          Achievements
        </div>

        <HeaderButton label="Achievement glow">
          <Sparkles size={15} strokeWidth={2.3} />
        </HeaderButton>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-28 w-52 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto pr-1">
          <DailyLoopCard
            completedTasks={resolvedCompletedTasks}
            totalTasks={resolvedTotalTasks}
            dailyStreak={resolvedDailyStreak}
          />

          <TrophyCard
            trophyCount={trophyCount}
            trophyBonusPercent={trophyBonusPercent}
          />

          <NextBadgeCard badge={nextBadge} />

          {hasAchievements ? (
            achievements.map((achievement, index) => (
              <AchievementCard
                key={achievement?.id || achievement?.name || index}
                achievement={achievement}
              />
            ))
          ) : (
            <LockedIdentityCard />
          )}
        </div>
      </div>
    </div>
  );
}