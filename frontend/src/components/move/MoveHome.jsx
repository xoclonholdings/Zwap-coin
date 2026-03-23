import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useApp, TIERS } from "@/App";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Footprints,
  Crown,
  Coins,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Activity,
  Wallet,
  Sparkles,
} from "lucide-react";

const STEP_GOAL = 10000;

export default function MoveHome() {
  const { user, walletAddress, refreshUser } = useApp();

  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [potentialReward, setPotentialReward] = useState(0);

  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });

  const tierConfig = TIERS[user?.tier || "starter"];
  const multiplier = tierConfig?.multiplier || 1;

  // ---------------------------------
  // Reward Preview (UI only)
  // ---------------------------------
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

  // ---------------------------------
  // Timer
  // ---------------------------------
  useEffect(() => {
    if (!isTracking) return;
    const timer = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTracking]);

  // ---------------------------------
  // Motion Tracking
  // ---------------------------------
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

  // ---------------------------------
  // Controls
  // ---------------------------------
  const handleStartStop = async () => {
    if (isTracking) {
      setIsTracking(false);
      return;
    }

    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission !== "granted") {
        toast.error("Motion permission required");
        return;
      }
    }

    setIsTracking(true);
  };

  const handleReset = () => {
    setSteps(0);
    setSessionSeconds(0);
    setPotentialReward(0);
  };

  const handleClaim = async () => {
    if (!walletAddress || steps === 0) return;

    setIsClaiming(true);
    try {
      await api.claimStepRewards(walletAddress, steps);
      toast.success("ZWAP added to your balance");
      await refreshUser();
      handleReset();
    } catch {
      toast.error("Claim failed");
    } finally {
      setIsClaiming(false);
    }
  };

  // ---------------------------------
  // Derived
  // ---------------------------------
  const progress = Math.min((steps / STEP_GOAL) * 100, 100);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  // ---------------------------------
  // UI
  // ---------------------------------
  return (
    <div className="min-h-screen bg-[#050510] text-white px-4 py-4">
      <div className="max-w-md mx-auto space-y-4">

        {/* HERO */}
        <div className="rounded-[28px] p-4 border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-cyan-300 uppercase tracking-widest">
                MOVE
              </p>
              <h1 className="text-2xl font-bold mt-1">Move & Earn</h1>
              <p className="text-sm text-gray-400">
                Steps, streaks, and reward flow
              </p>
            </div>

            <div className="flex items-center gap-1 text-amber-300">
              {user?.tier === "plus" && <Crown size={14} />}
              {multiplier.toFixed(1)}x
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="ZWAP" value={user?.zwap_balance || 0} />
          <Stat label="zPts" value={user?.z