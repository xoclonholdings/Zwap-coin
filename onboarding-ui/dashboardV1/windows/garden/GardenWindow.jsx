import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Droplets,
  Flame,
  Flower2,
  Leaf,
  MoonStar,
  Sparkles,
  Sprout,
} from "lucide-react";

const FUTURE_GARDEN_ITEMS = {
  waterToken: null,
  fertilizerPack: null,
  gardenRecoveryToken: null,
  rareSeedCapsule: null,
  potVariants: null,
  seasonalThemes: null,
  nightGarden: null,
  neonGarden: null,
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getHealthBand(healthPercent, missedDays = 0) {
  if (missedDays >= 3 || healthPercent < 15) return "wilted";
  if (missedDays === 2 || healthPercent < 40) return "weak";
  if (missedDays === 1) return "fading";
  if (healthPercent > 75) return "healthy";
  return "stable";
}

function getGraceLabel(streakGraceDaysRemaining = 0) {
  if (streakGraceDaysRemaining <= 0) return "Grace spent";
  if (streakGraceDaysRemaining === 1) return "1 grace day left";
  return `${streakGraceDaysRemaining} grace days left`;
}

function getGrowthStageLabel(growthStage, rarePlantUnlocked) {
  if (rarePlantUnlocked || growthStage === "rare") return "Rare";
  switch (growthStage) {
    case "seed":
      return "Seed";
    case "sprout":
      return "Sprout";
    case "young":
      return "Young";
    case "mature":
      return "Mature";
    default:
      return "Seed";
  }
}

function getNextRareLabel(nextRareUnlock, streakDays) {
  if (!nextRareUnlock) {
    if (streakDays < 30) return "30-day streak";
    if (streakDays < 60) return "60-day streak";
    if (streakDays < 90) return "90-day streak";
    return "Rare growth unlocked";
  }

  if (typeof nextRareUnlock === "number") {
    return `${nextRareUnlock}-day streak`;
  }

  return nextRareUnlock;
}

function getStatusLine({
  healthBand,
  daysUntilNextBloom,
  streakDays,
  rarePlantUnlocked,
  dailySteps,
  gamesPlayedToday,
  lessonsCompletedToday,
  missedDays,
}) {
  if (rarePlantUnlocked) return "Rare growth unlocked.";
  if (daysUntilNextBloom === 1) return "One more day to bloom.";
  if (daysUntilNextBloom === 2) return "Two more days to bloom.";

  if (healthBand === "healthy" && streakDays >= 7) {
    return "Your streak is keeping this alive.";
  }

  if (healthBand === "healthy" && (dailySteps > 0 || gamesPlayedToday > 0 || lessonsCompletedToday > 0)) {
    return "Your plant is thriving.";
  }

  if (healthBand === "stable") return "Growing steadily.";
  if (healthBand === "fading") return "You kept it alive today.";
  if (healthBand === "weak" && missedDays > 0) return "Needs attention.";
  if (healthBand === "weak") return "A little movement would help.";
  return "Your garden misses you.";
}

function getDerivedGrowthStage({
  growthStage,
  streakDays,
  activeDays,
  fullLoopCompleted,
  rarePlantUnlocked,
}) {
  if (rarePlantUnlocked || streakDays >= 30) return "rare";
  if (growthStage) return growthStage;

  if (streakDays >= 14 || (fullLoopCompleted && activeDays >= 10)) return "mature";
  if (streakDays >= 7 || activeDays >= 6) return "young";
  if (streakDays >= 3 || activeDays >= 3) return "sprout";
  return "seed";
}

function getGardenRecoveryHint({ missedDays, healthPercent, streakGraceDaysRemaining }) {
  if (missedDays <= 0 && healthPercent > 75) return "Steady care is working.";
  if (missedDays === 1) return "A small return day will help it recover.";
  if (missedDays === 2) return "A stronger day will help it lift again.";
  if (streakGraceDaysRemaining > 0) return "It can still recover with a return day.";
  return "Recovery will happen gradually.";
}

function getHealthDeltaHint({
  fullLoopCompleted,
  dailySteps,
  gamesPlayedToday,
  lessonsCompletedToday,
  missedDays,
}) {
  const hasStrongMovement = dailySteps >= 5000;
  const hasCombinedDay =
    dailySteps >= 3000 &&
    gamesPlayedToday > 0 &&
    lessonsCompletedToday > 0;

  if (missedDays > 0) return "-10 inactive day";
  if (hasCombinedDay) return "+10 strong combined day";
  if (fullLoopCompleted) return "+15 full daily loop";
  if (hasStrongMovement) return "+5 strong movement day";
  if (gamesPlayedToday > 0 || lessonsCompletedToday > 0 || dailySteps > 0) {
    return "+5 streak maintained";
  }

  return "No change yet";
}

function HealthBar({ healthPercent, healthBand }) {
  const width = `${clamp(healthPercent)}%`;

  const fillClass =
    healthBand === "healthy"
      ? "from-emerald-400 via-lime-300 to-cyan-300"
      : healthBand === "stable"
      ? "from-teal-400 via-emerald-400 to-lime-300"
      : healthBand === "fading"
      ? "from-amber-300 via-lime-300 to-emerald-300"
      : healthBand === "weak"
      ? "from-amber-400 via-orange-400 to-pink-400"
      : "from-rose-500 via-orange-500 to-amber-400";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-white/55">
        <span>Health</span>
        <span>{clamp(healthPercent)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${fillClass}`}
          initial={{ width: 0 }}
          animate={{ width }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function PlantVisual({
  growthStage,
  healthBand,
  rarePlantUnlocked,
  missedDays,
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
              animate={{ rotate: [rotateLeft, rotateLeft + 4, rotateLeft], y: [translateY, translateY + 1, translateY] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className={`absolute bottom-38 left-[calc(50%+4px)] h-9 w-14 rounded-[999px_999px_0_999px] bg-gradient-to-br from-lime-300 to-emerald-500 ${leafOpacity}`}
              animate={{ rotate: [rotateRight, rotateRight - 4, rotateRight], y: [translateY, translateY + 1, translateY] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        {(growthStage === "young" || growthStage === "mature" || growthStage === "rare") && (
          <>
            <motion.div
              className={`absolute bottom-50 left-[calc(50%-22px)] h-8 w-12 rounded-[999px_999px_999px_0] bg-gradient-to-br from-emerald-300 to-green-500 ${leafOpacity}`}
              animate={{ rotate: [rotateLeft - 4, rotateLeft, rotateLeft - 4], y: [translateY, translateY + 1, translateY] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className={`absolute bottom-50 left-[calc(50%+6px)] h-8 w-12 rounded-[999px_999px_0_999px] bg-gradient-to-br from-emerald-300 to-green-500 ${leafOpacity}`}
              animate={{ rotate: [rotateRight + 4, rotateRight, rotateRight + 4], y: [translateY, translateY + 1, translateY] }}
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
          <p className="mt-2 text-sm font-medium text-white">{missedDays > 0 ? "Paused" : "Alive"}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-cyan-300">
            <Droplets className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/55">
              Steps
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-white">Today</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2 text-amber-300">
            <Flower2 className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-white/55">
              Bloom
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-white">{isRare ? "Rare" : "Growing"}</p>
        </div>
      </div>
    </div>
  );
}

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

  const safeHealth = clamp(healthPercent);
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

  const nextMilestone = useMemo(() => {
    if (daysUntilNextBloom > 0) {
      return `${daysUntilNextBloom} day${daysUntilNextBloom === 1 ? "" : "s"} until next bloom`;
    }
    if (rarePlantUnlocked) return "Rare growth maintained";
    if (derivedGrowthStage === "seed") return "Build early consistency";
    if (derivedGrowthStage === "sprout") return "Keep the plant steady";
    if (derivedGrowthStage === "young") return "Approach mature bloom";
    if (derivedGrowthStage === "mature") return "Chase rare growth";
    return "Keep it glowing";
  }, [daysUntilNextBloom, rarePlantUnlocked, derivedGrowthStage]);

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
    [fullLoopCompleted, dailySteps, gamesPlayedToday, lessonsCompletedToday, missedDays]
  );

  return (
    <div className="rounded-[1.85rem] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(10,15,19,0.98),rgba(8,12,18,0.98))] p-4 shadow-[0_0_30px_rgba(16,185,129,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-300/75">
            Garden
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">{plantName || "Garden"}</h3>
          <p className="mt-1 text-sm text-white/72">{statusLine}</p>
        </div>

        <div className="flex items-center gap-2">
          {rarePlantUnlocked && (
            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-200">
              Rare
            </span>
          )}
          <button
            type="button"
            onClick={() => setView((current) => (current === "plant" ? "stats" : "plant"))}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/65"
          >
            {view === "plant" ? "Stats" : "Plant"}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "plant" ? (
          <motion.div
            key="garden-plant"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="space-y-4"
          >
            <PlantVisual
              growthStage={derivedGrowthStage}
              healthBand={healthBand}
              rarePlantUnlocked={rarePlantUnlocked}
              missedDays={missedDays}
            />

            <HealthBar healthPercent={safeHealth} healthBand={healthBand} />

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
                <p className="mt-2 text-sm font-medium text-white">
                  {daysUntilNextBloom > 0
                    ? `${daysUntilNextBloom} day${daysUntilNextBloom === 1 ? "" : "s"}`
                    : totalBlooms > 0
                    ? `${totalBlooms} total`
                    : "Soon"}
                </p>
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
          </motion.div>
        ) : (
          <motion.div
            key="garden-stats"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                  Health Percent
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{safeHealth}%</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                  Days Active
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{activeDays}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                  Longest Streak
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{longestStreak}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                  Total Blooms
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{totalBlooms}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                  Missed Days
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{missedDays}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">
                  Growth Stage
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {getGrowthStageLabel(derivedGrowthStage, rarePlantUnlocked)}
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
                  <p className="mt-1 font-medium">{Number(dailySteps || 0).toLocaleString()}</p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}