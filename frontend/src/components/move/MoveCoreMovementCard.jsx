import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Coins, RotateCcw, Wallet } from "lucide-react";

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function MoveCoreMovementCard({
  isTracking,
  sessionSeconds,
  steps,
  stepGoal,
  progressPercent,
  remainingSteps,
  potentialReward,
  isClaiming,
  hasWallet,
  pace,
  onToggleTracking,
  onReset,
  onClaim,
  onConnectWallet,
}) {
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
            {isTracking ? "Active" : "Idle"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-white/45">
            Timer
          </p>
          <p className="mt-1 text-sm font-medium text-white/85">
            {formatDuration(sessionSeconds)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-white/45">
            Pace
          </p>
          <p className="mt-1 text-sm font-medium text-cyan-300">
            {pace}
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-[24px] border border-white/8 bg-black/20 px-4 py-5">
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onToggleTracking}
            className="group relative h-56 w-56 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
            aria-label={isTracking ? "Stop walking session" : "Start walking session"}
          >
            <div
              className="absolute inset-0 rounded-full p-[10px] shadow-[0_0_35px_rgba(34,211,238,0.12)] transition-transform duration-200 group-active:scale-[0.98]"
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

                <div
                  className={`mt-4 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    isTracking
                      ? "bg-red-500/20 text-red-300"
                      : "bg-cyan-400/15 text-cyan-300"
                  }`}
                >
                  {isTracking ? "Stop" : "Start"}
                </div>
              </div>
            </div>
          </button>
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

      <div className="mb-4 rounded-2xl border border-white/8 bg-white/5 p-4">
        <div className="mb-3 flex items-center gap-2 text-cyan-300">
          <Coins className="h-4 w-4" />
          <p className="text-xs uppercase tracking-wide text-white/55">
            Est. session reward
          </p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold tracking-tight">
              {potentialReward.toFixed(0)}
            </p>
            <p className="mt-1 text-xs text-white/45">zPts</p>
          </div>

          <Button
            onClick={onReset}
            variant="outline"
            className="h-11 rounded-2xl border-white/15 bg-white/5 px-4 text-white hover:bg-white/10"
            disabled={isTracking || steps === 0}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {hasWallet ? (
        <Button
          onClick={onClaim}
          disabled={steps === 0 || isClaiming || isTracking}
          className="h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-violet-400 text-base font-semibold text-[#071514] hover:opacity-95 disabled:opacity-60"
        >
          {isClaiming ? "Recording..." : `Claim ${potentialReward.toFixed(0)} zPts`}
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