import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import DashboardV1 from "./DashboardV1";
import GardenWindow from "./windows/garden/GardenWindow";

import { generateUsername } from "@/lib/utils/generateUsername";

function asNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export default function SimplifiedDashboard({
  user,
  authUser,
  displayName = "",
  tier = "zwapper",
  zptsBalance = 0,
  zwapBalance = 0,
  walletAddress = "",
  className = "",
}) {
  const [gardenOpen, setGardenOpen] = useState(false);

  const resolvedWalletAddress =
    user?.walletAddress || user?.wallet_address || walletAddress || "";

  const resolvedEmail =
    authUser?.email?.address || authUser?.email || user?.email || "";

  const resolvedUsername = generateUsername({
    username: user?.username || displayName,
    walletAddress: resolvedWalletAddress,
    email: resolvedEmail,
  });

  const mergedUser = useMemo(
    () => ({
      ...(user || {}),
      username: resolvedUsername,
      displayName: resolvedUsername,
      tier: user?.tier || tier || "zwapper",
      zptsBalance: user?.zptsBalance ?? user?.zpts_balance ?? zptsBalance,
      zpts_balance: user?.zpts_balance ?? user?.zptsBalance ?? zptsBalance,
      zwapBalance: user?.zwapBalance ?? user?.zwap_balance ?? zwapBalance,
      zwap_balance: user?.zwap_balance ?? user?.zwapBalance ?? zwapBalance,
      walletAddress: resolvedWalletAddress,
      wallet_address: resolvedWalletAddress,
    }),
    [
      user,
      resolvedUsername,
      tier,
      zptsBalance,
      zwapBalance,
      resolvedWalletAddress,
    ]
  );

  const streakDays = asNumber(
    mergedUser?.streakDays ??
      mergedUser?.streak_days ??
      mergedUser?.daily_streak ??
      mergedUser?.currentStreak
  );

  const dailySteps = asNumber(
    mergedUser?.dailySteps ?? mergedUser?.daily_steps ?? mergedUser?.stepsToday
  );

  const gamesPlayedToday = asNumber(
    mergedUser?.gamesPlayedToday ??
      mergedUser?.games_played_today ??
      mergedUser?.gamesPlayed
  );

  const lessonsCompletedToday = asNumber(
    mergedUser?.lessonsCompletedToday ??
      mergedUser?.lessons_completed_today ??
      mergedUser?.learnCompletedToday
  );

  const fullLoopCompleted = Boolean(
    mergedUser?.fullLoopCompleted ||
      mergedUser?.full_loop_completed ||
      mergedUser?.dailyLoopCompleted ||
      mergedUser?.daily_loop_completed
  );

  const gardenUnlocked = Boolean(
    mergedUser?.gardenUnlocked ||
      mergedUser?.garden_unlocked ||
      streakDays >= 3 ||
      fullLoopCompleted
  );

  const gardenHasAlert = gardenUnlocked && !mergedUser?.gardenSeen;

  return (
    <div
      className={[
        "fixed inset-0 h-[100dvh] w-full overflow-hidden bg-[#030711] text-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(84,214,255,0.10),transparent_32%),radial-gradient(circle_at_88%_28%,rgba(158,99,255,0.10),transparent_34%),linear-gradient(180deg,#050912_0%,#060b14_48%,#04070d_100%)]" />

      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-x border-cyan-300/10 bg-white/[0.015] shadow-[0_0_80px_rgba(0,255,255,0.045)]" />

      <main className="relative z-10 mx-auto h-[100dvh] w-full max-w-[430px] overflow-hidden">
        <DashboardV1
          user={mergedUser}
          authUser={authUser}
          gardenUnlocked={gardenUnlocked}
          gardenHasAlert={gardenHasAlert}
          onGardenClick={() => setGardenOpen(true)}
        />
      </main>

      <AnimatePresence>
        {gardenOpen && gardenUnlocked ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end justify-center bg-black/72 px-3 pb-4 pt-10 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative max-h-[92dvh] w-full max-w-[430px] overflow-y-auto rounded-[2rem]"
              initial={{ y: 42, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 42, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setGardenOpen(false)}
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition active:scale-95"
                aria-label="Close Garden"
              >
                <X size={18} />
              </button>

              <GardenWindow
                streakDays={streakDays}
                dailySteps={dailySteps}
                gamesPlayedToday={gamesPlayedToday}
                lessonsCompletedToday={lessonsCompletedToday}
                lastActiveAt={
                  mergedUser?.lastActiveAt ||
                  mergedUser?.last_active_at ||
                  mergedUser?.lastDailyClaim ||
                  mergedUser?.last_daily_claim
                }
                plantName={mergedUser?.plantName || mergedUser?.plant_name || "Zyra"}
                healthPercent={
                  mergedUser?.healthPercent ??
                  mergedUser?.garden_health_percent ??
                  mergedUser?.gardenHealthPercent
                }
                growthStage={
                  mergedUser?.growthStage ||
                  mergedUser?.growth_stage ||
                  mergedUser?.gardenGrowthStage
                }
                rarePlantUnlocked={Boolean(
                  mergedUser?.rarePlantUnlocked ||
                    mergedUser?.rare_plant_unlocked ||
                    mergedUser?.gardenRarePlantUnlocked
                )}
                fullLoopCompleted={fullLoopCompleted}
                longestStreak={asNumber(
                  mergedUser?.longestStreak || mergedUser?.longest_streak || streakDays
                )}
                totalBlooms={asNumber(
                  mergedUser?.totalBlooms || mergedUser?.total_blooms
                )}
                activeDays={asNumber(
                  mergedUser?.activeDays || mergedUser?.active_days || streakDays
                )}
                missedDays={asNumber(
                  mergedUser?.missedDays || mergedUser?.missed_days
                )}
                daysUntilNextBloom={
                  mergedUser?.daysUntilNextBloom ??
                  mergedUser?.days_until_next_bloom
                }
                nextRareUnlock={
                  mergedUser?.nextRareUnlock || mergedUser?.next_rare_unlock
                }
                streakGraceDaysRemaining={asNumber(
                  mergedUser?.streakGraceDaysRemaining ??
                    mergedUser?.streak_grace_days_remaining ??
                    3,
                  3
                )}
                gardenLevel={
                  mergedUser?.gardenLevel || mergedUser?.garden_level
                }
                nextLevelPercent={
                  mergedUser?.nextLevelPercent ||
                  mergedUser?.garden_next_level_percent
                }
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
