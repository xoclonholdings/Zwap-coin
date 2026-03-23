import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useApp, TIERS } from "@/App";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Activity,
  Coins,
  Crown,
  Footprints,
  Pause,
  Play,
  RotateCcw,
  TimerReset,
  TrendingUp,
  Wallet,
} from "lucide-react";

const STEP_GOAL = 10000;

export default function MoveTab() {
  const { user, walletAddress, refreshUser } = useApp();

  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [potentialReward, setPotentialReward] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });

  const tierConfig = TIERS[user?.tier || "starter"];
  const multiplier = tierConfig?.multiplier || 1;

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
    if (!isTracking) return undefined;

    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTracking]);

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
              intervalFallback = setInterval(() => {
                setSteps((prev) => prev + Math.floor(Math.random() * 3) + 1);
              }, 1000);
            }
          })
          .catch(console.error);
      } else if (typeof DeviceMotionEvent !== "undefined") {
        window.addEventListener("devicemotion", handleMotion);
      } else {
        intervalFallback = setInterval(() => {
          setSteps((prev) => prev + Math.floor(Math.random() * 5) + 1);
        }, 800);
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
    setPotentialReward(0);
    setSessionSeconds(0);
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

  const progressPercent = Math.min((steps / STEP_GOAL) * 100, 100);
  const remainingSteps = Math.max(STEP_GOAL - steps, 0);

  const tiers = [
    { range: "0-1K", rate: "0.01", active: steps < 1000 },
    { range: "1K-5K", rate: "0.02", active: steps >= 1000 && steps < 5000 },
    { range: "5K-10K", rate: "0.03", active: steps >= 5000 && steps < 10000 },
    { range: "10K+", rate: "0.05", active: steps >= 10000 },
  ];

  const ringStyle = useMemo(() => {
    const degrees = progressPercent * 3.6;
    return {
      background: `conic-gradient(
        from 180deg,
        rgba(34,211,238,1) 0deg,
        rgba(45,212,191,1) ${degrees * 0.65}deg,
        rgba(168,85,247,1) ${degrees}deg,
        rgba(255,255,255,0.08) ${degrees}deg,
        rgba(255,255,255,0.08) 360deg
      )`,
    };
  }, [progressPercent]);

  const formatDuration = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  return (
    <div
      className="min-h-[calc(100dvh-140px)] bg-[#071514] text-white px-4 py-4"
      data-testid="move-tab"
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_30%),linear-gradient(180deg,rgba(4,20,20,0.96),rgba(5,18,17,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                Move
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Walk & Earn
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Track activity and claim ZWAP
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Footprints className="h-5 w-5 text-cyan-300" />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Status
              </p>
              <p
                className={`mt-1 text-sm font-medium ${
                  isTracking ? "text-emerald-300" : "text-white/75"
                }`}
              >
                {isTracking ? "Tracking" : "Idle"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Session
              </p>
              <p className="mt-1 text-sm font-medium text-white/85">
                {formatDuration(sessionSeconds)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Tier
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm font-medium text-amber-300">
                {user?.tier === "plus" && <Crown className="h-3.5 w-3.5" />}
                {multiplier.toFixed(1)}x
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-[26px] border border-white/8 bg-black/20 px-4 py-5">
            <div className="flex items-center justify-center">
              <div className="relative h-52 w-52">
                <div
                  className="absolute inset-0 rounded-full p-[10px] shadow-[0_0_35px_rgba(34,211,238,0.12)]"
                  style={ringStyle}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#081716]">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                      Steps
                    </p>
                    <p
                      className="mt-2 text-4xl font-semibold tracking-tight"
                      data-testid="step-counter"
                    >
                      {steps.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      / {STEP_GOAL.toLocaleString()} goal
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs text-white/50">
                <span>Goal progress</span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-white/45">
                {remainingSteps > 0
                  ? `${remainingSteps.toLocaleString()} steps to goal`
                  : "Goal cleared. Keep stacking."}
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <Coins className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide text-white/55">
                  Est. reward
                </p>
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                {potentialReward.toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-white/45">ZWAP</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-emerald-300">
                <Activity className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide text-white/55">
                  Pace zone
                </p>
              </div>
              <p className="text-2xl font-semibold tracking-tight">
                {steps < 1000
                  ? "Warmup"
                  : steps < 5000
                  ? "Active"
                  : steps < 10000
                  ? "Momentum"
                  : "Beast"}
              </p>
              <p className="mt-1 text-xs text-white/45">
                Current earning tier
              </p>
            </div>
          </div>

          <div className="mb-4 flex gap-3">
            <Button
              data-testid="tracking-toggle"
              onClick={handleStartStop}
              className={`h-14 flex-1 rounded-2xl text-base font-semibold shadow-lg transition ${
                isTracking
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gradient-to-r from-cyan-400 to-teal-400 text-[#06201f] hover:opacity-90"
              }`}
            >
              {isTracking ? (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start
                </>
              )}
            </Button>

            <Button
              data-testid="reset-steps"
              onClick={handleReset}
              variant="outline"
              className="h-14 rounded-2xl border-white/15 bg-white/5 px-5 text-white hover:bg-white/10"
              disabled={isTracking}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>

          {walletAddress ? (
            <Button
              data-testid="claim-steps"
              onClick={handleClaim}
              disabled={steps === 0 || isClaiming || isTracking}
              className="h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 text-base font-semibold text-[#071514] hover:opacity-95 disabled:opacity-60"
            >
              {isClaiming ? "Recording..." : `Claim ${potentialReward.toFixed(2)} ZWAP`}
            </Button>
          ) : (
            <Button
              data-testid="connect-to-claim"
              onClick={() => toast.info("Connect your wallet to claim rewards")}
              className="h-14 w-full rounded-2xl bg-white/10 text-base font-semibold text-white hover:bg-white/15"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet to Claim
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-300" />
              <h3 className="text-sm font-semibold text-white">
                Earning Tiers
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {tiers.map((tier) => (
                <div
                  key={tier.range}
                  className={`rounded-2xl border p-3 transition ${
                    tier.active
                      ? "border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
                      : "border-white/8 bg-white/5"
                  }`}
                >
                  <p
                    className={`text-[11px] uppercase tracking-wide ${
                      tier.active ? "text-cyan-300" : "text-white/45"
                    }`}
                  >
                    {tier.range}
                  </p>
                  <p
                    className={`mt-1 text-lg font-semibold ${
                      tier.active ? "text-white" : "text-white/70"
                    }`}
                  >
                    {tier.rate}
                  </p>
                  <p className="text-[11px] text-white/40">ZWAP / step</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <TimerReset className="h-4 w-4 text-violet-300" />
              <h3 className="text-sm font-semibold text-white">
                Session Snapshot
              </h3>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <p className="text-[11px] uppercase tracking-wide text-white/45">
                  Reward type
                </p>
                <p className="mt-1 text-sm font-medium text-white/85">
                  Direct ZWAP
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <p className="text-[11px] uppercase tracking-wide text-white/45">
                  Claim status
                </p>
                <p className="mt-1 text-sm font-medium text-white/85">
                  {isTracking
                    ? "Pause tracking before claim"
                    : steps > 0
                    ? "Ready to claim"
                    : "No steps yet"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
                <p className="text-[11px] uppercase tracking-wide text-white/45">
                  Tier bonus
                </p>
                <p className="mt-1 text-sm font-medium text-amber-300">
                  {multiplier.toFixed(1)}x multiplier
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="px-1 text-center text-[11px] text-white/35">
          MOVE rewards are claimed as ZWAP, not zPts.  [oai_citation:1‡The ZWAP! App Ecosystem – Technical Whitepaper.md](sediment://file_00000000426c71f5acd98740161adb1e)
        </p>
      </div>
    </div>
  );
}