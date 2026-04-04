import React from "react";
import { Flame, Gift, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardDailyLoopCard({
  streak = 0,
  canClaim = true,
  reward = 10,
  lastClaimText,
  onClaim,
  claimLoading = false,
}) {
  const safeStreak = Math.max(Number(streak) || 0, 0);
  const today = new Date().getDay();
  const labels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="rounded-[1.5rem] border border-orange-400/15 bg-gradient-to-r from-orange-500/10 via-pink-500/5 to-transparent p-4 backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10">
            <Flame className="h-4 w-4 text-orange-300" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">Daily Streak</p>
            <p className="mt-1 text-[11px] text-gray-400">
              Come back daily. Stack the heat.
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-black leading-none text-orange-300">
            {safeStreak}
          </p>
          <p className="mt-1 text-[10px] text-gray-500">days</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-7 gap-2">
        {labels.map((label, index) => {
          const isToday = index === today;
          const isActive = index < Math.min(safeStreak, 7);
          const isBonus = index === 6;

          return (
            <div key={`${label}-${index}`} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-[11px] font-bold transition-all ${
                  isToday
                    ? "border-cyan-400/40 bg-cyan-500/12 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                    : isActive
                      ? isBonus
                        ? "border-amber-400/35 bg-amber-500/12 text-amber-300"
                        : "border-orange-400/20 bg-orange-500/10 text-orange-300"
                      : "border-white/10 bg-white/[0.03] text-gray-500"
                }`}
              >
                {isBonus ? <Crown className="h-4 w-4" /> : <span>{label}</span>}
              </div>

              <p
                className={`text-[10px] ${
                  isToday
                    ? "text-cyan-300"
                    : isActive
                      ? "text-white"
                      : "text-gray-500"
                }`}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-300/80">
              Daily Claim
            </p>

            <h3 className="mt-2 text-base font-bold text-white">
              {canClaim ? `+${reward} zPts ready` : "Claimed for today"}
            </h3>

            <p className="mt-1 text-[11px] text-gray-400">
              {canClaim
                ? `Day ${Math.max(safeStreak, 0) + 1} reward is waiting.`
                : lastClaimText || "Your next daily claim unlocks tomorrow."}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10">
            <Gift className="h-4 w-4 text-emerald-300" />
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              Current streak
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {safeStreak} days
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              Next bonus
            </p>
            <p className="mt-1 text-sm font-semibold text-amber-300">Day 7</p>
          </div>
        </div>

        <Button
          onClick={onClaim}
          disabled={!canClaim || claimLoading}
          className={`h-11 w-full rounded-xl font-semibold ${
            canClaim
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400"
              : "bg-white/[0.06] text-gray-400 hover:bg-white/[0.06]"
          }`}
        >
          {claimLoading
            ? "Claiming..."
            : canClaim
              ? "Claim Daily Reward"
              : "Already Claimed"}
        </Button>
      </div>
    </div>
  );
}