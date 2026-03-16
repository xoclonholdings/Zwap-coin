import React, { useState } from "react";
import { useApp, ZWAP_CONTRACT } from "@/App";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
  Music4,
  Play,
} from "lucide-react";
import ConvertZPtsModal from "@/components/ConvertZPtsModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// PolygonScan URL helper
const getPolygonScanUrl = (address, type = "address") => {
  return `https://polygonscan.com/${type}/${address}`;
};

export default function AppHeader() {
  const {
    user,
    walletAddress,
    setIsWalletModalOpen,
    disconnectWallet,
    onchainBalance,
  } = useApp();

  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
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

  const username = user?.custom_username || generateUsername(walletAddress);

  const initials =
    (walletAddress ? username : "Guest")
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("") || "Z";

  const settingsItems = [
    {
      icon: User,
      label: "Profile",
      action: () => {
        setSettingsOpen(false);
        navigate("/profile");
      },
    },
    {
      icon: BookOpen,
      label: "Learn",
      action: () => {
        setSettingsOpen(false);
        navigate("/learn");
      },
    },
    {
      icon: Mail,
      label: "Contact",
      action: () => {
        setSettingsOpen(false);
        navigate("/contact");
      },
    },
    {
      icon: Lock,
      label: "Privacy Policy",
      action: () => {
        setSettingsOpen(false);
        navigate("/privacy");
      },
    },
    {
      icon: FileText,
      label: "Terms of Use",
      action: () => {
        setSettingsOpen(false);
        navigate("/terms");
      },
    },
    {
      icon: HelpCircle,
      label: "FAQs & Help",
      action: () => {
        setSettingsOpen(false);
        navigate("/about");
      },
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0b1e]/95 backdrop-blur-lg border-b border-cyan-500/20">
      <div className="flex items-center justify-between gap-3 px-4 py-3 max-w-lg mx-auto">
        {/* Left side - future audio/player slot */}
        <motion.button
          type="button"
          className="min-w-[108px] max-w-[128px] flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 px-3 py-2 text-left"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 border border-cyan-400/20">
            <Music4 className="w-4 h-4 text-cyan-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/90">
              Player
            </p>
            <div className="flex items-center gap-1 text-[11px] text-gray-300">
              <Play className="w-3 h-3" />
              <span className="truncate">Connect</span>
            </div>
          </div>
        </motion.button>

        {/* Center - balances */}
        <motion.div
          className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2"
          animate={{
            boxShadow: [
              "0 0 10px rgba(0,245,255,0.06)",
              "0 0 18px rgba(0,245,255,0.12)",
              "0 0 10px rgba(0,245,255,0.06)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="min-w-[54px] text-center">
            <motion.p
              className="text-sm text-cyan-400 font-bold leading-tight"
              animate={{
                textShadow: [
                  "0 0 4px rgba(0,245,255,0.25)",
                  "0 0 10px rgba(0,245,255,0.45)",
                  "0 0 4px rgba(0,245,255,0.25)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {onchainBalance !== null ? onchainBalance.toFixed(2) : "0.00"}
            </motion.p>
            <p className="text-[10px] text-gray-500">Wallet</p>
          </div>

          <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-600 to-transparent" />

          <div className="min-w-[54px] text-center">
            <motion.p
              className="text-sm text-cyan-300/85 font-bold leading-tight"
              animate={{
                textShadow: [
                  "0 0 4px rgba(103,232,249,0.18)",
                  "0 0 8px rgba(103,232,249,0.28)",
                  "0 0 4px rgba(103,232,249,0.18)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.25 }}
            >
              {user?.zwap_balance?.toFixed(2) || "0.00"}
            </motion.p>
            <p className="text-[10px] text-gray-500">App</p>
          </div>

          <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-600 to-transparent" />

          <div className="min-w-[46px] text-center">
            <motion.p
              className="text-sm text-purple-400 font-bold leading-tight"
              animate={{
                textShadow: [
                  "0 0 4px rgba(153,69,255,0.25)",
                  "0 0 10px rgba(153,69,255,0.45)",
                  "0 0 4px rgba(153,69,255,0.25)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              {user?.zpts_balance || 0}
            </motion.p>
            <p className="text-[10px] text-gray-500">zPts</p>
          </div>
        </motion.div>

        <ConvertZPtsModal
          open={convertOpen}
          onClose={() => setConvertOpen(false)}
          walletAddress={walletAddress}
          zptsBalance={user?.zpts_balance || 0}
          onConverted={() => {}}
        />

        {/* Right side - profile */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <motion.button
              className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xl font-bold uppercase shadow-lg shadow-cyan-500/30 relative shrink-0"
              data-testid="profile-badge"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 15px rgba(0,245,255,0.3)",
                  "0 0 30px rgba(0,245,255,0.5)",
                  "0 0 15px rgba(0,245,255,0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {initials}

              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#0a0b1e] rounded-full flex items-center justify-center">
                <motion.span
                  className="w-3 h-3 bg-cyan-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </span>
            </motion.button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="bg-[#0a0b1e] border-l border-cyan-500/20 w-80 overflow-y-auto"
            aria-describedby="account-sheet-description"
          >
            <SheetHeader>
              <SheetTitle className="text-white">Account</SheetTitle>
              <p id="account-sheet-description" className="sr-only">
                Manage your ZWAP! account settings and profile
              </p>
            </SheetHeader>

            <div className="mt-6 space-y-6 pb-8">
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold uppercase border ${
                    user?.tier === "plus"
                      ? "bg-gradient-to-br from-yellow-400/30 via-amber-500/20 to-orange-500/30 border-yellow-400/40 text-yellow-200"
                      : "bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-cyan-400/30 text-white"
                  }`}
                  animate={{
                    boxShadow:
                      user?.tier === "plus"
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
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {initials}
                </motion.div>

                <div>
                  <p className="text-white font-semibold">
                    {walletAddress ? username : "Guest"}
                  </p>

                  {walletAddress ? (
                    <p className="text-gray-500 text-xs">
                      {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-xs">Not connected</p>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    {user?.tier === "plus" ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Plus
                      </span>
                    ) : walletAddress ? (
                      <>
                        <span className="text-xs text-gray-400">Starter</span>
                        <button
                          onClick={() => {
                            setSettingsOpen(false);
                            navigate("/plus");
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold hover:opacity-90 transition"
                        >
                          Upgrade
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Connect to save progress
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {walletAddress && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Reward Balances
                    </p>
                    <a
                      href={getPolygonScanUrl(walletAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300 transition-colors"
                    >
                      View on PolygonScan <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-lg font-bold text-cyan-400">
                        {onchainBalance !== null ? onchainBalance.toFixed(2) : "—"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Link2 className="w-3 h-3" /> Linked Wallet
                      </p>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-cyan-400/70">
                        {user?.zwap_balance?.toFixed(2) || 0}
                      </p>
                      <p className="text-xs text-gray-500">In-App Rewards</p>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-purple-400">
                        {user?.zpts_balance || 0}
                      </p>
                      <p className="text-xs text-gray-500">Z Points</p>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-green-400">
                        {user?.total_earned?.toFixed(0) || 0}
                      </p>
                      <p className="text-xs text-gray-500">Total Earned</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-600 text-center mt-3 pt-2 border-t border-gray-800">
                    Balances update in real-time
                  </p>

                  <Button
                    type="button"
                    onClick={() => {
                      setSettingsOpen(false);
                      setTimeout(() => setConvertOpen(true), 150);
                    }}
                    className="w-full mt-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200"
                    variant="outline"
                  >
                    Convert zPts → ZWAP!
                  </Button>

                  <div className="mt-3 pt-3 border-t border-cyan-500/20">
                    <a
                      href={getPolygonScanUrl(ZWAP_CONTRACT.address, "token")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 flex items-center gap-1 hover:text-cyan-400 transition-colors"
                    >
                      ZWAP Token Contract <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {!walletAddress && (
                <motion.button
                  onClick={() => {
                    setIsWalletModalOpen(true);
                    setSettingsOpen(false);
                  }}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-400 font-semibold flex items-center gap-2">
                        <Wallet className="w-4 h-4" /> Connect Wallet
                      </p>
                      <p className="text-gray-400 text-xs">
                        Save progress & earn rewards
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-cyan-400" />
                  </div>
                </motion.button>
              )}

              <div className="space-y-1">
                {settingsItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={i}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 text-left transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {walletAddress && (
                <motion.button
                  onClick={() => {
                    disconnectWallet();
                    setSettingsOpen(false);
                    navigate("/dashboard");
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Disconnect Wallet</span>
                </motion.button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}