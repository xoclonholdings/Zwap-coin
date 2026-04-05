import React from "react";
import { Footprints } from "lucide-react";

import MoveCoreMovementCard from "@/components/move/MoveCoreMovementCard";
import MoveStatsCard from "@/components/move/MoveStatsCard";

export default function MoveHome({
  isPlus,
  steps,
  stepGoal,
  progressPercent,
  remainingSteps,
  sessionSeconds,
  isTracking,
  isClaiming,
  potentialReward,
  hasWallet,
  pace,
  distanceMiles,
  calories,
  onToggleTracking,
  onReset,
  onClaim,
  onConnectWallet,
}) {
  return (
    <div
      className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white"
      data-testid="move-tab"
    >
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_35%),linear-gradient(180deg,rgba(8,22,32,0.96),rgba(4,12,18,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">
                  Move
                </p>

                <div className="rounded-xl border border-amber-400/25 bg-[linear-gradient(180deg,rgba(251,191,36,0.18),rgba(251,191,36,0.08))] px-2.5 py-1 text-[11px] font-medium text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.10)]">
                  {isPlus ? "Zitizen" : "Zwapper"}
                </div>
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Move & Earn
              </h1>

              <p className="mt-1 text-sm text-cyan-50/65">
                Walk, build momentum, and stack progress.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/25 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.22),rgba(34,211,238,0.10))] shadow-[0_0_24px_rgba(34,211,238,0.14)]">
              <Footprints className="h-5 w-5 text-cyan-300" />
            </div>
          </div>
        </div>

        <MoveCoreMovementCard
          isTracking={isTracking}
          sessionSeconds={sessionSeconds}
          steps={steps}
          stepGoal={stepGoal}
          progressPercent={progressPercent}
          remainingSteps={remainingSteps}
          potentialReward={potentialReward}
          isClaiming={isClaiming}
          hasWallet={hasWallet}
          pace={pace}
          onToggleTracking={onToggleTracking}
          onReset={onReset}
          onClaim={onClaim}
          onConnectWallet={onConnectWallet}
        />

        <MoveStatsCard
          steps={steps}
          distanceMiles={distanceMiles}
          calories={calories}
        />
      </div>
    </div>
  );
}