import React, { useMemo } from "react";

import DashboardV1 from "./DashboardV1";

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
  className = "",
}) {
  const resolvedEmail =
    authUser?.email?.address || authUser?.email || user?.email || "";

  const resolvedUsername = generateUsername({
    username: user?.username || displayName,
    walletAddress: "",
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
      walletAddress: "",
      wallet_address: "",
    }),
    [user, resolvedUsername, tier, zptsBalance, zwapBalance]
  );

  const streakDays = asNumber(
    mergedUser?.streakDays ??
      mergedUser?.streak_days ??
      mergedUser?.daily_streak ??
      mergedUser?.currentStreak
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

      <main className="relative z-10 h-[100dvh] w-full overflow-hidden">
        <DashboardV1
          user={mergedUser}
          authUser={authUser}
          gardenUnlocked={gardenUnlocked}
          gardenHasAlert={gardenHasAlert}
        />
      </main>
    </div>
  );
}