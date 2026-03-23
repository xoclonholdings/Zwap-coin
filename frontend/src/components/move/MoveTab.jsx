import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp, TIERS } from "@/App";
import api from "@/lib/api";
import { toast } from "sonner";

import MoveHome from "@/components/move/MoveHome";
import MoveRewardsFeedback from "@/components/move/MoveRewardsFeedback";

const DEFAULT_STEP_GOAL = 10000;

function getTierDailyZptsCap(tierConfig) {
  return tierConfig?.daily_zpts_cap ?? tierConfig?.dailyZptsCap ?? 75;
}

export default function MoveTab() {
  const { user, walletAddress, refreshUser } = useApp();

  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [potentialReward, setPotentialReward] = useState(0);
  const [rewardFeedback, setRewardFeedback] = useState(null);

  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });

  const tierKey = user?.tier || "starter";
  const tierConfig = TIERS[tierKey];
  const multiplier = tierConfig?.multiplier || 1;
  const isPlus = tierKey === "plus";
  const hasWallet = Boolean(walletAddress);

  const dailyZptsCap = getTierDailyZptsCap(tierConfig);
  const dailyZptsEarned = Number(user?.daily_zpts_earned || 0);
  const stepGoal = Math.max(Number(user?.step_goal) || DEFAULT_STEP_GOAL, 1);

  const calculateRewards = useCallback(
    (stepCount) => {
      let base;
      if (stepCount < 1000) base = stepCount * 0.01;
      else if (stepCount < 5000) base = 10 + (stepCount - 1000) * 0.02;
      else if (stepCount < 10000) base = 90 + (stepCount - 5000) * 0.03;
      else base = 240 + (stepCount - 10000) * 0.05;
      return base * multiplier;
    },
    [multiplier]
  );

  useEffect(() => {
    setPotentialReward(calculateRewards(steps));
  }, [steps, calculateRewards]);

  useEffect(() => {
    if (!isTracking) return;

    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTracking]);

  useEffect(() => {
    if (!isTracking) return;

    let lastStepTime = 0;

    const handleMotion = (event) => {
      const { x, y, z } =
        event.accelerationIncludingGravity || event.acceleration || {};

      if (x === undefined) return;

      const dx = Math.abs(x - lastAcceleration.current.x);
      const dy = Math.abs(y - lastAcceleration.current.y);
      const dz = Math.abs(z - lastAcceleration.current.z);
      const magnitude = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
      const now = Date.now();

      if (magnitude > 1.2 && now - lastStepTime > 300) {
        setSteps((prev) => prev + 1);
        lastStepTime = now;
      }

      lastAcceleration.current = { x: x || 0, y: y || 0, z: z || 0 };
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [isTracking]);

  const handleStartStop = async () => {
    if (isTracking) {
      setIsTracking(false);
      toast.success("Tracking paused");
      return;
    }

    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== "granted") {
          toast.error("Motion permission required");
          return;
        }
      } catch (error) {
        console.error(error);
        toast.error("Unable to access motion sensors");
        return;
      }
    }

    setIsTracking(true);
    toast.success("Tracking started!");
  };

  const handleReset = () => {
    setSteps(0);
    setSessionSeconds(0);
    setPotentialReward(0);
  };

  const handleClaim = async () => {
    if (!hasWallet || steps === 0) return;

    setIsClaiming(true);
    try {
      const result = await api.claimStepRewards(walletAddress, steps);

      setRewardFeedback({
        reward: {
          amount: Number(result?.rewards_earned || potentialReward || 0),
          currency: "ZWAP",
          message: result?.message || "ZWAP added to your balance.",
        },
        milestone:
          steps >= stepGoal
            ? {
                title: "Goal cleared",
                message: `${steps.toLocaleString()} steps completed this session.`,
                steps,
              }
            : null,
        streak: null,
      });

      toast.success(result?.message || "Rewards recorded to your account!");
      await refreshUser();
      handleReset();
    } catch (error) {
      toast.error(error?.message || "Failed to record rewards");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleConnectWallet = () => {
    toast.info("Connect your wallet to claim rewards");
  };

  const progressPercent = Math.min((steps / stepGoal) * 100, 100);
  const remainingSteps = Math.max(stepGoal - steps, 0);

  const paceZone =
    steps < 1000
      ? "Warmup"
      : steps < 5000
      ? "Active"
      : steps < 10000
      ? "Momentum"
      : "Beast";

  const tiers = [
    { range: "0-1K", rate: "0.01", active: steps < 1000 },
    { range: "1K-5K", rate: "0.02", active: steps >= 1000 && steps < 5000 },
    { range: "5K-10K", rate: "0.03", active: steps >= 5000 && steps < 10000 },
    { range: "10K+", rate: "0.05", active: steps >= 10000 },
  ];

  return (
    <>
      <MoveRewardsFeedback
        reward={rewardFeedback?.reward || null}
        milestone={rewardFeedback?.milestone || null}
        streak={rewardFeedback?.streak || null}
        onDismiss={() => setRewardFeedback(null)}
      />

      <MoveHome
        user={user}
        isPlus={isPlus}
        multiplier={multiplier}
        dailyZptsCap={dailyZptsCap}
        dailyZptsEarned={dailyZptsEarned}
        steps={steps}
        stepGoal={stepGoal}
        progressPercent={progressPercent}
        remainingSteps={remainingSteps}
        sessionSeconds={sessionSeconds}
        isTracking={isTracking}
        isClaiming={isClaiming}
        potentialReward={potentialReward}
        paceZone={paceZone}
        tiers={tiers}
        hasWallet={hasWallet}
        onStartStop={handleStartStop}
        onReset={handleReset}
        onClaim={handleClaim}
        onConnectWallet={handleConnectWallet}
      />
    </>
  );
}