import React, { useMemo } from "react";
import { motion } from "framer-motion";
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
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/App";

function ProgressRing({
  value = 0,
  max = 100,
  size = 132,
  stroke = 10,
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
      glow: "drop-shadow(0 0 10px rgba(34,211,238,0.32))",
      text: "text-cyan-300",
    },
    purple: {
      track: "rgba(168, 85, 247, 0.14)",
      stroke: "#a855f7",
      glow: "drop-shadow(0 0 10px rgba(168,85,247,0.32))",
      text: "text-violet-300",
    },
    green: {
      track: "rgba(16, 185, 129, 0.14)",
      stroke: "#10b981",
      glow: "drop-shadow(0 0 10px rgba(16,185,129,0.32))",
      text: "text-emerald-300",
    },
  };

  const theme = accentMap[accent] || accentMap.cyan;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-semibold">{label}</p>
          <p className="text-xs text-gray-500 mt-1">{sublabel}</p>
        </div>
        <div className={`text-xs font-semibold ${theme.text}`}>
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
            y="47%"
            textAnchor="middle"
            className="fill-white text-[20px] font-bold"
          >
            {typeof value === "number" ? Math.round(value) : value}
          </text>
          <text
            x="50%"
            y="61%"
            textAnchor="middle"
            className="fill-gray-500 text-[11px]"
          >
            {max}
          </text>
        </svg>
      </div>
    </div>
  );
}

function MiniStatCard({ icon: Icon, label, value, tone = "cyan", hint }) {
  const toneMap = {
    cyan: "from-cyan-500/18 to-cyan-500/5 text-cyan-300 border-cyan-400/20",
    purple:
      "from-violet-500/18 to-violet-500/5 text-violet-300 border-violet-400/20",
    green:
      "from-emerald-500/18 to-emerald-500/5 text-emerald-300 border-emerald-400/20",
    amber:
      "from-amber-500/18 to-amber-500/5 text-amber-300 border-amber-400/20",
  };

  return (
    <div
      className={`rounded-[1.5rem] border bg-gradient-to-br p-4 ${toneMap[tone] || toneMap.cyan}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
        </div>

        <div className="w-10 h-10 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function DayStreakRow({ streak = 0 }) {
  const today = new Date();
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  const jsDay = today.getDay();

  return (
    <div className="rounded-[1.75rem] border border-orange-400/15 bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-transparent p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-300" />
            <p className="text-white font-semibold">Daily Streak</p>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Keep showing up. Momentum multiplies.
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-black text-orange-300">{streak}</p>
          <p className="text-xs text-gray-500">days</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {labels.map((label, index) => {
          const isToday = index === jsDay;
          const isActive = index < Math.min(streak, 7);

          return (
            <div
              key={`${label}-${index}`}
              className={`rounded-2xl border px-2 py-3 text-center transition ${
                isToday
                  ? "border-cyan-400/40 bg-cyan-500/15"
                  : isActive
                    ? "border-orange-400/25 bg-orange-500/12"
                    : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <p
                className={`text-xs font-semibold ${
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

function TaskRow({ done = false, title, reward, tone = "cyan" }) {
  const toneMap = {
    cyan: done
      ? "border-cyan-400/25 bg-cyan-500/10"
      : "border-white/10 bg-white/[0.03]",
    purple: done
      ? "border-violet-400/25 bg-violet-500/10"
      : "border-white/10 bg-white/[0.03]",
    green: done
      ? "border-emerald-400/25 bg-emerald-500/10"
      : "border-white/10 bg-white/[0.03]",
  };

  return (
    <div
      className={`rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 ${toneMap[tone] || toneMap.cyan}`}
    >
      <div className="min-w-0">
        <p className={`font-medium ${done ? "text-white" : "text-gray-200"}`}>
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-1">{reward}</p>
      </div>

      <div
        className={`w-6 h-6 rounded-full border flex items-center justify-center ${
          done
            ? "border-emerald-400/40 bg-emerald-500/20"
            : "border-white/10 bg-white/[0.03]"
        }`}
      >
        {done ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> : null}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, authUser, walletAddress, onchainBalance, requireWallet } = useApp();

  const profile = user || authUser || {};

  const streak = profile?.daily_streak || 3;
  const todaySteps = profile?.today_steps || 4826;
  const stepGoal = profile?.step_goal || 8000;
  const pendingZwap =
    Number(profile?.zwap_pending ?? profile?.zwap_balance ?? onchainBalance ?? 0) || 0;
  const zpts = Number(profile?.zpts_pending ?? profile?.zpts_balance ?? 125) || 0;
  const gamesPlayed = Number(profile?.games_played_today ?? 1) || 0;
  const gameGoal = Number(profile?.daily_game_goal ?? 3) || 3;
  const username = profile?.username || profile?.email?.split("@")[0] || "Zwapper";

  const dailyTasks = useMemo(
    () => [
      {
        title: "Check in to ZWAP!",
        reward: "+10 zPts",
        done: true,
        tone: "cyan",
      },
      {
        title: "Walk toward your goal",
        reward: "+15 zPts",
        done: todaySteps >= Math.min(stepGoal, 5000),
        tone: "green",
      },
      {
        title: "Play 1 game",
        reward: "+10 zPts",
        done: gamesPlayed >= 1,
        tone: "purple",
      },
      {
        title: "Reach full move goal",
        reward: "+0.25 ZWAP!",
        done: todaySteps >= stepGoal,
        tone: "cyan",
      },
    ],
    [todaySteps, stepGoal, gamesPlayed]
  );

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
        meta: `${Math.max(stepGoal - todaySteps, 0).toLocaleString()} to goal`,
      });
    }

    if (gamesPlayed > 0) {
      items.push({
        title: `🎮 ${gamesPlayed} game session${gamesPlayed > 1 ? "s" : ""} today`,
        meta: `${Math.max(gameGoal - gamesPlayed, 0)} left for daily target`,
      });
    }

    if (pendingZwap > 0 || zpts > 0) {
      items.push({
        title: `💰 Rewards building`,
        meta: `${pendingZwap.toFixed(2)} ZWAP! • ${zpts} zPts`,
      });
    }

    return items.slice(0, 4);
  }, [streak, todaySteps, stepGoal, gamesPlayed, gameGoal, pendingZwap, zpts]);

  const stepsPercent = Math.min((todaySteps / Math.max(stepGoal, 1)) * 100, 100);
  const playPercent = Math.min((gamesPlayed / Math.max(gameGoal, 1)) * 100, 100);

  const handleSwap = () => {
    requireWallet("swap");
  };

  const handleShop = () => {
    requireWallet("shop");
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white px-4 pb-28 pt-4 sm:px-5">
      <div className="max-w-6xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/6 to-pink-500/8 p-5 sm:p-6"
        >
          <div className="absolute -top-10 right-[-2rem] w-44 h-44 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-2rem] left-[-1rem] w-40 h-40 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">
                Move. Play. Swap. Shop.
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">
                Welcome back, {username}
              </h1>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-gray-300 leading-relaxed">
                Your ZWAP! dashboard is your daily pulse: movement, rewards,
                streaks, and progress all in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full lg:w-[360px]">
              <MiniStatCard
                icon={Flame}
                label="Streak"
                value={`${streak} days`}
                tone="amber"
                hint="Daily momentum"
              />
              <MiniStatCard
                icon={Coins}
                label="Pending ZWAP!"
                value={pendingZwap.toFixed(2)}
                tone="cyan"
                hint="Claim when ready"
              />
              <MiniStatCard
                icon={Sparkles}
                label="zPts"
                value={zpts}
                tone="purple"
                hint="Play-powered rewards"
              />
              <MiniStatCard
                icon={Wallet}
                label="Wallet"
                value={walletAddress ? "Connected" : "Not yet"}
                tone="green"
                hint={walletAddress ? "Ready to claim" : "Optional for now"}
              />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <DayStreakRow streak={streak} />
        </motion.div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-5 md:grid-cols-2"
            >
              <ProgressRing
                value={todaySteps}
                max={stepGoal}
                label="Today’s Move Goal"
                sublabel="Walk, build streak, stack rewards"
                accent="cyan"
              />

              <ProgressRing
                value={gamesPlayed}
                max={gameGoal}
                label="Play Progress"
                sublabel="Daily game rhythm"
                accent="purple"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Today’s Missions</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Small wins. Daily rhythm. Compound progress.
                  </p>
                </div>
                <Target className="w-5 h-5 text-cyan-300 mt-1" />
              </div>

              <div className="space-y-3">
                {dailyTasks.map((task) => (
                  <TaskRow
                    key={task.title}
                    title={task.title}
                    reward={task.reward}
                    done={task.done}
                    tone={task.tone}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Rewards Snapshot</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    What you’re building right now
                  </p>
                </div>
                <CircleDollarSign className="w-5 h-5 text-emerald-300 mt-1" />
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-cyan-300/80">
                    Pending ZWAP!
                  </p>
                  <p className="text-3xl font-black text-white mt-2">
                    {pendingZwap.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Connect a wallet when you want to claim onchain.
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-400/15 bg-violet-500/10 px-4 py-4">
                  <p className="text-xs uppercase tracking-wide text-violet-300/80">
                    zPts Balance
                  </p>
                  <p className="text-3xl font-black text-white mt-2">{zpts}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Earn more through Play and daily actions.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleSwap}
                    className="h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Swap
                  </Button>

                  <Button
                    onClick={handleShop}
                    variant="outline"
                    className="h-12 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Shop
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Live Activity</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Your day inside ZWAP!
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-cyan-300 mt-1" />
              </div>

              <div className="space-y-3">
                {recentActivity.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3"
                  >
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.meta}</p>
                  </div>
                ))}

                {!recentActivity.length ? (
                  <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4 text-sm text-gray-400">
                    Activity will start building as you move, play, and earn in ZWAP!
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Quick Actions</h2>
              <p className="text-sm text-gray-400 mt-1">
                Jump into the part of ZWAP! you want right now.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                className="h-12 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              >
                <Footprints className="w-4 h-4 mr-2" />
                Move
              </Button>

              <Button
                variant="outline"
                className="h-12 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Play
              </Button>

              <Button
                onClick={handleSwap}
                variant="outline"
                className="h-12 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Swap
              </Button>

              <Button
                onClick={handleShop}
                variant="outline"
                className="h-12 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-2"
        >
          <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-r from-cyan-500/8 via-violet-500/6 to-pink-500/8 px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Today’s rhythm is building
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {stepsPercent >= 100
                    ? "Move goal complete. Nice work."
                    : `${Math.max(stepGoal - todaySteps, 0).toLocaleString()} steps left to finish today’s move goal.`}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-300">
                <span className="px-2.5 py-1 rounded-xl bg-white/[0.05] border border-white/10">
                  Move {Math.round(stepsPercent)}%
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/[0.05] border border-white/10">
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