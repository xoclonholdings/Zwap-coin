import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { ChevronRight, Shield } from "lucide-react";
import { useApp } from "../../../app/AppProvider";
import ProfilePage from "../../user/profile/ProfilePage";
import ConvertZPtsModal from "../../swap/ConvertZPtsModal";

const ADJECTIVES = [
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

const NOUNS = [
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

function hashString(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateUsername({ walletAddress, email }) {
  const seedSource = walletAddress || email || "";
  if (!seedSource) return "Zwapper";

  const seed = walletAddress
    ? parseInt(walletAddress.slice(2, 10), 16)
    : hashString(seedSource.toLowerCase());

  const adjIndex = Math.abs(seed) % ADJECTIVES.length;
  const nounIndex = Math.abs(Math.floor(seed / 8)) % NOUNS.length;
  const num = Math.abs(seed) % 999;

  return `${ADJECTIVES[adjIndex]}${NOUNS[nounIndex]}${num}`;
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
  const [convertOpen, setConvertOpen] = useState(false);

  const shieldClickCountRef = useRef(0);
  const shieldTimerRef = useRef(null);

  const safeUser = user && typeof user === "object" ? user : null;
  const safeAuthUser =
    authUser && typeof authUser === "object" ? authUser : null;

  const isAuthenticated = !!walletAddress || !!safeAuthUser?.email;
  const isPlus = safeUser?.tier === "plus";

  const displayName = useMemo(() => {
    if (safeUser?.custom_username) return safeUser.custom_username;
    if (safeUser?.username) return safeUser.username;

    return generateUsername({
      walletAddress,
      email: safeAuthUser?.email,
    });
  }, [safeUser, safeAuthUser, walletAddress]);

  const displaySubtext = useMemo(() => {
    if (safeAuthUser?.email) return safeAuthUser.email;
    if (walletAddress) {
      return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }
    return "Not connected";
  }, [safeAuthUser, walletAddress]);

  const initials = useMemo(() => {
    return (
      displayName
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "Z"
    );
  }, [displayName]);

  const zwapBalance =
    walletAddress && onchainBalance != null
      ? Number(onchainBalance).toFixed(2)
      : "0.00";

  const rawZptsBalance = Number(
    safeUser?.zpts_balance ??
      safeAuthUser?.zpts_balance ??
      safeAuthUser?.zpts_pending ??
      0
  );

  const zptsBalance = rawZptsBalance.toLocaleString();

  // Placeholder until ZWAP claim logic is mapped
  const canClaim = false;

  const openDrawer = () => onOpenChange?.(true);
  const closeDrawer = () => onOpenChange?.(false);

  const handleNavigate = (path) => {
    closeDrawer();
    navigate(path);
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

  const handleShieldClick = () => {
    shieldClickCountRef.current += 1;

    if (shieldTimerRef.current) {
      clearTimeout(shieldTimerRef.current);
    }

    shieldTimerRef.current = setTimeout(() => {
      shieldClickCountRef.current = 0;
    }, 700);

    if (shieldClickCountRef.current >= 3) {
      shieldClickCountRef.current = 0;
      clearTimeout(shieldTimerRef.current);
      shieldTimerRef.current = null;
      handleNavigate("/admin");
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={openDrawer} className="cursor-pointer">
          {trigger}
        </div>
      ) : null}

      <ConvertZPtsModal
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        walletAddress={walletAddress}
      />

      {open ? (
        <div className="fixed inset-0 z-[90]">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          <div className="absolute right-0 top-0 h-full w-80 border-l border-cyan-400/10 bg-[#070814] px-5 py-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-5">
                <div className="rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/8 to-purple-500/8 p-4 shadow-[0_0_25px_rgba(34,211,238,0.06)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-purple-500/30 text-lg font-bold text-white shadow-[0_0_24px_rgba(34,211,238,0.18)]">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[20px] font-semibold leading-none text-white">
                          {displayName}
                        </p>

                        {isPlus ? (
                          <span className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2.5 py-1 text-[11px] font-semibold leading-none text-black">
                            Zitizen
                          </span>
                        ) : (
                          <>
                            <span className="text-xs font-medium text-gray-400">
                              Zwapper
                            </span>
                            <button
                              type="button"
                              onClick={() => handleNavigate("/plus")}
                              className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2.5 py-1 text-[11px] font-semibold leading-none text-black transition hover:opacity-90"
                            >
                              Upgrade
                            </button>
                          </>
                        )}
                      </div>

                      <p className="mt-2 truncate text-sm text-gray-400">
                        {displaySubtext}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] px-4 py-3 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                  <div className="flex items-center justify-between gap-3 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <span>
                        <span className="font-semibold text-cyan-400">
                          {zwapBalance}
                        </span>{" "}
                        ZWAP
                      </span>

                      <button
                        type="button"
                        disabled={!canClaim}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                          canClaim
                            ? "border border-cyan-400/25 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                            : "cursor-not-allowed border border-white/10 bg-white/[0.03] text-gray-500"
                        }`}
                      >
                        {canClaim ? "Claim" : "Claim Soon"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span>
                        <span className="font-semibold text-purple-400">
                          {zptsBalance}
                        </span>{" "}
                        zPts
                      </span>

                      <button
                        type="button"
                        onClick={() => setConvertOpen(true)}
                        className="rounded-full border border-purple-400/25 bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-300 transition hover:bg-purple-500/20"
                      >
                        Convert
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProfileOpen}
                  className="w-full rounded-[1.35rem] border border-cyan-500/30 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 px-4 py-3 text-left backdrop-blur-md transition hover:from-cyan-500/35 hover:to-blue-500/35"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-cyan-300">
                        {walletAddress ? "Open Wallet" : "Set Up Wallet"}
                      </p>
                      <p className="mt-1 text-xs text-gray-300">
                        {walletAddress
                          ? "View balances, badges, and account info"
                          : "Save progress and connect your account"}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 shrink-0 text-cyan-300" />
                  </div>
                </button>

                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    onClick={handleProfileOpen}
                    className="block w-full text-left text-[28px] font-semibold leading-none text-white transition hover:text-cyan-400"
                  >
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/learn")}
                    className="block w-full text-left text-[28px] font-semibold leading-none text-white transition hover:text-cyan-400"
                  >
                    Learn
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/contact")}
                    className="block w-full text-left text-[28px] font-semibold leading-none text-white transition hover:text-cyan-400"
                  >
                    Contact
                  </button>

                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block w-full text-left text-[28px] font-semibold leading-none text-white transition hover:text-red-400"
                    >
                      Sign Out
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4 pt-5">
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleShieldClick}
                    title="Secure"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] shadow-[0_0_18px_rgba(255,255,255,0.03)] transition hover:bg-white/[0.06]"
                  >
                    <Shield className="h-5 w-5 text-gray-300" />
                  </button>
                </div>

                <div className="text-center text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={() => handleNavigate("/privacy")}
                    className="transition hover:text-gray-300"
                  >
                    Privacy
                  </button>
                  {" • "}
                  <button
                    type="button"
                    onClick={() => handleNavigate("/about")}
                    className="transition hover:text-gray-300"
                  >
                    Help
                  </button>
                  {" • "}
                  <button
                    type="button"
                    onClick={() => handleNavigate("/terms")}
                    className="transition hover:text-gray-300"
                  >
                    Terms
                  </button>
                </div>
              </div>
            </div>

            {profileOpen ? (
              <div className="absolute inset-0 z-50 bg-[#050510]">
                <ProfilePage onClose={() => setProfileOpen(false)} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}