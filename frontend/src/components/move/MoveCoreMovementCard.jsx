import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Coins,
  Crown,
  Pause,
  Play,
  RotateCcw,
  Wallet,
} from "lucide-react";

export default function MoveCoreMovementCard({
  isTracking,
  sessionSeconds,
  multiplier,
  isPlus,
  steps,
  stepGoal,
  progressPercent,
  remainingSteps,
  potentialReward,
  paceZone,
  isClaiming,
  hasWallet,
  onStartStop,
  onReset,
  onClaim,
  onConnectWallet,
}) {
  const formatDuration = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${secs}s`;
  };

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

  return (
    <div className="rounded-[24px] border border-cyan-400/12 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.10),_transparent_32%),linear-gradient(180deg,rgba(8,16,23,0.96),rgba(7,12,18,0.98))] p-4">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/45">
            Core Movement
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Move Session
          </h3>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
          {isTracking ? "Walking" : "Idle"}
        </div>
      </div>

      <p className="mb-4 text-sm text-white/55">
        Move through your day, build momentum, and stack ZWAP rewards.
      </p>

      {/* STATUS ROW */}
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
            {isPlus && <Crown className="h-3.5 w-3.5" />}
            {multiplier.toFixed(1)}x
          </p>
        </div>
      </div>

      {/* STEP RING */}
      <div className="mb-4 rounded-[24px] border border-white/8 bg-black/20 px-4 py-5">
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
                <p className="mt-2 text-4xl font-semibold tracking-tight">
                  {steps.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-white/45">
                  / {stepGoal.toLocaleString()} goal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
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

      {/* REWARD + PACE */}
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
            {paceZone}
          </p>
          <p className="mt-1 text-xs text-white/45">
            Current earning tier
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mb-4 flex gap-3">
        <Button
          onClick={onStartStop}
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
          onClick={onReset}
          variant="outline"
          className="h-14 rounded-2xl border-white/15 bg-white/5 px-5 text-white hover:bg-white/10"
          disabled={isTracking}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* CLAIM */}
      {hasWallet ? (
        <Button
          onClick={onClaim}
          disabled={steps === 0 || isClaiming || isTracking}
          className="h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 text-base font-semibold text-[#071514] hover:opacity-95 disabled:opacity-60"
        >
          {isClaiming
            ? "Recording..."
            : `Claim ${potentialReward.toFixed(2)} ZWAP`}
        </Button>
      ) : (
        <Button
          onClick={onConnectWallet}
          className="h-14 w-full rounded-2xl bg-white/10 text-base font-semibold text-white hover:bg-white/15"
        >
          <Wallet className="mr-2 h-5 w-5" />
          Connect Wallet to Claim
        </Button>
      )}
    </div>
  );
}