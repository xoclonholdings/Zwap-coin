import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { ChevronRight, Shield } from "lucide-react";
import { useApp } from "@/app/AppProvider";
import ConvertZPtsModal from "@/components/swap/ConvertZPtsModal";
import { generateUsername } from "@/lib/utils/generateUsername";

function AccountIdentityCard({
  displayName,
  displaySubtext,
  isPlus,
  onUpgrade,
  initials,
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_18px_rgba(255,255,255,0.02)]">
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
                  onClick={onUpgrade}
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
  );
}

export default function AccountPanelContent({
  onNavigate,
  onClose,
  showHeader = true,
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

  const [convertOpen, setConvertOpen] = useState(false);

  const shieldClickCountRef = useRef(0);
  const shieldTimerRef = useRef(null);

  const safeUser = user && typeof user === "object" ? user : null;
  const safeAuthUser =
    authUser && typeof authUser === "object" ? authUser : null;

  const isAuthenticated = !!walletAddress || !!safeAuthUser?.email;
  const isPlus = safeUser?.tier === "plus";

  const displayName = useMemo(() => {
    return generateUsername({
      walletAddress,
      email: safeAuthUser?.email || safeUser?.email,
      username: safeUser?.custom_username || safeUser?.username,
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
  const canClaim = false;

  const handleNavigate = (path) => {
    onNavigate?.(path);
    onClose?.();
    navigate(path);
  };

  const handleUpgrade = () => {
    handleNavigate("/plus");
  };

  const handleSignOut = async () => {
    try {
      await privyLogout();
    } catch (error) {
      console.error("Privy logout failed:", error);
    }

    logoutAll?.();
    onClose?.();
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
      <ConvertZPtsModal
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        walletAddress={walletAddress}
      />

      <div className="flex h-full min-h-0 flex-col">
        {showHeader ? (
          <div className="border-b border-white/10 px-4 pb-4 pt-4">
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">
                Account
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Identity, balances, wallet access, and system controls.
              </p>
            </div>

            <AccountIdentityCard
              displayName={displayName}
              displaySubtext={displaySubtext}
              isPlus={isPlus}
              onUpgrade={handleUpgrade}
              initials={initials}
            />
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 px-4 py-4">
            {!showHeader ? (
              <AccountIdentityCard
                displayName={displayName}
                displaySubtext={displaySubtext}
                isPlus={isPlus}
                onUpgrade={handleUpgrade}
                initials={initials}
              />
            ) : null}

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_18px_rgba(255,255,255,0.02)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                  Reward Line
                </p>
              </div>

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
              onClick={() => handleNavigate("/profile")}
              className="block w-full text-left"
            >
              <div className="rounded-[1.5rem] border border-cyan-400/20 bg-cyan-500/10 p-4 shadow-[0_0_18px_rgba(34,211,238,0.06)] transition hover:bg-cyan-500/12">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">
                      Wallet
                    </p>
                    <p className="mt-1 text-base font-semibold text-cyan-100">
                      {walletAddress ? "Open Wallet" : "Set Up Wallet"}
                    </p>
                    <p className="mt-1 text-sm text-gray-300">
                      {walletAddress
                        ? "View balances, badges, and account info."
                        : "Save progress and connect your account."}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-cyan-300" />
                </div>
              </div>
            </button>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleNavigate("/profile")}
                className="block w-full rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:bg-white/[0.05]"
              >
                <span className="text-[28px] font-semibold leading-none text-white">
                  Profile
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/learn")}
                className="block w-full rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:bg-white/[0.05]"
              >
                <span className="text-[28px] font-semibold leading-none text-white">
                  Learn
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate("/contact")}
                className="block w-full rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:bg-white/[0.05]"
              >
                <span className="text-[28px] font-semibold leading-none text-white">
                  Contact
                </span>
              </button>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="block w-full rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:bg-white/[0.05]"
                >
                  <span className="text-[28px] font-semibold leading-none text-white transition hover:text-red-400">
                    Sign Out
                  </span>
                </button>
              ) : null}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

            <div className="pb-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_18px_rgba(255,255,255,0.02)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                    Secure Layer
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleShieldClick}
                    title="Secure"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] shadow-[0_0_18px_rgba(255,255,255,0.03)] transition hover:bg-white/[0.06]"
                  >
                    <Shield className="h-5 w-5 text-gray-300" />
                  </button>
                </div>

                <div className="mt-4 text-center text-xs text-gray-500">
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
          </div>
        </div>
      </div>
    </>
  );
}