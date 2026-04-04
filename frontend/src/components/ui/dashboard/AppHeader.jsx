import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, Sparkles, Wifi, WifiOff } from "lucide-react";
import { useApp } from "@/App";
import StreamPanel from "@/components/ui/stream/StreamPanel";
import AccountDrawer from "./AccountDrawer";

function generateUsername(seedSource) {
  if (!seedSource) return "Zwapper";

  const seedString = String(seedSource).toLowerCase().trim();

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

  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }

  const safeHash = Math.abs(hash);
  const adjIndex = safeHash % adjectives.length;
  const nounIndex = Math.floor(safeHash / 7) % nouns.length;
  const num = safeHash % 999;

  return `${adjectives[adjIndex]}${nouns[nounIndex]}${num}`;
}

function ConnectionPill({ isOnline = true }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
        isOnline
          ? "border-green-500/20 bg-green-500/10 text-green-300"
          : "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
      }`}
    >
      {isOnline ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      {isOnline ? "Connected" : "Offline"}
    </div>
  );
}

export default function AppHeader() {
  const { user, authUser, walletAddress, onchainBalance } = useApp();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [streamOpen, setStreamOpen] = useState(false);

  const isOnline =
    typeof navigator !== "undefined" ? navigator.onLine : true;

  const displayName = useMemo(() => {
    const safeUser = user && typeof user === "object" ? user : null;
    const safeAuthUser = authUser && typeof authUser === "object" ? authUser : null;

    if (safeUser?.custom_username) return safeUser.custom_username;

    const seedSource =
      walletAddress ||
      safeUser?.email ||
      safeAuthUser?.email ||
      safeUser?.username ||
      safeAuthUser?.username;

    return generateUsername(seedSource);
  }, [user, authUser, walletAddress]);

  const initials = useMemo(() => {
    return (
      (displayName || "ZW")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "ZW"
    );
  }, [displayName]);

  const appZwapBalance = Number(
    user?.zwap_balance ??
      authUser?.zwap_pending ??
      authUser?.zwap_balance ??
      0
  );

  const zptsBalance = Number(
    user?.zpts_balance ??
      authUser?.zpts_pending ??
      authUser?.zpts_balance ??
      0
  );

  const walletBalanceLabel =
    walletAddress && onchainBalance !== null
      ? onchainBalance.toFixed(2)
      : walletAddress
        ? "0.00"
        : "--";

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-cyan-500/20 bg-[#0a0b1e]/95 backdrop-blur-lg">
        <div className="mx-auto w-full max-w-lg px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <motion.button
              type="button"
              onClick={() => setStreamOpen(true)}
              className="relative min-w-[120px] max-w-[144px] overflow-hidden rounded-2xl border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_rgba(20,26,48,0.92)_45%,_rgba(15,18,34,0.98)_100%)] px-3 py-2 text-left shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                boxShadow: [
                  "0 8px 24px rgba(0,0,0,0.25), 0 0 0 rgba(34,211,238,0)",
                  "0 8px 24px rgba(0,0,0,0.25), 0 0 18px rgba(34,211,238,0.12)",
                  "0 8px 24px rgba(0,0,0,0.25), 0 0 0 rgba(34,211,238,0)",
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/20 bg-gradient-to-br from-cyan-500/18 to-purple-500/18">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/90">
                    Stream
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-gray-300">
                    <Play className="h-3 w-3" />
                    <span>Open</span>
                  </div>
                </div>
              </div>
            </motion.button>

            <motion.div
              className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2"
              animate={{
                boxShadow: [
                  "0 0 10px rgba(0,245,255,0.06)",
                  "0 0 18px rgba(0,245,255,0.12)",
                  "0 0 10px rgba(0,245,255,0.06)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="min-w-[48px] text-center">
                <motion.p
                  className="text-sm font-bold leading-tight text-cyan-400"
                  animate={{
                    textShadow: [
                      "0 0 4px rgba(0,245,255,0.25)",
                      "0 0 10px rgba(0,245,255,0.45)",
                      "0 0 4px rgba(0,245,255,0.25)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {walletBalanceLabel}
                </motion.p>
                <p className="text-[10px] text-gray-500">Wallet</p>
              </div>

              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent" />

              <div className="min-w-[48px] text-center">
                <motion.p
                  className="text-sm font-bold leading-tight text-cyan-300/85"
                  animate={{
                    textShadow: [
                      "0 0 4px rgba(103,232,249,0.18)",
                      "0 0 8px rgba(103,232,249,0.28)",
                      "0 0 4px rgba(103,232,249,0.18)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.25 }}
                >
                  {appZwapBalance.toFixed(2)}
                </motion.p>
                <p className="text-[10px] text-gray-500">App</p>
              </div>

              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent" />

              <div className="min-w-[42px] text-center">
                <motion.p
                  className="text-sm font-bold leading-tight text-purple-400"
                  animate={{
                    textShadow: [
                      "0 0 4px rgba(153,69,255,0.25)",
                      "0 0 10px rgba(153,69,255,0.45)",
                      "0 0 4px rgba(153,69,255,0.25)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  {zptsBalance}
                </motion.p>
                <p className="text-[10px] text-gray-500">zPts</p>
              </div>
            </motion.div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <AccountDrawer
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                trigger={
                  <motion.button
                    type="button"
                    className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-xl font-bold uppercase shadow-lg shadow-cyan-500/30"
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
                    aria-label="Open account drawer"
                  >
                    {initials}

                    <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0a0b1e]">
                      <motion.span
                        className="h-3 w-3 rounded-full bg-cyan-400"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </span>
                  </motion.button>
                }
              />

              <ConnectionPill isOnline={isOnline} />
            </div>
          </div>
        </div>
      </header>

      <StreamPanel open={streamOpen} onOpenChange={setStreamOpen} />
    </>
  );
}