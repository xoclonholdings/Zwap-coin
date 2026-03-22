import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Footprints,
  Coins,
  Gamepad2,
  ShoppingBag,
  ArrowRightLeft,
  Wallet,
  Sparkles,
  ShieldCheck,
  CircleDollarSign,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/App";

function ProgressRing({
  value = 0,
  max = 100,
  size = 112,
  stroke = 9,
  accent = "cyan",
  label,
  sublabel,
}) {
  const safeMax = Math.max(max, 1);
  const percent = Math.max(0, Math.min((value / safeMax) * 100, 100));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  const accentMap = {
    cyan: {
      track: "rgba(34, 211, 238, 0.14)",
      stroke: "#22d3ee",
      glow: "drop-shadow(0 0 8px rgba(34,211,238,0.28))",
      text: "text-cyan-300",
    },
    purple: {
      track: "rgba(168, 85, 247, 0.14)",
      stroke: "#a855f7",
      glow: "drop-shadow(0 0 8px rgba(168,85,247,0.28))",
      text: "text-violet-300",
    },
  };

  const theme = accentMap[accent] || accentMap.cyan;

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-white font-semibold text-sm">{label}</p>
          <p className="text-[11px] text-gray-500 mt-1">{sublabel}</p>
        </div>
        <div className={`text-[11px] font-semibold ${theme.text}`}>
          {Math.round(percent)}%
        </div>
      </div>

      <div className="flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={theme.track}
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={theme.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: theme.glow }}
          />
          <text
            x="50%"
            y="46%"
            textAnchor="middle"
            className="fill-white text-[18px] font-bold"
          >
            {typeof value === "number" ? Math.round(value) : value}
          </text>
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            className="fill-gray-500 text-[10px]"
          >
            {max}
          </text>
        </svg>
      </div>
    </div>
  );
}

function CompactStat({ icon: Icon, label, value, hint, tone = "cyan" }) {
  const toneMap = {
    cyan: "text-cyan-300 border-cyan-400/15 bg-cyan-500/8",
    purple: "text-violet-300 border-violet-400/15 bg-violet-500/8",
    green: "text-emerald-300 border-emerald-400/15 bg-emerald-500/8",
    amber: "text-amber-300 border-amber-400/15 bg-amber-500/8",
  };

  return (
    <div
      className={`rounded-2xl border p-3 ${toneMap[tone] || toneMap.cyan}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold text-white leading-none">{value}</p>
          {hint ? <p className="mt-1 text-[11px] text-gray-500">{hint}</p> : null}
        </div>

        <div className="w-8 h-8 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

function StreakStrip({ streak = 0 }) {
  const today = new Date().getDay();
  const labels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="rounded-[1.5rem] border border-orange-400/15 bg-gradient-to-r from-orange-500/10 via-pink-500/5 to-transparent p-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Flame className="w-4 h-4 text-orange-300 shrink-0" />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm">Daily Streak</p>
            <p className="text-[11px] text-gray-500">Momentum multiplies.</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-2xl font-black text-orange-300 leading-none">{streak}</p>
          <p className="text-[10px] text-gray-500 mt-1">days</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {labels.map((label, index) => {
          const isToday = index === today;
          const isActive = index < Math.min(streak, 7);

          return (
            <div
              key={`${label}-${index}`}
              className={`rounded-xl border py-2 text-center ${
                isToday
                  ? "border-cyan-400/35 bg-cyan-500/12"
                  : isActive
                    ? "border-orange-400/20 bg-orange-500/10"
                    : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <p
                className={`text-[10px] font-semibold ${
                  isToday
                    ? "text-cyan-300"
                    : isActive
                      ? "text-orange-300"
                      : "text-gray-500"
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityRow({ title, meta }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5">
      <p className="text-white text-sm font-medium truncate">{title}</p>
      <p className="text-[11px] text-gray-500 mt-1 truncate">{meta}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, authUser, walletAddress, onchainBalance, requireWallet } = useApp();

  const profile = user || authUser || {};

  const streak = profile?.daily_streak || 3;
  const todaySteps = profile?.today_steps || 4826;
  const stepGoal = profile?.step_goal || 8000;
  const pendingZwap =
    Number(profile?.zwap_pending ?? profile?.zwap_balance ?? onchainBalance ?? 0) || 0;
  const zpts = Number(profile?.zpts_pending ?? profile?.zpts_balance ?? 0) || 0;
  const gamesPlayed = Number(profile?.games_played_today ?? 1) || 0;
  const gameGoal = Number(profile?.daily_game_goal ?? 3) || 3;
  const username =
    profile?.username || profile?.email?.split("@")[0] || "Zwapper";

  const stepsLeft = Math.max(stepGoal - todaySteps, 0);
  const stepsPercent = Math.min((todaySteps / Math.max(stepGoal, 1)) * 100, 100);
  const playPercent = Math.min((gamesPlayed / Math.max(gameGoal, 1)) * 100, 100);

  const recentActivity = useMemo(() => {
    const items = [];

    if (streak > 0) {
      items.push({
        title: `🔥 ${streak}-day streak active`,
        meta: "Keep it going tomorrow",
      });
    }

    if (todaySteps > 0) {
      items.push({
        title: `👟 ${todaySteps.toLocaleString()} steps recorded`,
        meta: `${stepsLeft.toLocaleString()} to goal`,
      });
    }

    if (gamesPlayed > 0) {
      items.push({
        title: `🎮 ${gamesPlayed} game session${gamesPlayed > 1 ? "s" : ""} today`,
        meta: `${Math.max(gameGoal - gamesPlayed, 0)} left for daily target`,
      });
    }

    return items.slice(0, 2);
  }, [streak, todaySteps, stepsLeft, gamesPlayed, gameGoal]);

  const handleSwap = () => {
    requireWallet("swap");
  };

  const handleShop = () => {
    requireWallet("shop");
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white px-3 pb-28 pt-3 sm:px-4">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Compact hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-pink-500/8 p-4"
        >
          <div className="absolute -top-8 right-[-2rem] w-32 h-32 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-2rem] left-[-1rem] w-28 h-28 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
                Move. Play. Swap. Shop.
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {username}
              </h1>
              <p className="mt-1 text-sm text-gray-300 leading-relaxed">
                Your ZWAP! daily pulse in one glance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CompactStat
                icon={Flame}
                label="Streak"
                value={`${streak} days`}
                tone="amber"
              />
              <CompactStat
                icon={Coins}
                label="Pending ZWAP!"
                value={pendingZwap.toFixed(2)}
                tone="cyan"
              />
              <CompactStat
                icon={Sparkles}
                label="zPts"
                value={zpts}
                tone="purple"
              />
              <CompactStat
                icon={Wallet}
                label="Wallet"
                value={walletAddress ? "Connected" : "Later"}
                tone="green"
              />
            </div>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <StreakStrip streak={streak} />
        </motion.div>

        {/* Primary cards first */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <ProgressRing
            value={todaySteps}
            max={stepGoal}
            label="Move Goal"
            sublabel="Stack rewards"
            accent="cyan"
          />

          <ProgressRing
            value={gamesPlayed}
            max={gameGoal}
            label="Play Progress"
            sublabel="Daily rhythm"
            accent="purple"
          />
        </motion.div>

        {/* Rewards + actions combined */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Rewards</h2>
              <p className="text-[11px] text-gray-500 mt-1">
                Claim later, keep building now.
              </p>
            </div>
            <CircleDollarSign className="w-4 h-4 text-emerald-300 mt-1 shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 px-3 py-3">
              <p className="text-[10px] uppercase tracking-wide text-cyan-300/80">
                Pending ZWAP!
              </p>
              <p className="text-2xl font-black text-white mt-1">
                {pendingZwap.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-violet-400/15 bg-violet-500/10 px-3 py-3">
              <p className="text-[10px] uppercase tracking-wide text-violet-300/80">
                zPts
              </p>
              <p className="text-2xl font-black text-white mt-1">{zpts}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleSwap}
              className="h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Swap
            </Button>

            <Button
              onClick={handleShop}
              variant="outline"
              className="h-11 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop
            </Button>
          </div>
        </motion.div>

        {/* Slim live activity */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Today</h2>
              <p className="text-[11px] text-gray-500 mt-1">
                The essentials only.
              </p>
            </div>
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
          </div>

          <div className="space-y-2">
            {recentActivity.map((item, index) => (
              <ActivityRow
                key={`${item.title}-${index}`}
                title={item.title}
                meta={item.meta}
              />
            ))}
          </div>
        </motion.div>

        {/* Quick actions compressed */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-bold text-white">Quick Actions</h2>
              <p className="text-[11px] text-gray-500 mt-1">
                Jump where you want.
              </p>
            </div>

            <button
              onClick={() => navigate("/move")}
              className="inline-flex items-center gap-1 text-[11px] text-cyan-300"
            >
              Open
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={() => navigate("/move")}
              variant="outline"
              className="h-11 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] px-2"
            >
              <Footprints className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => navigate("/play")}
              variant="outline"
              className="h-11 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] px-2"
            >
              <Gamepad2 className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleSwap}
              variant="outline"
              className="h-11 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] px-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleShop}
              variant="outline"
              className="h-11 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06] px-2"
            >
              <ShoppingBag className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Tiny footer status */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-1"
        >
          <div className="rounded-[1.25rem] border border-white/10 bg-gradient-to-r from-cyan-500/8 via-violet-500/6 to-pink-500/8 px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Today’s rhythm is building
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {stepsPercent >= 100
                    ? "Move goal complete."
                    : `${stepsLeft.toLocaleString()} steps left to finish today’s move goal.`}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-gray-300">
                <span className="px-2 py-1 rounded-xl bg-white/[0.05] border border-white/10">
                  Move {Math.round(stepsPercent)}%
                </span>
                <span className="px-2 py-1 rounded-xl bg-white/[0.05] border border-white/10">
                  Play {Math.round(playPercent)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}