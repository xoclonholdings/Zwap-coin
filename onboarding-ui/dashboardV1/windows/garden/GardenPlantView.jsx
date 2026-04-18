import React from "react";
import { Droplets, Flame, MoonStar, Sprout } from "lucide-react";
import GardenPlantVisual from "./GardenPlantVisual";
import GardenHealthBar from "./GardenHealthBar";
import { getGraceLabel } from "./garden.utils";

export default function GardenPlantView({
  growthStage = "seed",
  healthBand = "stable",
  healthPercent = 0,
  rarePlantUnlocked = false,
  missedDays = 0,
  dailySteps = 0,
  streakDays = 0,
  daysUntilNextBloom = 0,
  totalBlooms = 0,
  streakGraceDaysRemaining = 3,
  recoveryHint = "Steady care is working.",
  healthDeltaHint = "No change yet",
}) {
  const bloomLabel =
    daysUntilNextBloom > 0
      ? `${daysUntilNextBloom} day${daysUntilNextBloom === 1 ? "" : "s"}`
      : totalBlooms > 0
      ? `${totalBlooms} total`
      : "Soon";

  return (
    <div className="space-y-4">
      <GardenPlantVisual
        growthStage={growthStage}
        healthBand={healthBand}
        rarePlantUnlocked={rarePlantUnlocked}
        missedDays={missedDays}
        dailySteps={dailySteps}
        streakDays={streakDays}
        daysUntilNextBloom={daysUntilNextBloom}
      />

      <GardenHealthBar
        healthPercent={healthPercent}
        healthBand={healthBand}
      />

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-fuchsia-300">
            <Flame className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/55">
              Streak
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-white">
            {streakDays} day{streakDays === 1 ? "" : "s"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-cyan-300">
            <Droplets className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/55">
              Steps
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-white">
            {Number(dailySteps || 0).toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <Sprout className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/55">
              Bloom
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-white">{bloomLabel}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-amber-300">
            <MoonStar className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/55">
              Grace
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-white">
            {getGraceLabel(streakGraceDaysRemaining)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-300/75">
          Reflection
        </p>
        <p className="mt-2 text-sm text-white/80">{recoveryHint}</p>
        <p className="mt-2 text-xs text-white/50">{healthDeltaHint}</p>
      </div>
    </div>
  );
}