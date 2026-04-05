import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Gamepad2, Sparkles, Brain } from "lucide-react";
import { useApp } from "@/App";
import api from "@/lib/api";

import DashboardHero from "@/components/ui/dashboard/DashboardHero";
import DashboardDailyLoopCard from "@/components/ui/dashboard/DashboardDailyLoopCard";
import DashboardDailyTasksCard from "@/components/ui/dashboard/DashboardDailyTasksCard";
import DashboardStatusCard from "@/components/ui/dashboard/DashboardStatusCard";
import StatusPopup from "@/components/ui/StatusPopup";
import { generateDailyTasks } from "@/lib/tasks/generateDailyTasks";
import { getNextBadge } from "@/lib/badges/getNextBadge";

const ADJECTIVES = [
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

const NOUNS = [
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

function hashString(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

import { generateUsername } from "@/lib/utils/generateUsername";
  const seedSource = walletAddress || email || "";
  if (!seedSource) return "Zwapper";

  const seed =
    walletAddress && walletAddress.startsWith("0x")
      ? parseInt(walletAddress.slice(2, 10), 16)
      : hashString(String(seedSource).toLowerCase());

  const adjIndex = Math.abs(seed) % ADJECTIVES.length;
  const nounIndex = Math.abs(Math.floor(seed / 8)) % NOUNS.length;
  const num = Math.abs(seed) % 999;

  return `${ADJECTIVES[adjIndex]}${NOUNS[nounIndex]}${num}`;
}

const taskIconMap = {
  login: Gift,
  learn: Brain,
  play: Gamepad2,
  social: Sparkles,
};

function DashboardCenterContent({
  username,
  currentTier,
  streak,
  canClaimDaily,
  dailyReward,
  lastClaimText,
  handleClaimDaily,
  claimLoading,
  tasks,
  completedTaskCount,
  nextBadge,
  stepsPercent,
  playPercent,
}) {
  return (
    <div className="w-full min-w-0">
      <div className="space-y-4">
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
            movePercent={stepsPercent}
            playPercent={playPercent}
            nextBadge={nextBadge}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const {
    user,
    authUser,
    walletAddress,
    openWalletUpgradeFlow,
    refreshUser,
  } = useApp();

  const [rewardStatus, setRewardStatus] = useState(null);
  const [rewardStatusLoading, setRewardStatusLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [popup, setPopup] = useState({
    open: false,
    message: "",
    type: "info",
  });

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

  const gamesPlayed = Math.max(Number(profile?.games_played_today) || 0, 0);
  const gameGoal = Math.max(Number(profile?.daily_game_goal) || 1, 0);
  const currentTier = String(profile?.tier || "starter").toLowerCase();

  const canClaimDaily = hasWallet ? Boolean(rewardStatus?.can_claim) : false;

  const lastDailyClaim =
    rewardStatus?.last_daily_claim ?? profile?.last_daily_claim ?? null;

  const projectedStreak =
    Number(
      rewardStatus?.projected_streak ?? (streak + (canClaimDaily ? 1 : 0))
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

    return generateUsername({
      walletAddress,
      email: safeAuthUser?.email || safeUser?.email,
      username: safeUser?.custom_username || safeUser?.username,
    });
  }, [user, authUser, walletAddress]);

  const safeStepGoal = Math.max(stepGoal, 1);
  const safeGameGoal = Math.max(gameGoal, 1);

  const stepsPercent = Math.min((todaySteps / safeStepGoal) * 100, 100);
  const playPercent = Math.min((gamesPlayed / safeGameGoal) * 100, 100);

  const tasks = useMemo(() => {
    const generatedTasks = generateDailyTasks({
      hasWallet,
      canClaimDaily,
      lastDailyClaim,
      dailyReward,
      gamesPlayed,
      profile,
      walletAddress,
    });

    return generatedTasks.map((task) => ({
      ...task,
      icon: taskIconMap[task.key] || Sparkles,
    }));
  }, [
    hasWallet,
    canClaimDaily,
    lastDailyClaim,
    dailyReward,
    gamesPlayed,
    profile,
    walletAddress,
  ]);

  const completedTaskCount = tasks.filter((task) => task.completed).length;

  const handleClaimDaily = async () => {
    if (!hasWallet) {
      openWalletUpgradeFlow();
      return;
    }

    if (!api?.claimDailyReward) {
      setPopup({
        open: true,
        message: "Daily reward API not connected yet.",
        type: "error",
      });
      return;
    }

    try {
      setClaimLoading(true);

      const result = await api.claimDailyReward(walletAddress);

      setPopup({
        open: true,
        message: result?.message || "Daily reward claimed!",
        type: "success",
      });

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
      setPopup({
        open: true,
        message,
        type: "error",
      });
    } finally {
      setClaimLoading(false);
    }
  };

  const lastClaimText = rewardStatusLoading
    ? "Checking reward status..."
    : lastDailyClaim
      ? "Reward already claimed today"
      : "Claim now and keep the streak burning";

  const nextBadge = useMemo(() => {
    return getNextBadge({
      ...profile,
      daily_login_count: profile?.daily_login_count ?? streak,
      daily_loop_completions: profile?.daily_loop_completions ?? 0,
      move_active_days: profile?.move_active_days ?? 0,
      move_streak_days: profile?.move_streak_days ?? streak,
      daily_assists_sent_total: profile?.daily_assists_sent_total ?? 0,
      zpts_lifetime: profile?.zpts_lifetime ?? profile?.zpts_balance ?? 0,
      referral_count: profile?.referral_count ?? 0,
      learn_modules_completed_total: profile?.learn_modules_completed_total ?? 0,
    });
  }, [profile, streak]);

  return (
    <>
      <DashboardCenterContent
        username={username}
        currentTier={currentTier}
        streak={streak}
        canClaimDaily={canClaimDaily}
        dailyReward={dailyReward}
        lastClaimText={lastClaimText}
        handleClaimDaily={handleClaimDaily}
        claimLoading={claimLoading}
        tasks={tasks}
        completedTaskCount={completedTaskCount}
        nextBadge={nextBadge}
        stepsPercent={stepsPercent}
        playPercent={playPercent}
      />

      <StatusPopup
        open={popup.open}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}