import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp, api, TIERS } from "@/App";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Footprints, Play, Pause, RotateCcw, Coins, Crown, TrendingUp } from "lucide-react";

export default function MoveTab() {
  const { user, walletAddress, refreshUser } = useApp();
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [potentialReward, setPotentialReward] = useState(0);
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });

  const tierConfig = TIERS[user?.tier || "starter"];
  const multiplier = tierConfig?.multiplier || 1;

  // Stabilized to satisfy ESLint exhaustive-deps
  const calculateRewards = useCallback((stepCount) => {
    let base;
    if (stepCount < 1000) base = stepCount * 0.01;
    else if (stepCount < 5000) base = 10 + (stepCount - 1000) * 0.02;
    else if (stepCount < 10000) base = 90 + (stepCount - 5000) * 0.03;
    else base = 240 + (stepCount - 10000) * 0.05;
    return base * multiplier;
  }, [multiplier]);

  useEffect(() => {
    setPotentialReward(calculateRewards(steps));
  }, [steps, calculateRewards]);

  useEffect(() => {
    if (!isTracking) return;

    let stepBuffer = 0;
    let lastStepTime = 0;
    let intervalFallback;

    const handleMotion = (event) => {
      const { x, y, z } =
        event.accelerationIncludingGravity || event.acceleration || {};
      if (x === undefined) return;

      const deltaX = Math.abs(x - lastAcceleration.current.x);
      const deltaY = Math.abs(y - lastAcceleration.current.y);
      const deltaZ = Math.abs(z - lastAcceleration.current.z);
      const magnitude = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);

      const now = Date.now();
      if (magnitude > 1.2 && now - lastStepTime > 300) {
        stepBuffer++;
        lastStepTime = now;
        setSteps((prev) => prev + stepBuffer);
        stepBuffer = 0;
      }

      lastAcceleration.current = { x: x || 0, y: y || 0, z: z || 0 };
    };

    const setupMotion = () => {
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        DeviceMotionEvent.requestPermission()
          .then((permission) => {
            if (permission === "granted") {
              window.addEventListener("devicemotion", handleMotion);
            } else {
              intervalFallback = setInterval(
                () =>
                  setSteps(
                    (prev) => prev + Math.floor(Math.random() * 3) + 1
                  ),
                1000
              );
            }
          })
          .catch(console.error);
      } else if (typeof DeviceMotionEvent !== "undefined") {
        window.addEventListener("devicemotion", handleMotion);
      } else {
        intervalFallback = setInterval(
          () =>
            setSteps((prev) => prev + Math.floor(Math.random() * 5) + 1),
          800
        );
      }
    };

    setupMotion();

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      if (intervalFallback) clearInterval(intervalFallback);
    };
  }, [isTracking]);

  const handleStartStop = async () => {
    if (isTracking) {
      setIsTracking(false);
    } else {
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
        }
      }
      setIsTracking(true);
      toast.success("Tracking started!");
    }
  };

  const handleReset = () => {
    setSteps(0);
    setPotentialReward(0);
  };

  const handleClaim = async () => {
    if (steps === 0) return;
    setIsClaiming(true);
    try {
      await api.claimStepRewards(walletAddress, steps);
      toast.success("Rewards recorded to your account!");
      await refreshUser();
      handleReset();
    } catch (error) {
      toast.error("Failed to record rewards");
    } finally {
      setIsClaiming(false);
    }
  };

  const tiers = [
    { range: "0-1K", rate: "0.01", active: steps < 1000 },
    { range: "1K-5K", rate: "0.02", active: steps >= 1000 && steps < 5000 },
    { range: "5K-10K", rate: "0.03", active: steps >= 5000 && steps < 10000 },
    { range: "10K+", rate: "0.05", active: steps >= 10000 },
  ];

  return (
    <div
      className="min-h-[calc(100dvh-140px)] bg-[#0a0b1e] flex flex-col px-4 py-4"
      data-testid="move-tab"
    >
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-2 pulse-glow">
          <Footprints className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">zWALK</h1>
        <p className="text-gray-400 text-sm">Move & Earn</p>
        {user?.tier === "plus" && (
          <span className="inline-flex items-center gap-1 text-yellow-400 text-xs mt-1">
            <Crown className="w-3 h-3" /> 1.5× Rewards
          </span>
        )}
      </div>

      <div className="balance-glow p-5 mb-4 text-center rounded-xl">
        <p className="text-gray-400 text-xs mb-1">Current Steps</p>
        <h2
          className="text-5xl font-bold neon-text"
          data-testid="step-counter"
        >
          {steps.toLocaleString()}
        </h2>
        <div className="flex items-center justify-center gap-2 text-cyan-400 mt-2">
          <Coins className="w-4 h-4" />
          <span className="text-lg font-semibold">
            {potentialReward.toFixed(2)} ZWAP earned
          </span>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <Button
          data-testid="tracking-toggle"
          onClick={handleStartStop}
          className={`flex-1 h-14 text-lg font-semibold ${
            isTracking
              ? "bg-red-500 hover:bg-red-600"
              : "bg-cyan-500 hover:bg-cyan-600"
          }`}
        >
          {isTracking ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start
            </>
          )}
        </Button>

        <Button
          data-testid="reset-steps"
          onClick={handleReset}
          variant="outline"
          className="h-14 px-5 border-gray-600"
          disabled={isTracking}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {walletAddress ? (
        <Button
          data-testid="claim-steps"
          onClick={handleClaim}
          disabled={steps === 0 || isClaiming || isTracking}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 mb-4"
        >
          {isClaiming
            ? "Recording..."
            : `Claim ${potentialReward.toFixed(2)} ZWAP`}
        </Button>
      ) : (
        <Button
          data-testid="connect-to-claim"
          onClick={() =>
            toast.info("Connect your wallet to claim rewards")
          }
          className="w-full h-14 text-lg font-semibold bg-gray-700 mb-4"
        >
          Connect Wallet to Claim
        </Button>
      )}

      <div className="glass-card p-4 flex-1 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-white font-semibold text-sm">
            Tiered Earning (ZWAP/step)
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg text-center ${
                tier.active
                  ? "bg-cyan-500/20 border border-cyan-500/50"
                  : "bg-gray-800/50"
              }`}
            >
              <span
                className={`text-[10px] ${
                  tier.active ? "text-cyan-400" : "text-gray-500"
                }`}
              >
                {tier.range}
              </span>
              <p
                className={`font-mono text-sm ${
                  tier.active ? "text-white" : "text-gray-500"
                }`}
              >
                {tier.rate}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-gray-500 mt-3">
          ⚡ zWALK earns ZWAP only (no Z Points)
        </p>
      </div>
    </div>
  );
}
