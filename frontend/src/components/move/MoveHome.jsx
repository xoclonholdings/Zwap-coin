import React from "react";
import { motion } from "framer-motion";
import { Footprints, TimerReset, TrendingUp } from "lucide-react";

import MoveCoreMovementCard from "@/components/move/MoveCoreMovementCard";

export default function MoveHome({
  user,
  isPlus,
  multiplier,
  dailyZptsCap,
  dailyZptsEarned,
  steps,
  stepGoal,
  progressPercent,
  remainingSteps,
  sessionSeconds,
  isTracking,
  isClaiming,
  potentialReward,
  paceZone,
  tiers,
  hasWallet,
  onStartStop,
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
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.14),_transparent_30%),linear-gradient(180deg,rgba(4,20,20,0.96),rgba(5,18,17,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                  Move
                </p>

                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                  {isPlus ? "Plus" : "Starter"}
                </div>
              </div>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Move & Earn
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Steps, streaks, and reward flow.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <Footprints className="h-5 w-5 text-cyan-300" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                ZWAP
              </p>
              <p className="mt-1 text-sm font-medium text-cyan-300">
                {Number(user?.zwap_balance ?? 0).toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                zPts
              </p>
              <p className="mt-1 text-sm font-medium text-violet-300">
                {user?.zpts_balance ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-white/45">
                Daily zPts
              </p>
              <p className="mt-1 text-sm font-medium text-white/85">
                {dailyZptsEarned}/{dailyZptsCap}
              </p>
            </div>
          </div>
        </div>

        <MoveCoreMovementCard
          isTracking={isTracking}
          sessionSeconds={sessionSeconds}
          multiplier={multiplier}
          isPlus={isPlus}
          steps={steps}
          stepGoal={stepGoal}
          progressPercent={progressPercent}
          remainingSteps={remainingSteps}
          potentialReward={potentialReward}
          paceZone={paceZone}
          isClaiming={isClaiming}
          hasWallet={hasWallet}
          onStartStop={onStartStop}
          onReset={onReset}
          onClaim={onClaim}
          onConnectWallet={onConnectWallet}
        />

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
                <motion.div
                  key={tier.range}
                  whileTap={{ scale: 0.98 }}
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
                </motion.div>
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
          MOVE rewards are claimed as ZWAP, not zPts.
        </p>
      </div>
    </div>
  );
}