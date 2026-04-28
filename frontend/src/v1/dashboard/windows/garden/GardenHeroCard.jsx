import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

import { clamp } from "./gardenUtils";
import GardenHeroPlant from "./GardenHeroPlant";

function HealthPanel({ health, healthState }) {
  return (
    <div>
      <div className="text-sm font-bold text-white">Garden Health</div>

      <div className="mt-4 flex items-center gap-2">
        <Heart size={30} fill={healthState.accent} style={{ color: healthState.accent }} />
        <div
          className="text-4xl font-black tracking-[-0.06em]"
          style={{ color: healthState.accent }}
        >
          {Math.round(health)}%
        </div>
      </div>

      <div className="mt-4 h-3 w-36 overflow-hidden rounded-full bg-white/12">
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

      <p className="mt-4 max-w-[160px] text-sm font-semibold leading-snug text-white/78">
        Keep your streak alive to protect your Garden.
      </p>
    </div>
  );
}

function LevelPanel({ gardenLevel = 1, nextLevelPercent = 0 }) {
  const safeNext = clamp(nextLevelPercent);

  return (
    <div className="text-right">
      <div className="text-sm font-bold text-white">Level</div>

      <div className="mt-3 flex justify-end">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl border border-lime-300/40 bg-lime-300/10 shadow-[0_0_24px_rgba(124,255,91,0.22)] [clip-path:polygon(50%_0%,90%_23%,90%_76%,50%_100%,10%_76%,10%_23%)]" />
          <div className="relative text-4xl font-black tracking-[-0.08em] text-white">
            {gardenLevel}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs font-bold text-white/72">Next Level</div>
      <div className="mt-1 text-2xl font-black text-lime-300">
        {Math.round(safeNext)}%
      </div>

      <div className="ml-auto mt-2 h-2 w-20 overflow-hidden rounded-full bg-white/12">
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
    <div className="relative overflow-hidden rounded-[1.5rem] border border-lime-300/20 bg-black/35">
      <GardenHeroPlant
        stage={stage}
        healthState={healthState}
        rarePlantUnlocked={rarePlantUnlocked}
      />

      <div className="pointer-events-none absolute inset-0 p-5">
        <div className="flex justify-between gap-4">
          <HealthPanel health={health} healthState={healthState} />
          <LevelPanel gardenLevel={gardenLevel} nextLevelPercent={nextLevelPercent} />
        </div>
      </div>
    </div>
  );
}