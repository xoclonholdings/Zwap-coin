import React, { useMemo, useState } from "react";
import { useApp } from "@/App";
import { motion } from "framer-motion";
import AudioHub from "@/components/AudioHub";
import AccountDrawer from "@/components/AccountDrawer";
import { Music4, Play } from "lucide-react";

export default function AppHeader() {
  const { user, authUser, walletAddress, onchainBalance } = useApp();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [audioHubOpen, setAudioHubOpen] = useState(false);

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

  const profile = user || authUser || null;

  const displayName = useMemo(() => {
    if (user?.custom_username) return user.custom_username;
    if (user?.username) return user.username;
    if (authUser?.username) return authUser.username;
    if (authUser?.email) return authUser.email.split("@")[0];
    if (walletAddress) return generateUsername(walletAddress);
    return "Guest";
  }, [user, authUser, walletAddress]);

  const initials = useMemo(() => {
    return (
      (displayName || "Z")
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase() || "Z"
    );
  }, [displayName]);

  const appZwapBalance = Number(
    user?.zwap_balance ?? authUser?.zwap_pending ?? profile?.zwap_pending ?? 0
  );

  const zptsBalance = Number(
    user?.zpts_balance ?? authUser?.zpts_pending ?? profile?.zpts_balance ?? 0
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-cyan-500/20 bg-[#0a0b1e]/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        {/* Left side - audio hub */}
        <motion.button
          type="button"
          onClick={() => setAudioHubOpen(true)}
          className="relative min-w-[132px] max-w-[152px] overflow-hidden rounded-2xl border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_rgba(20,26,48,0.92)_45%,_rgba(15,18,34,0.98)_100%)] px-3 py-2 text-left shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
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
              <Music4 className="h-4 w-4 text-cyan-300" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/90">
                Audio
              </p>
              <div className="flex items-center gap-1 text-[11px] text-gray-300">
                <Play className="h-3 w-3" />
                <span>Open Hub</span>
              </div>
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
              {onchainBalance !== null ? onchainBalance.toFixed(2) : "0.00"}
            </motion.p>
            <p className="text-[10px] text-gray-500">Wallet</p>
          </div>

          <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent" />

          <div className="min-w-[54px] text-center">
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

          <div className="min-w-[46px] text-center">
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

        {/* Right side - account trigger */}
        <AccountDrawer
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          trigger={
            <motion.button
              className="relative h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xl font-bold uppercase shadow-lg shadow-cyan-500/30"
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

        <AudioHub open={audioHubOpen} onOpenChange={setAudioHubOpen} />
      </div>
    </header>
  );
}