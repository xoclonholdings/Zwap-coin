import React from "react";
import { Flame, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardDailyLoopCard({
  streak = 0,
  canClaim = true,
  reward = 10,
  lastClaimText,
  onClaim,
  claimLoading = false,
}) {
  return (
    <div className="rounded-[1.5rem] border border-orange-400/15 bg-gradient-to-br from-orange-500/10 via-pink-500/6 to-transparent p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-orange-300/80">
            Daily Loop
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            {canClaim ? `+${reward} zPts ready` : "Claimed for today"}
          </h2>

          <p className="mt-1 text-sm text-gray-300">
            {canClaim
              ? `Day ${Math.max(streak, 0) + 1} reward is waiting`
              : lastClaimText || "Come back tomorrow to continue your streak"}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10">
          <Gift className="h-5 w-5 text-orange-300" />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-3 py-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-300" />
          <div>
            <p className="text-[10px] text-gray-500">Streak</p>
            <p className="text-lg font-bold text-white">{streak} days</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-gray-500">Next Bonus</p>
          <p className="text-lg font-bold text-amber-300">Day 7</p>
        </div>
      </div>

      <Button
        onClick={onClaim}
        disabled={!canClaim || claimLoading}
        className={`h-11 w-full rounded-xl font-semibold ${
          canClaim
            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-400 hover:to-pink-400"
            : "bg-white/[0.06] text-gray-400"
        }`}
      >
        {claimLoading
          ? "Claiming..."
          : canClaim
            ? "Claim Daily Reward"
            : "Already Claimed"}
      </Button>
    </div>
  );
}