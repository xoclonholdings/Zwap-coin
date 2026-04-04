import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { ChevronRight, Shield } from "lucide-react";
import { useApp } from "@/app/AppProvider";
import ProfilePage from "../../user/profile/ProfilePage";

function generateUsername(wallet) {
  if (!wallet) return "Zwapper";

  const adjectives = [
    "Nova",
    "Pixel",
    "Quantum",
    "Echo",
    "Neon",
    "Solar",
    "Cyber",
    "Hyper",
    "Shadow",
    "Turbo",
  ];

  const nouns = [
    "Runner",
    "Walker",
    "Strider",
    "Pilot",
    "Glider",
    "Breaker",
    "Phantom",
    "Rider",
    "Explorer",
    "Voyager",
  ];

  const seed = parseInt(wallet.slice(2, 10), 16);
  const adjIndex = Math.abs(seed) % adjectives.length;
  const nounIndex = Math.abs(Math.floor(seed / 8)) % nouns.length;
  const num = Math.abs(seed) % 999;

  return `${adjectives[adjIndex]}${nouns[nounIndex]}${num}`;
}

export default function AccountDrawer({
  open = false,
  onOpenChange,
  trigger,
}) {
  const navigate = useNavigate();
  const { logout: privyLogout } = usePrivy();

  const {
    user,
    authUser,
    walletAddress,
    onchainBalance,
    logoutAll,
  } = useApp();

  const [profileOpen, setProfileOpen] = useState(false);

  const safeUser = user && typeof user === "object" ? user : null;
  const safeAuthUser =
    authUser && typeof authUser === "object" ? authUser : null;

  const isPlus = safeUser?.tier === "plus";
  const isAuthenticated = !!walletAddress || !!safeAuthUser?.email;
  const isAdmin = !!(safeUser?.is_admin || safeAuthUser?.is_admin);

  const displayName = useMemo(() => {
    if (safeUser?.custom_username) return safeUser.custom_username;
    if (safeUser?.username) return safeUser.username;
    if (safeAuthUser?.username) return safeAuthUser.username;
    if (safeAuthUser?.email) return safeAuthUser.email.split("@")[0];
    if (walletAddress) return generateUsername(walletAddress);
    return "Zwapper";
  }, [safeUser, safeAuthUser, walletAddress]);

  const initials = useMemo(() => {
    return (
      displayName
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase() || "Z"
    );
  }, [displayName]);

  const zptsBalance = Number(
    safeUser?.zpts_balance ??
      safeAuthUser?.zpts_balance ??
      safeAuthUser?.zpts_pending ??
      0
  );

  const closeDrawer = () => {
    onOpenChange?.(false);
  };

  const openDrawer = () => {
    onOpenChange?.(true);
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeDrawer();
  };

  const handleProfileOpen = () => {
    setProfileOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await privyLogout();
    } catch (error) {
      console.error("Privy logout failed:", error);
    }

    logoutAll?.();
    closeDrawer();
    navigate("/start", { replace: true });
  };

  const handleShieldPress = () => {
    if (isAdmin) {
      handleNavigate("/admin");
      return;
    }
    handleNavigate("/about");
  };

  return (
    <>
      {trigger ? <div onClick={openDrawer}>{trigger}</div> : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={closeDrawer}
          />

          <div className="relative ml-auto flex h-full w-80 flex-col justify-between border-l border-cyan-500/15 bg-[#0a0b1e] px-5 py-5 shadow-[-10px_0_40px_rgba(0,0,0,0.35)]">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 text-lg font-bold text-white shadow-[0_0_24px_rgba(34,211,238,0.18)]">
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-white">
                      {displayName}
                    </p>

                    {isPlus ? (
                      <span className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2 py-0.5 text-[11px] font-semibold text-black">
                        Zitizen
                      </span>
                    ) : (
                      <>
                        <span className="text-xs text-gray-400">Zwapper</span>
                        <button
                          onClick={() => handleNavigate("/plus")}
                          className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2 py-0.5 text-[10px] font-semibold text-black transition hover:opacity-90"
                          type="button"
                        >
                          Upgrade
                        </button>
                      </>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    {walletAddress
                      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                      : safeAuthUser?.email || "Not connected"}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-300">
                <span className="font-semibold text-cyan-400">
                  {walletAddress && onchainBalance != null
                    ? Number(onchainBalance).toFixed(2)
                    : "0.00"}
                </span>{" "}
                ZWAP
                <span className="mx-2 text-gray-600">|</span>
                <span className="font-semibold text-purple-400">
                  {zptsBalance}
                </span>{" "}
                zPts
              </div>

              <button
                onClick={handleProfileOpen}
                className="w-full rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-3 text-left transition hover:from-cyan-500/25 hover:to-blue-500/25"
                type="button"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-cyan-400">
                      {walletAddress ? "Open Wallet" : "Set Up Wallet"}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {walletAddress
                        ? "View balances, badges, and account info"
                        : "Save progress and connect your account"}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-cyan-400" />
                </div>
              </button>

              <div className="space-y-3 pt-1">
                <button
                  onClick={handleProfileOpen}
                  className="block w-full text-left text-[28px] font-medium leading-none text-white transition hover:text-cyan-400"
                  type="button"
                >
                  Profile
                </button>

                <button
                  onClick={() => handleNavigate("/learn")}
                  className="block w-full text-left text-[28px] font-medium leading-none text-white transition hover:text-cyan-400"
                  type="button"
                >
                  Learn
                </button>

                <button
                  onClick={() => handleNavigate("/contact")}
                  className="block w-full text-left text-[28px] font-medium leading-none text-white transition hover:text-cyan-400"
                  type="button"
                >
                  Contact
                </button>

                {isAuthenticated ? (
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left text-[28px] font-medium leading-none text-white transition hover:text-red-400"
                    type="button"
                  >
                    Sign Out
                  </button>
                ) : null}
              </div>
            </div>

            <div className="space-y-4 pt-5">
              <div className="flex justify-center">
                <button
                  onClick={handleShieldPress}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.06]"
                  title={isAdmin ? "Admin" : "Secure"}
                  type="button"
                >
                  <Shield
                    className={`h-5 w-5 ${
                      isAdmin ? "text-cyan-300" : "text-gray-400"
                    }`}
                  />
                </button>
              </div>

              <div className="text-center text-xs text-gray-500">
                <button
                  onClick={() => handleNavigate("/privacy")}
                  className="transition hover:text-gray-300"
                  type="button"
                >
                  Privacy
                </button>
                {" • "}
                <button
                  onClick={() => handleNavigate("/about")}
                  className="transition hover:text-gray-300"
                  type="button"
                >
                  Help
                </button>
                {" • "}
                <button
                  onClick={() => handleNavigate("/terms")}
                  className="transition hover:text-gray-300"
                  type="button"
                >
                  Terms
                </button>
              </div>
            </div>

            {profileOpen ? (
              <div className="absolute inset-0 z-50 bg-[#050510]">
                <ProfilePage
                  onClose={() => setProfileOpen(false)}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}