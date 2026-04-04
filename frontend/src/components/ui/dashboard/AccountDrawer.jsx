import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Wallet,
  User,
  LogOut,
  HelpCircle,
  Lock,
  ChevronRight,
  Crown,
  Mail,
  BookOpen,
  Shield,
} from "lucide-react";
import { useApp } from "@/App";
import ProfilePage from "@/pages/ProfilePage";

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

export default function AccountDrawer({ open, onOpenChange, trigger }) {
  const navigate = useNavigate();
  const { logout: privyLogout } = usePrivy();

  const {
    user,
    authUser,
    walletAddress,
    logoutAll,
    onchainBalance,
  } = useApp();

  const [profileOpen, setProfileOpen] = useState(false);

  const safeUser = user && typeof user === "object" ? user : null;
  const safeAuthUser = authUser && typeof authUser === "object" ? authUser : null;

  const isWalletUser = !!walletAddress;
  const isEmailUser = !!safeAuthUser?.email;
  const isAuthenticatedUser = isWalletUser || isEmailUser;

  const isAdmin = !!(safeUser?.is_admin || safeAuthUser?.is_admin);

  const displayName = useMemo(() => {
    if (safeUser?.custom_username) return safeUser.custom_username;
    if (safeUser?.username) return safeUser.username;
    if (safeAuthUser?.username) return safeAuthUser.username;
    if (safeAuthUser?.email) return safeAuthUser.email.split("@")[0];
    if (walletAddress) return generateUsername(walletAddress);
    return "Zwapper";
  }, [safeUser, safeAuthUser, walletAddress]);

  const displaySubtext = useMemo(() => {
    if (walletAddress) {
      return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }
    if (safeAuthUser?.email) {
      return safeAuthUser.email;
    }
    return "Not connected";
  }, [walletAddress, safeAuthUser]);

  const initials = useMemo(() => {
    const base = displayName || "Z";
    return (
      base
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase() || "Z"
    );
  }, [displayName]);

  const isPlus = safeUser?.tier === "plus";

  const zptsBalance = Number(
    safeUser?.zpts_balance ??
      safeAuthUser?.zpts_balance ??
      0
  );

  const handleSignOut = async () => {
    try {
      await privyLogout();
    } catch (error) {
      console.error(error);
    }

    logoutAll();
    onOpenChange(false);
    navigate("/start", { replace: true });
  };

  const handleShieldPress = () => {
    onOpenChange(false);
    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/about");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent
        side="right"
        className="w-80 overflow-hidden border-l border-cyan-500/20 bg-[#0a0b1e]"
      >
        <SheetHeader className="border-b border-white/5 pb-4">
          <SheetTitle className="text-xl font-black text-white">
            Account
          </SheetTitle>
        </SheetHeader>

        <div className="relative h-full">
          {/* MAIN DRAWER CONTENT */}
          <div className="mt-5 space-y-5 pb-6">

            {/* IDENTITY */}
            <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/6 to-transparent p-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border text-lg font-bold ${
                    isPlus
                      ? "border-yellow-400/40 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 text-yellow-200"
                      : "border-cyan-400/30 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 text-white"
                  }`}
                >
                  {initials}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-white">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {displaySubtext}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    {isPlus ? (
                      <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2 py-0.5 text-[11px] font-semibold text-black">
                        <Crown className="h-3 w-3" /> Zitizen
                      </span>
                    ) : (
                      <>
                        <span className="text-xs text-gray-400">
                          Zwapper
                        </span>
                        <button
                          onClick={() => {
                            onOpenChange(false);
                            navigate("/plus");
                          }}
                          className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2 py-0.5 text-[10px] font-semibold text-black"
                        >
                          Upgrade
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BALANCE STRIP */}
            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-semibold">
                    {walletAddress && onchainBalance !== null
                      ? onchainBalance.toFixed(2)
                      : "0.00"}
                  </span>
                  <span className="text-xs text-gray-500">ZWAP</span>
                </div>

                <div className="h-4 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-semibold">
                    {zptsBalance}
                  </span>
                  <span className="text-xs text-gray-500">zPts</span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <motion.button
              onClick={() => setProfileOpen(true)}
              className="w-full rounded-[1.25rem] border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-cyan-400">
                    <Wallet className="h-4 w-4" />
                    {walletAddress ? "Open Wallet" : "Set Up Wallet"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {walletAddress
                      ? "View balances, badges, and activity"
                      : "Save progress & unlock rewards"}
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 text-cyan-400" />
              </div>
            </motion.button>

            {/* NAVIGATION */}
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-2">
              {[
                { label: "Profile", icon: User, action: () => setProfileOpen(true) },
                { label: "Learn", icon: BookOpen, action: () => navigate("/learn") },
                { label: "Contact", icon: Mail, action: () => navigate("/contact") },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onOpenChange(false);
                      item.action();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/[0.05]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20">
                      <Icon className="h-4 w-4 text-gray-300" />
                    </div>
                    <span className="text-gray-200 font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SYSTEM */}
            {isAuthenticatedUser && (
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-[1.25rem] border border-red-500/20 px-4 py-3 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            )}

            <div className="flex justify-center pt-2">
              <button
                onClick={handleShieldPress}
                className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center"
              >
                <Shield className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* FOOTER */}
            <div className="text-center text-xs text-gray-500 pt-2">
              <span
                onClick={() => navigate("/privacy")}
                className="cursor-pointer hover:text-gray-300"
              >
                Privacy
              </span>
              {" • "}
              <span
                onClick={() => navigate("/terms")}
                className="cursor-pointer hover:text-gray-300"
              >
                Terms
              </span>
              {" • "}
              <span
                onClick={() => navigate("/about")}
                className="cursor-pointer hover:text-gray-300"
              >
                Help
              </span>
            </div>

          </div>

          {/* PROFILE OVERLAY */}
          {profileOpen && (
            <div className="absolute inset-0 z-50 bg-[#050510]">
              <ProfilePage onClose={() => setProfileOpen(false)} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}