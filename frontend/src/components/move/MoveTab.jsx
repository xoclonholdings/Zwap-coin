import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp, TIERS } from "@/App";
import api from "@/lib/api";
import { toast } from "sonner";

import MoveHome from "@/components/move/MoveHome";
import MoveRewardsFeedback from "@/components/move/MoveRewardsFeedback";

const DEFAULT_STEP_GOAL = 10000;
const MILES_PER_STEP = 0.00045;

function formatPace(secondsPerMile) {
  if (!Number.isFinite(secondsPerMile) || secondsPerMile <= 0) return "--";

  const totalSeconds = Math.round(secondsPerMile);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return `${mins}:${String(secs).padStart(2, "0")} / mi`;
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

  const stepGoal = Math.max(Number(user?.step_goal) || DEFAULT_STEP_GOAL, 1);

  const calculateRewards = useCallback(
    (stepCount) => {
      let base;
      if (stepCount < 1000) base = stepCount * 0.02;
      else if (stepCount < 5000) base = 20 + (stepCount - 1000) * 0.03;
      else if (stepCount < 10000) base = 140 + (stepCount - 5000) * 0.04;
      else base = 340 + (stepCount - 10000) * 0.05;

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

  const handleToggleTracking = async () => {
    if (isTracking) {
      setIsTracking(false);
      toast.success("Session stopped");
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
    toast.success("Session started");
  };

  const handleClaim = async () => {
    if (!hasWallet || steps === 0 || isTracking) return;

    setIsClaiming(true);

    try {
      const result = await api.claimStepRewards(walletAddress, steps);

      setRewardFeedback({
        reward: {
          amount: Number(result?.rewards_earned || potentialReward || 0),
          currency: "zPts",
          message: result?.message || "Rewards added to your balance.",
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
      setSteps(0);
      setSessionSeconds(0);
      setPotentialReward(0);
    } catch (error) {
      toast.error(error?.message || "Failed to record rewards");
    } finally {
      setIsClaiming(false);
    }
  };

  const progressPercent = Math.min((steps / stepGoal) * 100, 100);
  const remainingSteps = Math.max(stepGoal - steps, 0);

  const distanceMiles = steps * MILES_PER_STEP;
  const calories = Math.round(distanceMiles * 80);

  const pace =
    steps < 20 || sessionSeconds < 30 || distanceMiles <= 0
      ? "--"
      : formatPace(sessionSeconds / distanceMiles);

  return (
    <>
      <MoveRewardsFeedback
        reward={rewardFeedback?.reward || null}
        milestone={rewardFeedback?.milestone || null}
        streak={rewardFeedback?.streak || null}
        onDismiss={() => setRewardFeedback(null)}
      />

      <MoveHome
        isPlus={isPlus}
        steps={steps}
        stepGoal={stepGoal}
        progressPercent={progressPercent}
        remainingSteps={remainingSteps}
        sessionSeconds={sessionSeconds}
        isTracking={isTracking}
        isClaiming={isClaiming}
        potentialReward={potentialReward}
        hasWallet={hasWallet}
        pace={pace}
        distanceMiles={distanceMiles}
        calories={calories}
        onToggleTracking={handleToggleTracking}
        onClaim={handleClaim}
      />
    </>
  );
}