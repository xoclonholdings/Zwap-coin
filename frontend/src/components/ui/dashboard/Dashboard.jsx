import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Gamepad2, Footprints, Brain } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/App";
import api from "@/lib/api";

import DashboardHero from "@/components/ui/dashboard/DashboardHero";
import DashboardDailyLoopCard from "@/components/ui/dashboard/DashboardDailyLoopCard";
import DashboardDailyTasksCard from "@/components/ui/dashboard/DashboardDailyTasksCard";
import DashboardStatusCard from "@/components/ui/dashboard/DashboardStatusCard";

function generateUsername(wallet) {
  if (!wallet) return "";

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

export default function Dashboard() {
  const {
    user,
    authUser,
    walletAddress,
    onchainBalance,
    openWalletUpgradeFlow,
    refreshUser,
  } = useApp();

  const [rewardStatus, setRewardStatus] = useState(null);
  const [rewardStatusLoading, setRewardStatusLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);

  const profile =
    user && typeof user === "object"
      ? user
      : authUser && typeof authUser === "object"
        ? authUser
        : {};

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
    Number(
      profile?.zwap_pending ??
        profile?.zwap_balance ??
        onchainBalance ??
        0
    ) || 0;

  const zpts =
    Number(profile?.zpts_pending ?? profile?.zpts_balance ?? 0) || 0;

  const gamesPlayed = Math.max(Number(profile?.games_played_today) || 0, 0);
  const gameGoal = Math.max(Number(profile?.daily_game_goal) || 1, 0);
  const currentTier = String(profile?.tier || "starter").toLowerCase();

  const canClaimDaily = hasWallet ? Boolean(rewardStatus?.can_claim) : false;

  const lastDailyClaim =
    rewardStatus?.last_daily_claim ?? profile?.last_daily_claim ?? null;

  const projectedStreak =
    Number(
      rewardStatus?.projected_streak ??
        (streak + (canClaimDaily ? 1 : 0))
    ) || 1;

  const dailyReward =
    Number(rewardStatus?.next_reward_zpts) ||
    (() => {
      const rewardTable = {
        1: 10,
        2: 15,
        3: 20,
        4: 25,
        5: 30,
        6: 35,
        7: 100,
      };

      return rewardTable[Math.min(Math.max(projectedStreak, 1), 7)] || 10;
    })();

  const username = useMemo(() => {
    const safeUser = user && typeof user === "object" ? user : null;
    const safeAuthUser = authUser && typeof authUser === "object" ? authUser : null;

    if (safeUser?.custom_username) return safeUser.custom_username;
    if (safeUser?.username) return safeUser.username;
    if (walletAddress) return generateUsername(walletAddress);
    if (safeAuthUser?.username) return safeAuthUser.username;
    if (safeAuthUser?.email) return safeAuthUser.email.split("@")[0];

    return "";
  }, [user, authUser, walletAddress]);

  const safeStepGoal = Math.max(stepGoal, 1);
  const safeGameGoal = Math.max(gameGoal, 1);

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
        api.getDailyRewardStatus
          ? api.getDailyRewardStatus(walletAddress)
          : null,
        refreshUser?.(),
      ]);

      if (freshStatus) {
        setRewardStatus(freshStatus);
      }
    } catch (error) {
      const message = error?.message || "Failed to claim daily reward";
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

  const nextBadge = {
    label: "Mover",
    category: "Movement",
    progress: Math.min(streak, 7),
    goal: 7,
    hint:
      streak >= 7
        ? "You’re ready for the next movement milestone."
        : `Keep building momentum. ${Math.max(7 - streak, 0)} more day${
            Math.max(7 - streak, 0) === 1 ? "" : "s"
          } to reach Mover.`,
  };

  return (
    <div className="min-h-screen bg-[#050510] px-3 pb-28 pt-3 text-white sm:px-4 lg:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DashboardHero username={username} currentTier={currentTier} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DashboardDailyLoopCard
            streak={streak}
            canClaim={canClaimDaily}
            reward={dailyReward}
            lastClaimText={lastClaimText}
            onClaim={handleClaimDaily}
            claimLoading={claimLoading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DashboardDailyTasksCard
            tasks={tasks}
            completedTaskCount={completedTaskCount}
            totalTasks={4}
            badgeLabel={nextBadge.label}
            badgeHint={nextBadge.hint}
            badgeProgress={nextBadge.progress}
            badgeGoal={nextBadge.goal}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DashboardStatusCard
            zpts={zpts}
            pendingZwap={pendingZwap}
            movePercent={stepsPercent}
            playPercent={playPercent}
            tasksCompleted={completedTaskCount}
            tasksTotal={4}
            nextBadge={nextBadge}
          />
        </motion.div>
      </div>
    </div>
  );
}