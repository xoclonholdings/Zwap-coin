import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  clamp,
  deriveGrowthStage,
  deriveHealth,
  getGardenMessage,
  getHealthState,
  normalizeStage,
} from "./gardenUtils";

import GardenHeroCard from "./GardenHeroCard";
import GardenNotice from "./GardenNotice";
import CareBonuses from "./CareBonuses";
import DailyCareCard from "./DailyCareCard";
import GardenStatsView from "./GardenStatsView";

export default function GardenWindow({
  streakDays = 0,
  dailySteps = 0,
  gamesPlayedToday = 0,
  lessonsCompletedToday = 0,
  lastActiveAt,
  plantName = "Zyra",
  healthPercent,
  growthStage,
  rarePlantUnlocked = false,
  fullLoopCompleted = false,
  longestStreak = 0,
  totalBlooms = 0,
  activeDays = 0,
  missedDays = 0,
  daysUntilNextBloom,
  nextRareUnlock,
  streakGraceDaysRemaining = 3,
  gardenLevel,
  nextLevelPercent,
  className = "",
}) {
  const [view, setView] = useState("garden");

  const health = useMemo(
    () =>
      deriveHealth({
        healthPercent,
        streakDays,
        dailySteps,
        gamesPlayedToday,
        lessonsCompletedToday,
        fullLoopCompleted,
        missedDays,
      }),
    [
      healthPercent,
      streakDays,
      dailySteps,
      gamesPlayedToday,
      lessonsCompletedToday,
      fullLoopCompleted,
      missedDays,
    ]
  );

  const stage = useMemo(
    () =>
      normalizeStage(
        deriveGrowthStage({
          growthStage,
          rarePlantUnlocked,
          streakDays,
          dailySteps,
          gamesPlayedToday,
          lessonsCompletedToday,
        }),
        rarePlantUnlocked
      ),
    [
      growthStage,
      rarePlantUnlocked,
      streakDays,
      dailySteps,
      gamesPlayedToday,
      lessonsCompletedToday,
    ]
  );

  const healthState = useMemo(
    () => getHealthState(health, missedDays),
    [health, missedDays]
  );

  const safeGardenLevel =
    Number.isFinite(Number(gardenLevel)) && Number(gardenLevel) > 0
      ? Number(gardenLevel)
      : Math.max(1, Math.floor(Number(streakDays || 0) / 2) + 1);

  const safeNextLevelPercent =
    Number.isFinite(Number(nextLevelPercent)) && Number(nextLevelPercent) >= 0
      ? clamp(nextLevelPercent)
      : clamp(((Number(streakDays || 0) % 2) / 2) * 100 + (fullLoopCompleted ? 45 : 20));

  const nextBloom =
    Number.isFinite(Number(daysUntilNextBloom)) && Number(daysUntilNextBloom) >= 0
      ? Number(daysUntilNextBloom)
      : Math.max(0, 7 - Number(streakDays || 0));

  const rareTarget =
    nextRareUnlock ||
    (Number(streakDays || 0) < 30
      ? "30-day rare seed"
      : Number(streakDays || 0) < 60
        ? "60-day rare bloom"
        : Number(streakDays || 0) < 90
          ? "90-day rare bloom"
          : "Rare path complete");

  const message = getGardenMessage({
    healthState,
    stage,
    rarePlantUnlocked,
    streakDays,
  });

  const lastActiveLabel = lastActiveAt
    ? new Date(lastActiveAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "Today";

  return (
    <section
      className={`relative w-full overflow-hidden rounded-[1.75rem] border border-lime-300/15 bg-[#03070d] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.48)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(124,255,91,0.22),transparent_36%),radial-gradient(circle_at_85%_85%,rgba(103,242,255,0.14),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-lime-200/75 to-transparent" />

      <div className="relative z-10">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-[-0.04em] text-lime-300">
              Garden
            </h2>
            <p className="mt-1 text-xs font-semibold text-white/50">
              {plantName} · Last active {lastActiveLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setView(view === "garden" ? "stats" : "garden")}
            className="rounded-2xl border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-lime-200"
          >
            {view === "garden" ? "Stats" : "Garden"}
          </button>
        </header>

        <AnimatePresence mode="wait">
          {view === "garden" ? (
            <motion.div
              key="garden"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <GardenHeroCard
                health={health}
                healthState={healthState}
                stage={stage}
                rarePlantUnlocked={rarePlantUnlocked}
                gardenLevel={safeGardenLevel}
                nextLevelPercent={safeNextLevelPercent}
              />

              <GardenNotice message={message} />
              <CareBonuses />
              <DailyCareCard fullLoopCompleted={fullLoopCompleted} />
            </motion.div>
          ) : (
            <GardenStatsView
              health={health}
              stage={stage}
              streakDays={streakDays}
              dailySteps={dailySteps}
              gamesPlayedToday={gamesPlayedToday}
              lessonsCompletedToday={lessonsCompletedToday}
              activeDays={activeDays}
              longestStreak={longestStreak}
              totalBlooms={totalBlooms}
              missedDays={missedDays}
              streakGraceDaysRemaining={streakGraceDaysRemaining}
              rareTarget={rareTarget}
              nextBloom={nextBloom}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}