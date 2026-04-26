import React from "react";

import DashboardV1 from "./DashboardV1";
import { generateUsername } from "@/lib/utils/generateUsername";

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
  const resolvedWalletAddress =
    user?.walletAddress || user?.wallet_address || walletAddress || "";

  const resolvedEmail =
    authUser?.email?.address || authUser?.email || user?.email || "";

  const resolvedUsername = generateUsername({
    username: user?.username,
    walletAddress: resolvedWalletAddress,
    email: resolvedEmail,
  });

  const mergedUser = {
    ...(user || {}),
    username: resolvedUsername,
    displayName: resolvedUsername,
    tier: user?.tier || tier || "zwapper",
    zptsBalance: user?.zptsBalance ?? user?.zpts_balance ?? zptsBalance,
    zwapBalance: user?.zwapBalance ?? user?.zwap_balance ?? zwapBalance,
    walletAddress: resolvedWalletAddress,
    wallet_address: resolvedWalletAddress,
  };

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
        <DashboardV1 user={mergedUser} authUser={authUser} />
      </main>
    </div>
  );
}