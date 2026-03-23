import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Coins,
  ShoppingBag,
  ArrowRightLeft,
  Wallet,
  Sparkles,
  CircleDollarSign,
  Gift,
  Gamepad2,
  Footprints,
  Brain,
  CheckCircle2,
  Crown,
  UserCircle2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApp, api } from "@/App";

function generateUsername(wallet) {
  if (!wallet) return "Guest";

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

function ProgressRing({
  value = 0,
  max = 100,
  size = 112,
  stroke = 9,
  accent = "cyan",
  label,
  sublabel,
  footer,
}) {
  const safeMax = Math.max(Number(max) || 0, 1);
  const safeValue = Math.max(Number(value) || 0, 0);
  const percent = Math.max(0, Math.min((safeValue / safeMax) * 100, 100));
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
    green: {
      track: "rgba(52, 211, 153, 0.14)",
      stroke: "#34d399",
      glow: "drop-shadow(0 0 8px rgba(52,211,153,0.28))",
      text: "text-emerald-300",
    },
  };

  const theme = accentMap[accent] || accentMap.cyan;

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 text-[11px] text-gray-500">{sublabel}</p>
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
            {Math.round(safeValue)}
          </text>
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            className="fill-gray-500 text-[10px]"
          >
            {safeMax}
          </text>
        </svg>
      </div>

      {footer ? (
        <p className="mt-3 text-center text-[11px] text-gray-500">{footer}</p>
      ) : null}
    </div>
  );
}

function TierPill({ tier = "starter" }) {
  const isPlus = String(tier).toLowerCase() === "plus";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
        isPlus
          ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
          : "border-cyan-400/20 bg-cyan-500/10 text-cyan-300"
      }`}
    >
      {isPlus ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
      {isPlus ? "Plus" : "Starter"}
    </div>
  );
}

function StreakStrip({ streak = 0 }) {
  const today = new Date().getDay();
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  const safeStreak = Math.max(Number(streak) || 0, 0);

  return (
    <div className="rounded-[1.5rem] border border-orange-400/15 bg-gradient-to-r from-orange-500/10 via-pink-500/5 to-transparent p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10">
            <Flame className="h-4 w-4 shrink-0 text-orange-300" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Daily Streak</p>
            <p className="text-[11px] text-gray-500">Come back daily. Stack the heat.</p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-black leading-none text-orange-300">
            {safeStreak}
          </p>
          <p className="mt-1 text-[10px] text-gray-500">days</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {labels.map((label, index) => {
          const isToday = index === today;
          const isActive = index < Math.min(safeStreak, 7);
          const isBonus = index === 6;

          return (
            <div key={`${label}-${index}`} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-[11px] font-bold transition-all ${
                  isToday
                    ? "border-cyan-400/40 bg-cyan-500/12 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                    : isActive
                      ? isBonus
                        ? "border-amber-400/35 bg-amber-500/12 text-amber-300"
                        : "border-orange-400/20 bg-orange-500/10 text-orange-300"
                      : "border-white/10 bg-white/[0.03] text-gray-500"
                }`}
              >
                {isBonus ? <Crown className="h-4 w-4" /> : <span>{label}</span>}
              </div>
              <p
                className={`text-[10px] ${
                  isToday
                    ? "text-cyan-300"
                    : isActive
                      ? "text-white"
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

function DailyClaimPanel({
  streak = 0,
  canClaim = true,
  reward = 10,
  lastClaimText,
  onClaim,
  claimLoading = false,
}) {
  return (
    <div className="rounded-[1.5rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/10 via-cyan-500/6 to-transparent p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">
            Daily Claim
          </p>
          <h2 className="mt-2 text-xl font-black text-white">
            {canClaim ? `+${reward} zPts ready` : "Claimed for today"}
          </h2>
          <p className="mt-1 text-sm text-gray-300">
            {canClaim
              ? `Day ${Math.max(streak, 0) + 1} reward is waiting.`
              : lastClaimText || "Your next daily claim unlocks tomorrow."}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10">
          <Gift className="h-5 w-5 text-emerald-300" />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-3 py-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Current streak</p>
          <p className="mt-1 text-lg font-bold text-white">{streak} days</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Next bonus</p>
          <p className="mt-1 text-lg font-bold text-amber-300">Day 7</p>
        </div>
      </div>

      <Button
        onClick={onClaim}
        disabled={!canClaim || claimLoading}
        className={`h-11 w-full rounded-xl font-semibold ${
          canClaim
            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400"
            : "bg-white/[0.06] text-gray-400 hover:bg-white/[0.06]"
        }`}
      >
        {claimLoading
          ? "Claiming..."
          : canClaim
            ? "Claim Daily Reward"
            : "Already Claimed"}
      </Button>
    </div>
  );
}

function TaskCard({ icon: Icon, title, reward, completed = false, hint }) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        completed
          ? "border-emerald-400/20 bg-emerald-500/10"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20">
          <Icon className={`h-4 w-4 ${completed ? "text-emerald-300" : "text-cyan-300"}`} />
        </div>

        {completed ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
        ) : (
          <div className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
            +{reward}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-[11px] text-gray-500">
          {completed ? "Complete" : hint}
        </p>
      </div>
    </div>
  );
}

function ActivityRow({ title, meta }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2.5">
      <p className="truncate text-sm font-medium text-white">{title}</p>
      <p className="mt-1 truncate text-[11px] text-gray-500">{meta}</p>
    </div>
  );
}

export default function Dashboard() {
  const {
    user,
    authUser,
    walletAddress,
    onchainBalance,
    requireWallet,
    openWalletUpgradeFlow,
    refreshUser,
  } = useApp();

  const [rewardStatus, setRewardStatus] = useState(null);
  const [rewardStatusLoading, setRewardStatusLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  const profile = user || authUser || {};
  const hasWallet = !!walletAddress;

  useEffect(() => {
    let active = true;

    const loadRewardStatus = async () => {
      if (!walletAddress || !api?.getDailyRewardStatus) {
        setRewardStatus(null);
        return;
      }

      try {
        setRewardStatusLoading(true);
        const data = await api.getDailyRewardStatus(walletAddress);
        if (active) {
          setRewardStatus(data);
        }
      } catch (error) {
        if (active) {
          console.log("Failed to load daily reward status:", error);
          setRewardStatus(null);
        }
      } finally {
        if (active) {
          setRewardStatusLoading(false);
        }
      }
    };

    loadRewardStatus();

    return () => {
      active = false;
    };
  }, [walletAddress]);

  const streak =
    Number(rewardStatus?.current_streak ?? profile?.daily_streak ?? 0) || 0;

  const todaySteps = Math.max(
    Number(profile?.today_steps ?? profile?.daily_steps) || 0,
    0
  );
  const stepGoal = Math.max(Number(profile?.step_goal) || 5000, 0);

  const pendingZwap =
    Number(profile?.zwap_pending ?? profile?.zwap_balance ?? onchainBalance ?? 0) || 0;

  const zpts = Number(profile?.zpts_pending ?? profile?.zpts_balance ?? 0) || 0;
  const gamesPlayed = Math.max(Number(profile?.games_played_today) || 0, 0);
  const gameGoal = Math.max(Number(profile?.daily_game_goal) || 1, 0);
  const currentTier = String(profile?.tier || "starter").toLowerCase();

  const canClaimDaily = hasWallet
    ? Boolean(rewardStatus?.can_claim)
    : false;

  const lastDailyClaim =
    rewardStatus?.last_daily_claim ?? profile?.last_daily_claim ?? null;

  const projectedStreak =
    Number(rewardStatus?.projected_streak ?? (streak + (canClaimDaily ? 1 : 0))) || 1;

  const dailyReward =
    Number(rewardStatus?.next_reward_zpts) || (() => {
      const rewardTable = { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30, 6: 35, 7: 100 };
      return rewardTable[Math.min(Math.max(projectedStreak, 1), 7)] || 10;
    })();

  const username = useMemo(() => {
    if (profile?.custom_username) return profile.custom_username;
    if (profile?.username) return profile.username;
    if (authUser?.username) return authUser.username;
    if (authUser?.email) return authUser.email.split("@")[0];
    if (walletAddress) return generateUsername(walletAddress);
    return "Guest";
  }, [profile, authUser, walletAddress]);

  const safeStepGoal = Math.max(stepGoal, 1);
  const safeGameGoal = Math.max(gameGoal, 1);

  const zptsGoal = 1000;
  const zptsToConvert = Math.max(zptsGoal - zpts, 0);

  const stepsLeft = Math.max(stepGoal - todaySteps, 0);
  const gamesLeft = Math.max(gameGoal - gamesPlayed, 0);
  const stepsPercent = Math.min((todaySteps / safeStepGoal) * 100, 100);
  const playPercent = Math.min((gamesPlayed / safeGameGoal) * 100, 100);

  const loginComplete = hasWallet ? !canClaimDaily && !!lastDailyClaim : false;
  const playComplete = gamesPlayed >= 1;
  const stepsComplete = stepGoal > 0 ? todaySteps >= stepGoal : false;
  const triviaComplete = !!profile?.daily_trivia_complete;

  const completedTaskCount = [
    loginComplete,
    playComplete,
    stepsComplete,
    triviaComplete,
  ].filter(Boolean).length;

  const tasks = [
    {
      icon: Gift,
      title: "Daily Login",
      reward: dailyReward,
      completed: loginComplete,
      hint: hasWallet ? "Claim today’s login reward" : "Connect wallet to claim",
    },
    {
      icon: Gamepad2,
      title: "Play 1 Game",
      reward: 10,
      completed: playComplete,
      hint: playComplete ? "Complete" : `${gamesLeft} left today`,
    },
    {
      icon: Footprints,
      title: "Reach Step Goal",
      reward: 15,
      completed: stepsComplete,
      hint: stepsComplete ? "Complete" : `${stepsLeft.toLocaleString()} steps left`,
    },
    {
      icon: Brain,
      title: "Complete Trivia",
      reward: 10,
      completed: triviaComplete,
      hint: triviaComplete ? "Complete" : "Finish today’s trivia task",
    },
  ];

  const recentActivity = useMemo(() => {
    const items = [];

    if (loginComplete) {
      items.push({
        title: "✨ Daily claim secured",
        meta: `+${dailyReward} zPts added to your loop`,
      });
    }

    if (streak > 0) {
      items.push({
        title: `🔥 ${streak}-day streak active`,
        meta: streak >= 6 ? "Bonus day is almost here" : "Keep it alive tomorrow",
      });
    }

    if (todaySteps > 0) {
      items.push({
        title: `👟 ${todaySteps.toLocaleString()} steps recorded`,
        meta:
          stepGoal > 0
            ? stepsPercent >= 100
              ? "Move goal complete"
              : `${stepsLeft.toLocaleString()} to goal`
            : "No step goal set yet",
      });
    }

    if (gamesPlayed > 0) {
      items.push({
        title: `🎮 ${gamesPlayed} game session${gamesPlayed > 1 ? "s" : ""} today`,
        meta:
          gameGoal > 0
            ? `${Math.max(gameGoal - gamesPlayed, 0)} left for daily target`
            : "No game goal set yet",
      });
    }

    if (items.length === 0) {
      items.push({
        title: "No activity yet",
        meta: "Move, play, and stack rewards in ZWAP!",
      });
    }

    return items.slice(0, 2);
  }, [
    loginComplete,
    dailyReward,
    streak,
    todaySteps,
    stepGoal,
    stepsPercent,
    stepsLeft,
    gamesPlayed,
    gameGoal,
  ]);

  const handleSwap = () => {
    if (hasWallet) {
      requireWallet("swap");
      return;
    }
    openWalletUpgradeFlow();
  };

  const handleShop = () => {
    requireWallet("shop");
  };

  const handleClaimDaily = async () => {
    if (!hasWallet) {
      openWalletUpgradeFlow();
      return;
    }

    if (!api?.claimDailyReward) {
      toast.error("Daily reward API not connected yet.");
      return;
    }

    try {
      setClaimLoading(true);
      const result = await api.claimDailyReward(walletAddress);

      toast.success(result?.message || "Daily reward claimed!");

      const [freshStatus] = await Promise.all([
        api.getDailyRewardStatus ? api.getDailyRewardStatus(walletAddress) : null,
        refreshUser?.(),
      ]);

      if (freshStatus) {
        setRewardStatus(freshStatus);
      }
    } catch (error) {
      const message =
        error?.message || "Failed to claim daily reward";
      toast.error(message);
    } finally {
      setClaimLoading(false);
    }
  };

  const lastClaimText = rewardStatusLoading
    ? "Checking reward status..."
    : lastDailyClaim
      ? "Reward already claimed today"
      : "Claim now and keep the streak burning";

  return (
    <div className="min-h-screen bg-[#050510] px-3 pb-28 pt-3 text-white sm:px-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-pink-500/8 p-4"
        >
          <div className="pointer-events-none absolute -top-8 right-[-2rem] h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-2rem] left-[-1rem] h-28 w-28 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
                  Home
                </p>
                <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  Welcome back, {username}
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-gray-300">
                  Your ZWAP! daily pulse in one glance.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <TierPill tier={currentTier} />
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                  <UserCircle2 className="h-6 w-6 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <StreakStrip streak={streak} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <DailyClaimPanel
              streak={streak}
              canClaim={canClaimDaily}
              reward={dailyReward}
              lastClaimText={lastClaimText}
              onClaim={handleClaimDaily}
              claimLoading={claimLoading}
            />

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-2">
              <ProgressRing
                value={zpts}
                max={zptsGoal}
                label="zPts Progress"
                sublabel="Convert to 1 ZWAP"
                accent="purple"
                footer={
                  zpts >= zptsGoal
                    ? "Conversion threshold reached"
                    : `${zptsToConvert} zPts left to convert`
                }
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Daily Tasks</h2>
              <p className="mt-1 text-[11px] text-gray-500">
                Complete the loop. Build the habit.
              </p>
            </div>

            <div className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
              {completedTaskCount}/4 done
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.title}
                icon={task.icon}
                title={task.title}
                reward={task.reward}
                completed={task.completed}
                hint={task.hint}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <ProgressRing
                value={todaySteps}
                max={safeStepGoal}
                label="Move Goal"
                sublabel={stepGoal > 0 ? "Daily movement snapshot" : "Goal not set yet"}
                accent="cyan"
                footer={
                  stepGoal > 0
                    ? stepsPercent >= 100
                      ? "Move goal complete"
                      : `${stepsLeft.toLocaleString()} steps left`
                    : "Set a goal to start tracking"
                }
              />

              <ProgressRing
                value={gamesPlayed}
                max={safeGameGoal}
                label="Play Progress"
                sublabel={gameGoal > 0 ? "Daily game rhythm" : "Goal not set yet"}
                accent="green"
                footer={
                  gameGoal > 0
                    ? playPercent >= 100
                      ? "Play target complete"
                      : `${gamesLeft} game${gamesLeft === 1 ? "" : "s"} left`
                    : "Start a game session"
                }
              />
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Today</h2>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Live rhythm, recent wins.
                  </p>
                </div>
                <Sparkles className="h-4 w-4 shrink-0 text-cyan-300" />
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

              <button
                type="button"
                className="mt-3 flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/15 px-3 py-2.5 text-left transition hover:bg-white/[0.04]"
              >
                <div>
                  <p className="text-sm font-medium text-white">Open activity feed</p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Ticker-ready events and latest movement
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Rewards</h2>
              <p className="mt-1 text-[11px] text-gray-500">
                {hasWallet
                  ? "Claim, swap, and use what you earn."
                  : "Keep building now, connect a wallet when ready."}
              </p>
            </div>
            <CircleDollarSign className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-3">
              <p className="text-[10px] uppercase tracking-wide text-cyan-300/80">
                Pending ZWAP!
              </p>
              <p className="mt-1 text-2xl font-black text-white">
                {pendingZwap.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-violet-400/15 bg-violet-500/10 p-3">
              <p className="text-[10px] uppercase tracking-wide text-violet-300/80">
                zPts
              </p>
              <p className="mt-1 text-2xl font-black text-white">{zpts}</p>
            </div>

            <Button
              onClick={handleSwap}
              className="h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-white hover:from-cyan-400 hover:to-blue-400"
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              {hasWallet ? "Swap" : "Get Wallet"}
            </Button>

            <Button
              onClick={handleShop}
              variant="outline"
              className="h-11 rounded-xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Shop
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-1"
        >
          <div className="rounded-[1.25rem] border border-white/10 bg-gradient-to-r from-cyan-500/8 via-violet-500/6 to-pink-500/8 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Today’s rhythm is building
                </p>
                <p className="mt-1 text-[11px] text-gray-400">
                  {stepGoal > 0
                    ? stepsPercent >= 100
                      ? "Move goal complete."
                      : `${stepsLeft.toLocaleString()} steps left to finish today’s move goal.`
                    : "Set your goals and start building momentum."}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-gray-300">
                <span className="rounded-xl border border-white/10 bg-white/[0.05] px-2 py-1">
                  Move {Math.round(stepsPercent)}%
                </span>
                <span className="rounded-xl border border-white/10 bg-white/[0.05] px-2 py-1">
                  Play {Math.round(playPercent)}%
                </span>
                <span className="rounded-xl border border-white/10 bg-white/[0.05] px-2 py-1">
                  Tasks {completedTaskCount}/4
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}