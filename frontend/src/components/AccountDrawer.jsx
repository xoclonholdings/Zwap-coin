import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ConvertZPtsModal from "@/components/ConvertZPtsModal";
import {
  Wallet,
  User,
  LogOut,
  FileText,
  HelpCircle,
  Lock,
  ChevronRight,
  Crown,
  Mail,
  Link2,
  ExternalLink,
  BookOpen,
  Shield,
} from "lucide-react";
import { useApp, ZWAP_CONTRACT } from "@/App";

const getPolygonScanUrl = (address, type = "address") => {
  return `https://polygonscan.com/${type}/${address}`;
};

export default function AccountDrawer({ open, onOpenChange, trigger }) {
  const {
    user,
    authUser,
    walletAddress,
    disconnectWallet,
    logoutEmailUser,
    logoutAll,
    onchainBalance,
    openWalletUpgradeFlow,
  } = useApp();

  const navigate = useNavigate();
  const [convertOpen, setConvertOpen] = useState(false);

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

  const generateUsername = (wallet) => {
    if (!wallet) return "Guest";

    const seed = parseInt(wallet.slice(2, 10), 16);
    const adjIndex = Math.abs(seed) % adjectives.length;
    const nounIndex = Math.abs(Math.floor(seed / 8)) % nouns.length;
    const num = Math.abs(seed) % 999;

    return `${adjectives[adjIndex]}${nouns[nounIndex]}${num}`;
  };

  const isWalletUser = !!walletAddress;
  const isEmailUser = !!authUser?.email;
  const isGuest = !isWalletUser && !isEmailUser;

  const displayName = useMemo(() => {
    if (user?.custom_username) return user.custom_username;
    if (user?.username) return user.username;
    if (authUser?.username) return authUser.username;
    if (authUser?.email) return authUser.email.split("@")[0];
    if (walletAddress) return generateUsername(walletAddress);
    return "Guest";
  }, [user, authUser, walletAddress]);

  const displaySubtext = useMemo(() => {
    if (walletAddress) {
      return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }
    if (authUser?.email) {
      return authUser.email;
    }
    return "Not connected";
  }, [walletAddress, authUser]);

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

  const tier = user?.tier || authUser?.tier || (isEmailUser ? "starter" : null);
  const isPlus = tier === "plus";
  const isAdmin = !!(user?.is_admin || authUser?.is_admin);

  const appZwapBalance = Number(
    user?.zwap_balance ?? authUser?.zwap_pending ?? authUser?.zwap_balance ?? 0
  );

  const zptsBalance = Number(
    user?.zpts_balance ?? authUser?.zpts_pending ?? authUser?.zpts_balance ?? 0
  );

  const totalEarned = Number(user?.total_earned ?? authUser?.total_earned ?? 0);

  const settingsItems = [
    {
      icon: User,
      label: "Profile",
      action: () => {
        onOpenChange(false);
        navigate("/profile");
      },
    },
    {
      icon: BookOpen,
      label: "Learn",
      action: () => {
        onOpenChange(false);
        navigate("/learn");
      },
    },
    {
      icon: Mail,
      label: "Contact",
      action: () => {
        onOpenChange(false);
        navigate("/contact");
      },
    },
    {
      icon: Lock,
      label: "Privacy Policy",
      action: () => {
        onOpenChange(false);
        navigate("/privacy");
      },
    },
    {
      icon: FileText,
      label: "Terms of Use",
      action: () => {
        onOpenChange(false);
        navigate("/terms");
      },
    },
    {
      icon: HelpCircle,
      label: "FAQs & Help",
      action: () => {
        onOpenChange(false);
        navigate("/about");
      },
    },
  ];

  const handleConnectWallet = () => {
    onOpenChange(false);
    setTimeout(() => {
      openWalletUpgradeFlow();
      navigate("/wallet");
    }, 120);
  };

  const handleConvert = () => {
    onOpenChange(false);
    setTimeout(() => {
      setConvertOpen(true);
    }, 150);
  };

  const handleSignOut = () => {
    if (walletAddress && authUser) {
      logoutAll();
    } else if (walletAddress) {
      disconnectWallet();
    } else if (authUser) {
      logoutEmailUser();
    }

    onOpenChange(false);
    navigate("/wallet");
  };

  return (
    <>
      <ConvertZPtsModal
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        walletAddress={walletAddress}
        zptsBalance={zptsBalance}
        onConverted={() => {}}
      />

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>

        <SheetContent
          side="right"
          className="w-80 overflow-y-auto border-l border-cyan-500/20 bg-[#0a0b1e] sm:w-80"
          aria-describedby="account-drawer-description"
        >
          <SheetHeader className="border-b border-white/5 pb-4">
            <SheetTitle className="text-white text-xl font-black tracking-tight">
              Account
            </SheetTitle>
            <p id="account-drawer-description" className="sr-only">
              Manage your ZWAP! account, wallet, balances, settings, and admin access.
            </p>
          </SheetHeader>

          <div className="mt-5 space-y-5 pb-6">
            <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/6 to-transparent p-4">
              <div className="flex items-center gap-3">
                <motion.div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-lg font-bold uppercase ${
                    isPlus
                      ? "border-yellow-400/40 bg-gradient-to-br from-yellow-400/30 via-amber-500/20 to-orange-500/30 text-yellow-200"
                      : "border-cyan-400/30 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 text-white"
                  }`}
                  animate={{
                    boxShadow: isPlus
                      ? [
                          "0 0 10px rgba(250,204,21,0.25)",
                          "0 0 20px rgba(251,191,36,0.4)",
                          "0 0 10px rgba(250,204,21,0.25)",
                        ]
                      : [
                          "0 0 10px rgba(0,245,255,0.3)",
                          "0 0 20px rgba(0,245,255,0.5)",
                          "0 0 10px rgba(0,245,255,0.3)",
                        ],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  {initials}
                </motion.div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-white font-semibold text-base">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-gray-500 mt-0.5">
                    {displaySubtext}
                  </p>

                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {isPlus ? (
                      <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2 py-0.5 text-[11px] font-semibold text-black">
                        <Crown className="h-3 w-3" /> Plus
                      </span>
                    ) : isGuest ? (
                      <span className="text-xs text-gray-500">
                        Try first, connect later
                      </span>
                    ) : (
                      <>
                        <span className="text-xs text-gray-400">Starter</span>
                        <button
                          onClick={() => {
                            onOpenChange(false);
                            navigate("/plus");
                          }}
                          className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2 py-0.5 text-[10px] font-semibold text-black hover:opacity-90 transition"
                        >
                          Upgrade
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {(isWalletUser || isEmailUser) && (
              <div className="rounded-[1.5rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Reward Balances
                  </p>

                  {walletAddress ? (
                    <a
                      href={getPolygonScanUrl(walletAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-cyan-400 transition-colors hover:text-cyan-300"
                    >
                      PolygonScan <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                    <p className="text-lg font-bold text-cyan-400">
                      {walletAddress
                        ? onchainBalance !== null
                          ? onchainBalance.toFixed(2)
                          : "0.00"
                        : "—"}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <Link2 className="h-3 w-3" /> Linked Wallet
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                    <p className="text-lg font-bold text-cyan-300">
                      {appZwapBalance.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">In-App Rewards</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                    <p className="text-lg font-bold text-purple-400">
                      {zptsBalance}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">zPts</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                    <p className="text-lg font-bold text-emerald-400">
                      {totalEarned.toFixed(0)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Total Earned</p>
                  </div>
                </div>

                <p className="mt-3 border-t border-gray-800 pt-2 text-center text-[10px] text-gray-600">
                  Balances update in real-time
                </p>

                {walletAddress && zptsBalance > 0 ? (
                  <Button
                    type="button"
                    onClick={handleConvert}
                    className="mt-3 w-full rounded-xl border border-purple-500/30 bg-purple-600/20 text-purple-200 hover:bg-purple-600/30"
                    variant="outline"
                  >
                    Convert zPts → ZWAP!
                  </Button>
                ) : null}

                {walletAddress ? (
                  <div className="mt-3 border-t border-cyan-500/20 pt-3">
                    <a
                      href={getPolygonScanUrl(ZWAP_CONTRACT.address, "token")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-cyan-400"
                    >
                      ZWAP! Token Contract <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ) : null}
              </div>
            )}

            {!isWalletUser && (
              <motion.button
                onClick={handleConnectWallet}
                className="w-full rounded-[1.5rem] border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 text-left shadow-[0_0_20px_rgba(34,211,238,0.08)]"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-cyan-400">
                      <Wallet className="h-4 w-4" />
                      Connect Wallet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Save progress & earn rewards
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-cyan-400 shrink-0" />
                </div>
              </motion.button>
            )}

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-2">
              {settingsItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.button
                    key={index}
                    onClick={item.action}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.05]"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20 shrink-0">
                      <Icon className="h-4 w-4 text-gray-300" />
                    </div>
                    <span className="text-gray-200 font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex justify-center pt-1">
              <div className="text-center">
                <motion.button
                  onClick={() => {
                    onOpenChange(false);
                    navigate("/admin");
                  }}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                    isAdmin
                      ? "border-cyan-400/25 bg-gradient-to-br from-cyan-500/12 to-purple-500/12"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: isAdmin
                      ? [
                          "0 0 8px rgba(34,211,238,0.15)",
                          "0 0 18px rgba(34,211,238,0.35)",
                          "0 0 8px rgba(34,211,238,0.15)",
                        ]
                      : [
                          "0 0 0 rgba(255,255,255,0)",
                          "0 0 8px rgba(255,255,255,0.05)",
                          "0 0 0 rgba(255,255,255,0)",
                        ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  title="Admin Panel"
                >
                  <Shield
                    className={`h-5 w-5 ${
                      isAdmin ? "text-cyan-300" : "text-gray-400"
                    }`}
                  />
                </motion.button>
                <p className="mt-2 text-[10px] text-gray-500">Admin</p>
              </div>
            </div>

            {!isGuest && (
              <motion.button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-[1.25rem] border border-red-500/15 bg-red-500/[0.04] px-4 py-3 text-red-400 transition-colors hover:bg-red-500/10"
                whileHover={{ x: 4 }}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="font-medium">
                  {walletAddress && authUser
                    ? "Sign Out"
                    : walletAddress
                      ? "Disconnect Wallet"
                      : "Sign Out"}
                </span>
              </motion.button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}