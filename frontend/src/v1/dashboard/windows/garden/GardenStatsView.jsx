import React from "react";
import { motion } from "framer-motion";

import { formatNumber, getStageLabel } from "./gardenUtils";

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/38">
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
    </div>
  );
}

export default function GardenStatsView({
  health,
  stage,
  streakDays,
  dailySteps,
  gamesPlayedToday,
  lessonsCompletedToday,
  activeDays,
  longestStreak,
  totalBlooms,
  missedDays,
  streakGraceDaysRemaining,
  rareTarget,
}) {
  return (
    <motion.div
      key="stats"
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4"
    >
      <div className="mb-4">
        <div className="text-sm font-black text-white">Garden Stats</div>
        <div className="mt-1 text-xs font-semibold text-white/52">
          Consistency snapshot
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatPill label="Health" value={`${Math.round(health)}%`} />
        <StatPill label="Stage" value={getStageLabel(stage)} />
        <StatPill label="Streak" value={`${formatNumber(streakDays)}d`} />
        <StatPill label="Steps" value={formatNumber(dailySteps)} />
        <StatPill label="Games" value={formatNumber(gamesPlayedToday)} />
        <StatPill label="Lessons" value={formatNumber(lessonsCompletedToday)} />
        <StatPill label="Active Days" value={formatNumber(activeDays || streakDays)} />
        <StatPill label="Longest" value={`${formatNumber(longestStreak || streakDays)}d`} />
        <StatPill label="Blooms" value={formatNumber(totalBlooms)} />
        <StatPill label="Grace" value={`${formatNumber(streakGraceDaysRemaining)}d`} />
      </div>

      <div className="mt-4 rounded-2xl border border-lime-300/15 bg-lime-300/[0.045] p-3">
        <div className="text-xs font-black uppercase tracking-[0.14em] text-lime-300">
          Next Rare Unlock
        </div>
        <div className="mt-1 text-sm font-bold text-white">{rareTarget}</div>
        <div className="mt-2 text-xs font-semibold text-white/50">
          Missed days: {formatNumber(missedDays)}
        </div>
      </div>
    </motion.div>
  );
}
