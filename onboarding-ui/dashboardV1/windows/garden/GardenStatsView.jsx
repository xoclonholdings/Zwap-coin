import React from "react";
import { getGraceLabel, getGrowthStageLabel } from "./garden.utils";

export default function GardenStatsView({
  healthPercent = 0,
  activeDays = 0,
  longestStreak = 0,
  totalBlooms = 0,
  missedDays = 0,
  growthStage = "seed",
  rarePlantUnlocked = false,
  dailySteps = 0,
  gamesPlayedToday = 0,
  lessonsCompletedToday = 0,
  nextMilestone = "Build early consistency",
  nextRareLabel = "30-day streak",
  streakGraceDaysRemaining = 3,
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
            Health Percent
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {healthPercent}%
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
            Days Active
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {activeDays}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
            Longest Streak
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {longestStreak}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
            Total Blooms
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {totalBlooms}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
            Missed Days
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {missedDays}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
            Growth Stage
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {getGrowthStageLabel(growthStage, rarePlantUnlocked)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-300/75">
          Today
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-white">
          <div>
            <span className="text-white/50">Steps</span>
            <p className="mt-1 font-medium">
              {Number(dailySteps || 0).toLocaleString()}
            </p>
          </div>

          <div>
            <span className="text-white/50">Games</span>
            <p className="mt-1 font-medium">{gamesPlayedToday}</p>
          </div>

          <div>
            <span className="text-white/50">Lessons</span>
            <p className="mt-1 font-medium">{lessonsCompletedToday}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
          Next Unlock Milestone
        </p>
        <p className="mt-2 text-sm text-white/80">{nextMilestone}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
          Next Rare Unlock
        </p>
        <p className="mt-2 text-sm text-white/80">{nextRareLabel}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
          Streak Grace
        </p>
        <p className="mt-2 text-sm text-white/80">
          {getGraceLabel(streakGraceDaysRemaining)}
        </p>
      </div>
    </div>
  );
}