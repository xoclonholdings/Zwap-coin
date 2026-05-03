import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

import { clamp } from "./gardenUtils";
import GardenHeroPlant from "./GardenHeroPlant";

function HealthPanel({ health, healthState }) {
  return (
    <div className="relative z-10 w-[34%] shrink-0">
      <div className="text-[12px] font-semibold text-white/88">
        Garden Health
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <Heart
          size={24}
          fill={healthState.accent}
          style={{ color: healthState.accent }}
        />

        <div
          className="text-[30px] font-black tracking-[-0.07em]"
          style={{ color: healthState.accent }}
        >
          {Math.round(health)}%
        </div>
      </div>

      <div className="mt-3 h-2 w-full max-w-[118px] overflow-hidden rounded-full bg-white/14">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${healthState.accent}, #baff6c)`,
            boxShadow: `0 0 18px ${healthState.glow}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${health}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      <p className="mt-4 max-w-[130px] text-[13px] font-semibold leading-snug text-white/76">
        Keep your streak alive to protect your Garden.
      </p>
    </div>
  );
}

function LevelPanel({ gardenLevel = 1, nextLevelPercent = 0 }) {
  const safeNext = clamp(nextLevelPercent);

  return (
    <div className="relative z-10 flex w-[28%] shrink-0 flex-col items-end text-right">
      <div className="text-[12px] font-semibold text-white/88">Level</div>

      <div className="mt-3 flex justify-end">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 border border-lime-300/45 bg-lime-300/10 shadow-[0_0_24px_rgba(124,255,91,0.22)] [clip-path:polygon(50%_0%,90%_23%,90%_76%,50%_100%,10%_76%,10%_23%)]" />

          <div className="relative text-[30px] font-black tracking-[-0.08em] text-white">
            {gardenLevel}
          </div>
        </div>
      </div>

      <div className="mt-4 text-[12px] font-semibold text-white/72">
        Next Level
      </div>

      <div className="mt-1 text-[24px] font-black tracking-[-0.06em] text-lime-300">
        {Math.round(safeNext)}%
      </div>

      <div className="mt-2 h-2 w-20 overflow-hidden rounded-full bg-white/14">
        <motion.div
          className="h-full rounded-full bg-lime-300 shadow-[0_0_12px_rgba(124,255,91,0.55)]"
          initial={{ width: 0 }}
          animate={{ width: `${safeNext}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function GardenHeroCard({
  health,
  healthState,
  stage,
  rarePlantUnlocked,
  gardenLevel,
  nextLevelPercent,
}) {
  return (
    <div className="relative min-h-[330px] overflow-hidden rounded-[1.5rem] border border-lime-300/20 bg-black/35 shadow-[0_22px_60px_rgba(0,0,0,0.38)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(91,255,83,0.18),rgba(3,20,12,0.94)_58%,rgba(2,8,14,1))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(145,255,99,0.2),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_38%)]" />

      <div className="absolute inset-0 flex items-end justify-center">
        <GardenHeroPlant
          stage={stage}
          healthState={healthState}
          rarePlantUnlocked={rarePlantUnlocked}
        />
      </div>

      <div className="relative z-10 flex h-full min-h-[330px] justify-between gap-2 p-4">
        <HealthPanel health={health} healthState={healthState} />

        <div className="pointer-events-none flex-1" />

        <LevelPanel
          gardenLevel={gardenLevel}
          nextLevelPercent={nextLevelPercent}
        />
      </div>
    </div>
  );
}