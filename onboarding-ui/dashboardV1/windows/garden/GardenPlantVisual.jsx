import React from "react";
import { motion } from "framer-motion";
import { Droplets, Flame, Flower2, Leaf, Sparkles } from "lucide-react";
import { getGrowthStageLabel } from "./garden.utils";

export default function GardenPlantVisual({
  growthStage = "seed",
  healthBand = "stable",
  rarePlantUnlocked = false,
  missedDays = 0,
  dailySteps = 0,
  streakDays = 0,
  daysUntilNextBloom = 0,
}) {
  const isRare = rarePlantUnlocked || growthStage === "rare";
  const isWilted = healthBand === "wilted";
  const isWeak = healthBand === "weak" || healthBand === "fading";

  const stemHeight =
    growthStage === "seed"
      ? "h-10"
      : growthStage === "sprout"
      ? "h-16"
      : growthStage === "young"
      ? "h-24"
      : growthStage === "mature"
      ? "h-28"
      : "h-30";

  const stemColor = isWilted
    ? "from-stone-700 via-stone-500 to-stone-400"
    : isWeak
    ? "from-emerald-900 via-emerald-700 to-lime-300"
    : isRare
    ? "from-cyan-500 via-emerald-400 to-lime-200"
    : "from-emerald-800 via-emerald-500 to-lime-300";

  const leafOpacity = isWilted ? "opacity-30" : isWeak ? "opacity-70" : "opacity-100";
  const rotateLeft = isWilted ? -38 : isWeak ? -22 : -10;
  const rotateRight = isWilted ? 38 : isWeak ? 22 : 10;
  const translateY = isWilted ? 10 : isWeak ? 4 : 0;

  const rareBorder = isRare
    ? "border-cyan-300/25 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
    : "border-white/10";

  const bloomLabel =
    daysUntilNextBloom > 0
      ? `${daysUntilNextBloom} day${daysUntilNextBloom === 1 ? "" : "s"}`
      : isRare
      ? "Rare"
      : "Growing";

  return (
    <div className={`relative rounded-[1.75rem] border bg-white/[0.03] p-4 ${rareBorder}`}>
      <motion.div
        className={[
          "absolute left-1/2 top-10 h-36 w-36 -translate-x-1/2 rounded-full blur-3xl",
          isRare
            ? "bg-cyan-400/20"
            : healthBand === "healthy"
            ? "bg-emerald-400/18"
            : healthBand === "stable"
            ? "bg-teal-400/14"
            : healthBand === "fading"
            ? "bg-lime-300/10"
            : healthBand === "weak"
            ? "bg-amber-400/12"
            : "bg-rose-400/12",
        ].join(" ")}
        animate={{
          scale: isRare ? [1, 1.08, 1] : [1, 1.03, 1],
          opacity: isRare ? [0.4, 0.8, 0.4] : [0.25, 0.5, 0.25],
        }}
        transition={{
          duration: isRare ? 3.2 : 4.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative mx-auto flex h-64 max-w-[260px] items-end justify-center">
        <motion.div
          className={`absolute bottom-24 w-[8px] rounded-full bg-gradient-to-t ${stemColor} ${stemHeight}`}
          animate={{
            y: [translateY, translateY - 2, translateY],
            rotate: isWilted ? [2, 4, 2] : [0, 1.5, 0],
          }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        />

        {growthStage !== "seed" && (
          <>
            <motion.div
              className={`absolute bottom-38 left-[calc(50%-36px)] h-9 w-14 rounded-[999px_999px_999px_0] bg-gradient-to-br from-lime-300 to-emerald-500 ${leafOpacity}`}
              animate={{
                rotate: [rotateLeft, rotateLeft + 4, rotateLeft],
                y: [translateY, translateY + 1, translateY],
              }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className={`absolute bottom-38 left-[calc(50%+4px)] h-9 w-14 rounded-[999px_999px_0_999px] bg-gradient-to-br from-lime-300 to-emerald-500 ${leafOpacity}`}
              animate={{
                rotate: [rotateRight, rotateRight - 4, rotateRight],
                y: [translateY, translateY + 1, translateY],
              }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        {(growthStage === "young" || growthStage === "mature" || growthStage === "rare") && (
          <>
            <motion.div
              className={`absolute bottom-50 left-[calc(50%-22px)] h-8 w-12 rounded-[999px_999px_999px_0] bg-gradient-to-br from-emerald-300 to-green-500 ${leafOpacity}`}
              animate={{
                rotate: [rotateLeft - 4, rotateLeft, rotateLeft - 4],
                y: [translateY, translateY + 1, translateY],
              }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className={`absolute bottom-50 left-[calc(50%+6px)] h-8 w-12 rounded-[999px_999px_0_999px] bg-gradient-to-br from-emerald-300 to-green-500 ${leafOpacity}`}
              animate={{
                rotate: [rotateRight + 4, rotateRight, rotateRight + 4],
                y: [translateY, translateY + 1, translateY],
              }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        {(growthStage === "mature" || growthStage === "rare") && (
          <motion.div
            className={[
              "absolute bottom-[92px] left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border",
              isRare
                ? "border-cyan-300/40 bg-gradient-to-br from-cyan-300 via-fuchsia-400 to-violet-500 shadow-[0_0_26px_rgba(34,211,238,0.25)]"
                : "border-fuchsia-300/30 bg-gradient-to-br from-fuchsia-300 via-pink-400 to-violet-500 shadow-[0_0_22px_rgba(217,70,239,0.25)]",
              isWilted ? "opacity-50 saturate-50" : "",
            ].join(" ")}
            animate={{
              y: isWilted ? [4, 6, 4] : [0, -3, 0],
              scale: isRare ? [1, 1.06, 1] : [1, 1.03, 1],
            }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="h-4 w-4 rounded-full bg-white/80" />
          </motion.div>
        )}

        {growthStage === "seed" && (
          <motion.div
            className={`absolute bottom-28 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gradient-to-br from-lime-300 to-emerald-500 ${leafOpacity}`}
            animate={{ y: [translateY, translateY - 1, translateY] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {isRare && (
          <>
            <motion.div
              className="absolute bottom-[144px] left-[calc(50%-56px)] text-cyan-300"
              animate={{ opacity: [0.25, 0.9, 0.25], y: [0, -4, 0] }}
              transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
            <motion.div
              className="absolute bottom-[164px] left-[calc(50%+28px)] text-fuchsia-300"
              animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -5, 0] }}
              transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
          </>
        )}

        {missedDays >= 1 && !isRare && (
          <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55">
            {missedDays === 1 ? "Fading" : missedDays === 2 ? "Weak" : "Wilted"}
          </div>
        )}

        <div className="absolute bottom-10 h-16 w-32 rounded-[2rem_2rem_2.6rem_2.6rem] border border-white/10 bg-gradient-to-b from-stone-600/80 to-stone-900/95" />
        <div className="absolute bottom-[58px] h-5 w-28 rounded-full bg-stone-950/80" />
        <div className="absolute bottom-6 h-3 w-40 rounded-full bg-black/30 blur-md" />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <Leaf className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/55">
              Stage
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-white">
            {getGrowthStageLabel(growthStage, isRare)}
          </p>
        </div>

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
          <div className="flex items-center gap-2 text-amber-300">
            <Flower2 className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/55">
              Bloom
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-white">{bloomLabel}</p>
        </div>
      </div>
    </div>
  );
}