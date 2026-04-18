import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import GardenHeader from "./GardenHeader";
import GardenPlantView from "./GardenPlantView";
import GardenStatsView from "./GardenStatsView";

import {
  clamp,
  getDerivedGrowthStage,
  getGardenRecoveryHint,
  getHealthBand,
  getHealthDeltaHint,
  getNextMilestone,
  getNextRareLabel,
  getStatusLine,
} from "./garden.utils";

export default function GardenWindow({
  streakDays = 0,
  dailySteps = 0,
  gamesPlayedToday = 0,
  lessonsCompletedToday = 0,
  lastActiveAt = null,
  fullLoopCompleted = false,
  healthPercent = 0,
  growthStage = "seed",
  plantName = "Garden",
  rarePlantUnlocked = false,
  longestStreak = 0,
  totalBlooms = 0,
  activeDays = 0,
  missedDays = 0,
  daysUntilNextBloom = 0,
  nextRareUnlock = null,
  streakGraceDaysRemaining = 3,
}) {
  const [view, setView] = useState("plant");

  const safeHealth = useMemo(() => clamp(healthPercent), [healthPercent]);

  const derivedGrowthStage = useMemo(
    () =>
      getDerivedGrowthStage({
        growthStage,
        streakDays,
        activeDays,
        fullLoopCompleted,
        rarePlantUnlocked,
      }),
    [growthStage, streakDays, activeDays, fullLoopCompleted, rarePlantUnlocked]
  );

  const healthBand = useMemo(
    () => getHealthBand(safeHealth, missedDays),
    [safeHealth, missedDays]
  );

  const statusLine = useMemo(
    () =>
      getStatusLine({
        healthBand,
        daysUntilNextBloom,
        streakDays,
        rarePlantUnlocked,
        dailySteps,
        gamesPlayedToday,
        lessonsCompletedToday,
        missedDays,
      }),
    [
      healthBand,
      daysUntilNextBloom,
      streakDays,
      rarePlantUnlocked,
      dailySteps,
      gamesPlayedToday,
      lessonsCompletedToday,
      missedDays,
    ]
  );

  const nextMilestone = useMemo(
    () =>
      getNextMilestone({
        daysUntilNextBloom,
        rarePlantUnlocked,
        growthStage: derivedGrowthStage,
      }),
    [daysUntilNextBloom, rarePlantUnlocked, derivedGrowthStage]
  );

  const nextRareLabel = useMemo(
    () => getNextRareLabel(nextRareUnlock, streakDays),
    [nextRareUnlock, streakDays]
  );

  const recoveryHint = useMemo(
    () =>
      getGardenRecoveryHint({
        missedDays,
        healthPercent: safeHealth,
        streakGraceDaysRemaining,
      }),
    [missedDays, safeHealth, streakGraceDaysRemaining]
  );

  const healthDeltaHint = useMemo(
    () =>
      getHealthDeltaHint({
        fullLoopCompleted,
        dailySteps,
        gamesPlayedToday,
        lessonsCompletedToday,
        missedDays,
      }),
    [
      fullLoopCompleted,
      dailySteps,
      gamesPlayedToday,
      lessonsCompletedToday,
      missedDays,
    ]
  );

  const handleToggleView = () => {
    setView((current) => (current === "plant" ? "stats" : "plant"));
  };

  return (
    <div className="rounded-[1.85rem] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(10,15,19,0.98),rgba(8,12,18,0.98))] p-4 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
      <GardenHeader
        plantName={plantName}
        statusLine={statusLine}
        rarePlantUnlocked={rarePlantUnlocked}
        view={view}
        onToggleView={handleToggleView}
      />

      <AnimatePresence mode="wait">
        {view === "plant" ? (
          <motion.div
            key="garden-plant"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <GardenPlantView
              growthStage={derivedGrowthStage}
              healthBand={healthBand}
              healthPercent={safeHealth}
              rarePlantUnlocked={rarePlantUnlocked}
              missedDays={missedDays}
              dailySteps={dailySteps}
              streakDays={streakDays}
              daysUntilNextBloom={daysUntilNextBloom}
              totalBlooms={totalBlooms}
              streakGraceDaysRemaining={streakGraceDaysRemaining}
              recoveryHint={recoveryHint}
              healthDeltaHint={healthDeltaHint}
            />
          </motion.div>
        ) : (
          <motion.div
            key="garden-stats"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <GardenStatsView
              healthPercent={safeHealth}
              activeDays={activeDays}
              longestStreak={longestStreak}
              totalBlooms={totalBlooms}
              missedDays={missedDays}
              growthStage={derivedGrowthStage}
              rarePlantUnlocked={rarePlantUnlocked}
              dailySteps={dailySteps}
              gamesPlayedToday={gamesPlayedToday}
              lessonsCompletedToday={lessonsCompletedToday}
              nextMilestone={nextMilestone}
              nextRareLabel={nextRareLabel}
              streakGraceDaysRemaining={streakGraceDaysRemaining}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}