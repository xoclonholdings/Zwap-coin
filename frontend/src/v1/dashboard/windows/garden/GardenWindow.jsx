import React, { useMemo } from "react";
import { ArrowLeft } from "lucide-react";

import {
  clamp,
  deriveGrowthStage,
  deriveHealth,
  getHealthState,
  normalizeStage,
} from "./gardenUtils";

import GardenHeroCard from "./GardenHeroCard";
import CareBonuses from "./CareBonuses";

export default function GardenWindow({
  streakDays = 0,
  dailySteps = 0,
  gamesPlayedToday = 0,
  lessonsCompletedToday = 0,
  healthPercent,
  growthStage,
  rarePlantUnlocked = false,
  fullLoopCompleted = false,
  missedDays = 0,
  gardenLevel,
  nextLevelPercent,
  onClose,
  showHeader = true,
}) {
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
      : clamp(
          ((Number(streakDays || 0) % 2) / 2) * 100 +
            (fullLoopCompleted ? 45 : 20)
        );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {showHeader ? (
        <div className="shrink-0 pb-3 pt-3">
          <div className="flex items-center justify-between px-4">
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/80 transition active:scale-[0.96]"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="text-center">
              <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                Garden
              </div>
              <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">
                Overview
              </div>
            </div>

            <div className="w-10" />
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden px-3 pb-3">
        <div className="flex h-full min-h-0 flex-col gap-3">
          <GardenHeroCard
            health={health}
            healthState={healthState}
            stage={stage}
            rarePlantUnlocked={rarePlantUnlocked}
            gardenLevel={safeGardenLevel}
            nextLevelPercent={safeNextLevelPercent}
          />

          <CareBonuses />
        </div>
      </div>
    </div>
  );
}