import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export default function PlayFinalSummary({
  finalResult,
  currentGameData,
  currentTheme,
  isPlus,
  rewardPopup,
  onDone,
  onPlayAgain,
  onDismissReward,
}) {
  return (
    <div className="min-h-[calc(100dvh-140px)] bg-[#081017] px-4 py-4 text-white">
      <div className="mx-auto w-full max-w-md space-y-4">
        <div
          className={`rounded-[28px] border border-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${currentTheme.shell}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                Session Complete
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {currentGameData?.name}
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Final totals from your run.
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${currentTheme.icon}`}
            >
              <Trophy className="h-5 w-5" />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                Total score
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {finalResult?.score ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-wide text-white/45">
                Rounds
              </p>
              <p className="mt-2 text-2xl font-semibold text-cyan-300">
                {finalResult?.roundsPlayed ?? 0}
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-[24px] border border-white/8 bg-black/20 p-4">
            <div className="space-y-3">
              {finalResult?.roundScores?.map((value, index) => (
                <div
                  key={`${index}-${value}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-white/55">Round {index + 1}</span>
                  <span className="font-medium text-white">{value}</span>
                </div>
              ))}

              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/55">zPts Earned</span>
                  <span className="font-medium text-cyan-300">
                    {finalResult?.zpts_earned || 0}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-white/55">ZWAP Earned</span>
                  <span className="font-medium text-violet-300">
                    {finalResult?.zwap_earned || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onDone}
              className="h-12 flex-1 rounded-2xl bg-white/10 text-white hover:bg-white/15"
            >
              Done
            </Button>

            <Button
              onClick={onPlayAgain}
              className={`h-12 flex-1 rounded-2xl bg-gradient-to-r ${currentTheme.button} text-[#081017]`}
            >
              Play Again
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {rewardPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-[320px] rounded-[28px] border p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.4)] ${currentTheme.shell}`}
            >
              <h2 className="text-lg font-semibold text-white">
                {isPlus ? "Bonus Reward" : "Session Reward"}
              </h2>

              <p className="mt-4 text-3xl font-semibold text-violet-300">
                +{rewardPopup.zwap_earned || 0} ZWAP
              </p>

              <p className="mt-2 text-base text-cyan-300">
                +{rewardPopup.zpts_earned || 0} zPts
              </p>

              {isPlus && (
                <p className="mt-3 text-xs text-violet-200/80">
                  Plus multiplier applied
                </p>
              )}

              <Button
                onClick={onDismissReward}
                className={`mt-5 h-12 w-full rounded-2xl bg-gradient-to-r ${currentTheme.button} text-[#081017]`}
              >
                Continue
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}