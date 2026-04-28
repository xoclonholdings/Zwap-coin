import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Leaf, Sparkles } from "lucide-react";

function clamp(value, min = 0, max = 100) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, num));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function normalizeStage(stage, rarePlantUnlocked) {
  if (rarePlantUnlocked) return "rare";

  const safe = String(stage || "").toLowerCase();

  if (["seed", "sprout", "young", "mature", "rare"].includes(safe)) {
    return safe;
  }

  return "seed";
}

function getHealthState(healthPercent = 0, missedDays = 0) {
  const health = clamp(healthPercent);

  if (health < 15 || missedDays >= 3) {
    return {
      key: "wilted",
      label: "Wilting",
      message: "Your garden needs attention.",
      glow: "rgba(255, 111, 145, 0.28)",
      accent: "#ff7aa8",
    };
  }

  if (health < 40 || missedDays >= 2) {
    return {
      key: "weak",
      label: "Weak",
      message: "A little movement would help.",
      glow: "rgba(255, 178, 102, 0.24)",
      accent: "#ffbc7a",
    };
  }

  if (health <= 75 || missedDays >= 1) {
    return {
      key: "stable",
      label: "Stable",
      message: "Growing steadily.",
      glow: "rgba(103, 242, 255, 0.18)",
      accent: "#67f2ff",
    };
  }

  return {
    key: "healthy",
    label: "Healthy",
    message: "Your plant is thriving.",
    glow: "rgba(95, 255, 178, 0.24)",
    accent: "#72ffbf",
  };
}

function getStageLabel(stage) {
  const labels = {
    seed: "Seed",
    sprout: "Sprout",
    young: "Young Plant",
    mature: "Blooming",
    rare: "Rare Growth",
  };

  return labels[stage] || "Seed";
}

function getStatusLine({
  stage,
  healthState,
  rarePlantUnlocked,
  daysUntilNextBloom,
  streakDays,
}) {
  if (rarePlantUnlocked || stage === "rare") return "Rare growth unlocked.";
  if (healthState.key === "wilted") return "Your garden misses you.";
  if (healthState.key === "weak") return "Needs attention.";
  if (Number(daysUntilNextBloom) > 0 && Number(daysUntilNextBloom) <= 3) {
    return `${daysUntilNextBloom} more day${
      Number(daysUntilNextBloom) === 1 ? "" : "s"
    } to bloom.`;
  }
  if (Number(streakDays) >= 3) return "Your streak is keeping this alive.";
  return healthState.message;
}

function deriveGrowthStage({
  growthStage,
  rarePlantUnlocked,
  streakDays,
  dailySteps,
  gamesPlayedToday,
  lessonsCompletedToday,
}) {
  const explicitStage = String(growthStage || "").toLowerCase();

  if (rarePlantUnlocked || explicitStage === "rare") return "rare";
  if (["seed", "sprout", "young", "mature"].includes(explicitStage)) {
    return explicitStage;
  }

  const streak = Number(streakDays || 0);
  const steps = Number(dailySteps || 0);
  const games = Number(gamesPlayedToday || 0);
  const lessons = Number(lessonsCompletedToday || 0);
  const activityScore =
    Math.min(steps / 1000, 8) + games * 1.5 + lessons * 2 + streak;

  if (streak >= 14 && activityScore >= 18) return "mature";
  if (streak >= 7 && activityScore >= 10) return "young";
  if (streak >= 3 || activityScore >= 4) return "sprout";
  return "seed";
}

function deriveHealth({
  healthPercent,
  streakDays,
  dailySteps,
  gamesPlayedToday,
  lessonsCompletedToday,
  fullLoopCompleted,
  missedDays,
}) {
  if (Number.isFinite(Number(healthPercent))) {
    return clamp(healthPercent);
  }

  let health = 50;

  if (Number(dailySteps || 0) >= 2000) health += 10;
  if (Number(dailySteps || 0) >= 5000) health += 10;
  if (Number(gamesPlayedToday || 0) > 0) health += 8;
  if (Number(lessonsCompletedToday || 0) > 0) health += 8;
  if (fullLoopCompleted) health += 15;
  if (Number(streakDays || 0) >= 3) health += 5;
  if (Number(streakDays || 0) >= 7) health += 5;

  health -= Number(missedDays || 0) * 10;

  return clamp(health);
}

function GardenPlant({ stage, healthState, rarePlantUnlocked }) {
  const isWeak = healthState.key === "weak" || healthState.key === "wilted";
  const isRare = rarePlantUnlocked || stage === "rare";
  const leafOpacity = healthState.key === "wilted" ? 0.45 : 1;
  const droop = healthState.key === "wilted" ? 16 : healthState.key === "weak" ? 8 : 0;

  const showLeaves = stage !== "seed";
  const showSecondLeaves = ["young", "mature", "rare"].includes(stage);
  const showFlower = ["mature", "rare"].includes(stage);

  return (
    <div className="relative flex h-[190px] w-full items-end justify-center overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute bottom-12 h-36 w-36 rounded-full blur-2xl"
        style={{
          background: isRare
            ? "radial-gradient(circle, rgba(255,122,231,0.34), rgba(103,242,255,0.18), transparent 68%)"
            : `radial-gradient(circle, ${healthState.glow}, transparent 70%)`,
        }}
        animate={{
          scale: isRare ? [1, 1.08, 1] : [1, 1.035, 1],
          opacity: isWeak ? [0.38, 0.5, 0.38] : [0.65, 0.9, 0.65],
        }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {isRare ? (
        <div className="absolute inset-x-0 bottom-24 mx-auto h-28 w-40">
          {[0, 1, 2, 3, 4, 5].map((particle) => (
            <motion.span
              key={particle}
              className="absolute h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,242,255,0.9)]"
              style={{
                left: `${18 + particle * 12}%`,
                bottom: `${12 + (particle % 3) * 18}px`,
              }}
              animate={{
                y: [-2, -16, -2],
                opacity: [0.25, 0.9, 0.25],
              }}
              transition={{
                duration: 2.4 + particle * 0.22,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      ) : null}

      <motion.div
        className="relative z-10 flex flex-col items-center"
        animate={{ y: isWeak ? [0, 1, 0] : [0, -4, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative flex h-32 w-28 items-end justify-center">
          <div
            className="absolute bottom-0 h-24 w-2 rounded-full"
            style={{
              opacity: stage === "seed" ? 0.25 : leafOpacity,
              transform: `rotate(${droop > 0 ? droop / 4 : 0}deg)`,
              background: isRare
                ? "linear-gradient(to top, #48ffcc, #ff7ae7)"
                : "linear-gradient(to top, #1f8f6a, #7dffd4)",
              boxShadow: isRare
                ? "0 0 22px rgba(255,122,231,0.5)"
                : "0 0 14px rgba(103,242,255,0.28)",
            }}
          />

          {stage === "seed" ? (
            <motion.div
              className="absolute bottom-3 h-5 w-3 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(103,242,255,0.95), rgba(125,255,212,0.9))",
                boxShadow: "0 0 16px rgba(103,242,255,0.45)",
              }}
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
          ) : null}

          {showLeaves ? (
            <>
              <div
                className="absolute bottom-12 left-9 h-8 w-12 rounded-[100%_0_100%_0] blur-[0.1px]"
                style={{
                  opacity: leafOpacity,
                  transform: `rotate(${-34 - droop}deg)`,
                  background: isRare
                    ? "linear-gradient(135deg, #61ffd6, #b486ff)"
                    : "linear-gradient(135deg, #4fffb1, #1fbf88)",
                  boxShadow: isRare
                    ? "0 0 18px rgba(180,134,255,0.5)"
                    : "0 0 12px rgba(95,255,178,0.28)",
                }}
              />
              <div
                className="absolute bottom-14 right-9 h-8 w-12 rounded-[0_100%_0_100%] blur-[0.1px]"
                style={{
                  opacity: leafOpacity,
                  transform: `rotate(${34 + droop}deg)`,
                  background: isRare
                    ? "linear-gradient(135deg, #67f2ff, #ff7ae7)"
                    : "linear-gradient(135deg, #67f2ff, #2ee59d)",
                  boxShadow: isRare
                    ? "0 0 18px rgba(255,122,231,0.5)"
                    : "0 0 12px rgba(103,242,255,0.28)",
                }}
              />
            </>
          ) : null}

          {showSecondLeaves ? (
            <>
              <div
                className="absolute bottom-20 left-8 h-7 w-11 rounded-[100%_0_100%_0]"
                style={{
                  opacity: leafOpacity,
                  transform: `rotate(${-18 - droop}deg)`,
                  background: isRare
                    ? "linear-gradient(135deg, #b486ff, #72ffbf)"
                    : "linear-gradient(135deg, #9dffdc, #31d69a)",
                }}
              />
              <div
                className="absolute bottom-[5.4rem] right-8 h-7 w-11 rounded-[0_100%_0_100%]"
                style={{
                  opacity: leafOpacity,
                  transform: `rotate(${18 + droop}deg)`,
                  background: isRare
                    ? "linear-gradient(135deg, #ff7ae7, #67f2ff)"
                    : "linear-gradient(135deg, #67f2ff, #72ffbf)",
                }}
              />
            </>
          ) : null}

          {showFlower ? (
            <motion.div
              className="absolute bottom-[6.9rem] flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                opacity: leafOpacity,
                background: isRare
                  ? "radial-gradient(circle, #ffffff 0 13%, #ff7ae7 15% 42%, #67f2ff 48% 72%, transparent 74%)"
                  : "radial-gradient(circle, #ffffff 0 13%, #67f2ff 15% 44%, #72ffbf 48% 72%, transparent 74%)",
                filter: "drop-shadow(0 0 14px rgba(103,242,255,0.55))",
              }}
              animate={{
                rotate: isRare ? [0, 4, -4, 0] : [0, 2, -2, 0],
                scale: isRare ? [1, 1.05, 1] : [1, 1.025, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
        </div>

        <div className="relative -mt-2 h-12 w-24 rounded-b-[2rem] rounded-t-[0.8rem] border border-white/10 bg-gradient-to-b from-slate-800 to-slate-950 shadow-[0_14px_28px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-x-3 top-2 h-2 rounded-full bg-white/10" />
          <div
            className="absolute inset-x-0 top-0 h-[1px]"
            style={{
              background: isRare
                ? "linear-gradient(90deg, transparent, rgba(255,122,231,0.9), rgba(103,242,255,0.9), transparent)"
                : "linear-gradient(90deg, transparent, rgba(103,242,255,0.7), transparent)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-white">{value}</div>
    </div>
  );
}

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
  className = "",
}) {
  const [view, setView] = useState("plant");

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

  const statusLine = getStatusLine({
    stage,
    healthState,
    rarePlantUnlocked,
    daysUntilNextBloom: nextBloom,
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
      className={`relative w-full overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#071018]/92 p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,0.38)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(103,242,255,0.16),transparent_42%),radial-gradient(circle_at_80%_75%,rgba(180,134,255,0.13),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />

      <div className="relative z-10">
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-200/10 shadow-[0_0_20px_rgba(103,242,255,0.14)]">
                <Leaf size={17} className="text-cyan-100" />
              </div>

              <div>
                <h2 className="text-lg font-black tracking-[-0.03em] text-white">
                  Garden
                </h2>
                <p className="text-xs font-semibold text-white/52">{statusLine}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setView(view === "plant" ? "stats" : "plant")}
            className="rounded-2xl border border-white/10 bg-white/[0.055] px-3 py-2 text-[11px] font-black uppercase tracking-[0.13em] text-white/64"
            aria-label={view === "plant" ? "Show garden stats" : "Show plant"}
          >
            {view === "plant" ? "Stats" : "Plant"}
          </button>
        </header>

        <AnimatePresence mode="wait">
          {view === "plant" ? (
            <motion.div
              key="plant-view"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl"
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">
                    Plant
                  </div>
                  <div className="text-sm font-black text-white">{plantName}</div>
                </div>

                <div
                  className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
                  style={{
                    borderColor: `${healthState.accent}55`,
                    color: healthState.accent,
                    background: `${healthState.glow}`,
                  }}
                >
                  {healthState.label}
                </div>
              </div>

              <GardenPlant
                stage={stage}
                healthState={healthState}
                rarePlantUnlocked={rarePlantUnlocked}
              />

              <div className="mt-2">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-white/58">Health</span>
                  <span className="font-black text-white">{Math.round(health)}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-black/30">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        stage === "rare"
                          ? "linear-gradient(90deg, #67f2ff, #b486ff, #ff7ae7)"
                          : `linear-gradient(90deg, ${healthState.accent}, #67f2ff)`,
                      boxShadow: `0 0 18px ${healthState.glow}`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${health}%` }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <StatPill label="Stage" value={getStageLabel(stage)} />
                <StatPill label="Streak" value={`${formatNumber(streakDays)}d`} />
                <StatPill label="Steps" value={formatNumber(dailySteps)} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="stats-view"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">
                    Garden Stats
                  </div>
                  <div className="text-sm font-black text-white">
                    Consistency snapshot
                  </div>
                </div>

                {stage === "rare" ? (
                  <div className="flex items-center gap-1 rounded-full border border-fuchsia-200/20 bg-fuchsia-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-fuchsia-100">
                    <Sparkles size={12} />
                    Rare
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <StatPill label="Health" value={`${Math.round(health)}%`} />
                <StatPill label="Active Days" value={formatNumber(activeDays || streakDays)} />
                <StatPill label="Longest" value={`${formatNumber(longestStreak || streakDays)}d`} />
                <StatPill label="Blooms" value={formatNumber(totalBlooms)} />
                <StatPill label="Missed" value={`${formatNumber(missedDays)}d`} />
                <StatPill label="Grace" value={`${formatNumber(streakGraceDaysRemaining)}d`} />
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-black text-white">
                  <Heart size={14} className="text-cyan-100" />
                  Next growth
                </div>

                <div className="text-xs leading-relaxed text-white/58">
                  {nextBloom > 0
                    ? `${nextBloom} more day${nextBloom === 1 ? "" : "s"} to bloom.`
                    : "Your plant is close to blooming."}
                </div>

                <div className="mt-2 text-[11px] font-bold text-white/42">
                  Next rare unlock: {rareTarget}
                </div>

                <div className="mt-2 text-[11px] font-bold text-white/42">
                  Last active: {lastActiveLabel}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 flex items-center justify-center gap-2 text-white/32">
          <ChevronLeft size={14} />
          <div className="flex gap-1.5">
            <span
              className={`h-1.5 rounded-full transition-all ${
                view === "plant" ? "w-5 bg-cyan-200" : "w-1.5 bg-white/25"
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all ${
                view === "stats" ? "w-5 bg-cyan-200" : "w-1.5 bg-white/25"
              }`}
            />
          </div>
          <ChevronRight size={14} />
        </div>
      </div>
    </section>
  );
}
